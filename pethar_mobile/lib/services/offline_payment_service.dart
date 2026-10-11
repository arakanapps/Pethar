/// PeThar Offline Payment Service
/// 
/// Implements cryptographically signed, replay-resistant, expiry-aware
/// offline vouchers for P2P and P2M payments via NFC and Bluetooth.
///
/// Architecture:
///   1. Online: Device generates Ed25519 keypair, registers pubkey with server
///   2. Issuing: Sender creates signed voucher payload (amount, recipient, expiry, nonce)
///   3. Transport: Voucher transmitted via NFC tap or BLE (Bluetooth Low Energy)
///   4. Redemption: Recipient stores voucher locally, syncs when online
///   5. Settlement: Server validates signature, checks replay, settles ledger
///
/// Security guarantees:
///   - Ed25519 signatures prevent forgery
///   - UUID nonce prevents replay attacks
///   - Expiry timestamp prevents stale vouchers
///   - Monotonic sequence prevents double-spend
///   - Hash chain provides tamper evidence
library;

import 'dart:convert';
import 'dart:typed_data';

/// Voucher status lifecycle
enum VoucherStatus {
  /// Created locally, not yet transmitted
  created,
  /// Transmitted to recipient (NFC/BLE)
  transmitted,
  /// Received by recipient device
  received,
  /// Queued for server settlement
  pendingSync,
  /// Successfully settled on server ledger
  settled,
  /// Expired before redemption
  expired,
  /// Rejected by server (invalid signature, replay, etc.)
  rejected,
}

/// Transport mechanism for offline payment
enum OfflineTransport {
  /// Near Field Communication (tap-to-pay)
  nfc,
  /// Bluetooth Low Energy
  ble,
  /// QR code scan (fallback)
  qrCode,
}

/// Represents a cryptographically signed offline payment voucher.
/// 
/// The canonical payload format for signing is:
///   `{voucherCode}|{senderAccountId}|{recipientIdentifier}|{amount}|{currency}|{nonce}|{expiresAt_iso8601}`
/// 
/// This payload is signed with the sender's Ed25519 private key.
class OfflineVoucher {
  final String voucherCode;
  final String senderAccountId;
  final String recipientIdentifier;
  final double amount;
  final String currency;
  final String nonce;
  final DateTime createdAt;
  final DateTime expiresAt;
  final String senderPublicKey;
  final String signature;
  final int sequenceNumber;
  VoucherStatus status;
  final OfflineTransport? transport;
  final String? chainHash;

  OfflineVoucher({
    required this.voucherCode,
    required this.senderAccountId,
    required this.recipientIdentifier,
    required this.amount,
    required this.currency,
    required this.nonce,
    required this.createdAt,
    required this.expiresAt,
    required this.senderPublicKey,
    required this.signature,
    required this.sequenceNumber,
    this.status = VoucherStatus.created,
    this.transport,
    this.chainHash,
  });

  /// Canonical payload string used for signing/verification
  String get canonicalPayload =>
      '$voucherCode|$senderAccountId|$recipientIdentifier|'
      '${amount.toStringAsFixed(8)}|$currency|$nonce|${expiresAt.toUtc().toIso8601String()}';

  /// Whether this voucher has expired
  bool get isExpired => DateTime.now().toUtc().isAfter(expiresAt.toUtc());

  /// Whether this voucher can still be redeemed
  bool get isRedeemable =>
      !isExpired &&
      (status == VoucherStatus.created ||
       status == VoucherStatus.transmitted ||
       status == VoucherStatus.received);

  /// Serialize to JSON for NFC/BLE transport
  Map<String, dynamic> toTransportJson() => {
        'v': 1, // protocol version
        'vc': voucherCode,
        'sa': senderAccountId,
        'ri': recipientIdentifier,
        'am': amount.toStringAsFixed(8),
        'cu': currency,
        'no': nonce,
        'ca': createdAt.toUtc().toIso8601String(),
        'ea': expiresAt.toUtc().toIso8601String(),
        'pk': senderPublicKey,
        'sg': signature,
        'sq': sequenceNumber,
        'ch': chainHash,
      };

  /// Compact binary format for NFC (limited payload size)
  /// NFC NDEF payload is typically limited to ~1KB
  Uint8List toNfcPayload() {
    final json = jsonEncode(toTransportJson());
    return Uint8List.fromList(utf8.encode(json));
  }

  /// Deserialize from transport JSON
  factory OfflineVoucher.fromTransportJson(Map<String, dynamic> json) {
    return OfflineVoucher(
      voucherCode: json['vc'] as String,
      senderAccountId: json['sa'] as String,
      recipientIdentifier: json['ri'] as String,
      amount: double.parse(json['am'] as String),
      currency: json['cu'] as String,
      nonce: json['no'] as String,
      createdAt: DateTime.parse(json['ca'] as String),
      expiresAt: DateTime.parse(json['ea'] as String),
      senderPublicKey: json['pk'] as String,
      signature: json['sg'] as String,
      sequenceNumber: json['sq'] as int,
      status: VoucherStatus.received,
      chainHash: json['ch'] as String?,
    );
  }

  /// Serialize for local encrypted SQLite storage
  Map<String, dynamic> toStorageMap() => {
        'voucher_code': voucherCode,
        'sender_account_id': senderAccountId,
        'recipient_identifier': recipientIdentifier,
        'amount': amount,
        'currency': currency,
        'nonce': nonce,
        'created_at': createdAt.toIso8601String(),
        'expires_at': expiresAt.toIso8601String(),
        'sender_public_key': senderPublicKey,
        'signature': signature,
        'sequence_number': sequenceNumber,
        'status': status.name,
        'transport': transport?.name,
        'chain_hash': chainHash,
      };

  factory OfflineVoucher.fromStorageMap(Map<String, dynamic> map) {
    return OfflineVoucher(
      voucherCode: map['voucher_code'] as String,
      senderAccountId: map['sender_account_id'] as String,
      recipientIdentifier: map['recipient_identifier'] as String,
      amount: (map['amount'] as num).toDouble(),
      currency: map['currency'] as String,
      nonce: map['nonce'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
      expiresAt: DateTime.parse(map['expires_at'] as String),
      senderPublicKey: map['sender_public_key'] as String,
      signature: map['signature'] as String,
      sequenceNumber: map['sequence_number'] as int,
      status: VoucherStatus.values.firstWhere(
        (s) => s.name == map['status'],
        orElse: () => VoucherStatus.created,
      ),
      transport: map['transport'] != null
          ? OfflineTransport.values.firstWhere(
              (t) => t.name == map['transport'],
              orElse: () => OfflineTransport.qrCode,
            )
          : null,
      chainHash: map['chain_hash'] as String?,
    );
  }
}

/// Configuration for offline payment behavior
class OfflinePaymentConfig {
  /// Default voucher expiry duration (24 hours for blackout scenarios)
  static const Duration defaultExpiry = Duration(hours: 24);

  /// Maximum offline voucher amount (per KYC tier)
  static const Map<int, double> maxAmountByKycTier = {
    1: 500.0,    // Basic: 500 AKD
    2: 5000.0,   // Verified: 5,000 AKD
    3: 50000.0,  // Full KYC: 50,000 AKD
  };

  /// Maximum number of unsynced vouchers per device
  static const int maxUnsyncedVouchers = 50;

  /// NFC NDEF record type for PeThar vouchers
  static const String nfcRecordType = 'pethar.io:voucher';

  /// BLE service UUID for PeThar offline payments
  static const String bleServiceUuid = 'e7b3f4a0-1234-5678-abcd-pethar000001';

  /// BLE characteristic UUID for voucher data
  static const String bleCharacteristicUuid = 'e7b3f4a0-1234-5678-abcd-pethar000002';
}

/// Sync result for batch voucher settlement
class VoucherSyncResult {
  final int totalVouchers;
  final int settledCount;
  final int rejectedCount;
  final int expiredCount;
  final List<String> rejectedCodes;
  final List<String> errors;

  const VoucherSyncResult({
    required this.totalVouchers,
    required this.settledCount,
    required this.rejectedCount,
    required this.expiredCount,
    this.rejectedCodes = const [],
    this.errors = const [],
  });

  bool get hasErrors => errors.isNotEmpty;
  bool get allSettled => settledCount == totalVouchers;
}
