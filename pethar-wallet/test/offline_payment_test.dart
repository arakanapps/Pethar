import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:pethar_mobile/services/offline_payment_service.dart';
import 'package:pethar_mobile/services/crypto_service.dart';

void main() {
  group('OfflineVoucher Lifecycle and Security Tests', () {
    test('creates valid signed voucher with canonical payload format', () {
      final now = DateTime.now().toUtc();
      final expires = now.add(const Duration(hours: 24));

      final voucher = OfflineVoucher(
        voucherCode: 'VCH-AKD-2026-TEST01',
        senderAccountId: 'acc-uuid-sender-001',
        recipientIdentifier: '202610190001',
        amount: 250.0,
        currency: 'AKD',
        nonce: 'nonce-uuid-v4-abc123',
        createdAt: now,
        expiresAt: expires,
        senderPublicKey: 'mock-ed25519-public-key',
        signature: 'mock-ed25519-signature-base64',
        sequenceNumber: 1,
      );

      // Verify canonical payload structure for deterministic Ed25519 signing
      expect(
        voucher.canonicalPayload,
        'VCH-AKD-2026-TEST01|acc-uuid-sender-001|202610190001|250.00000000|AKD|nonce-uuid-v4-abc123|${expires.toIso8601String()}',
      );

      // Verify voucher is active and not expired
      expect(voucher.isExpired, isFalse);
      expect(voucher.isRedeemable, isTrue);
      expect(voucher.status, VoucherStatus.created);
    });

    test('detects expired vouchers', () {
      final past = DateTime.now().toUtc().subtract(const Duration(hours: 1));

      final voucher = OfflineVoucher(
        voucherCode: 'VCH-EXPIRED',
        senderAccountId: 'acc-001',
        recipientIdentifier: 'ARAK-002',
        amount: 50.0,
        currency: 'AKD',
        nonce: 'nonce-expired-001',
        createdAt: past.subtract(const Duration(hours: 24)),
        expiresAt: past,
        senderPublicKey: 'pubkey',
        signature: 'sig',
        sequenceNumber: 1,
      );

      expect(voucher.isExpired, isTrue);
      expect(voucher.isRedeemable, isFalse);
    });

    test('serializes to transport JSON and parses back losslessly', () {
      final now = DateTime.utc(2026, 10, 12, 10, 0, 0);
      final expires = DateTime.utc(2026, 10, 13, 10, 0, 0);

      final original = OfflineVoucher(
        voucherCode: 'VCH-SERIAL-TEST',
        senderAccountId: 'sender-acc-99',
        recipientIdentifier: 'ARAK-7721-MERCHANT',
        amount: 1500.50,
        currency: 'AKD',
        nonce: 'random-nonce-9923',
        createdAt: now,
        expiresAt: expires,
        senderPublicKey: 'ed25519-pubkey-bytes',
        signature: 'ed25519-signature-bytes',
        sequenceNumber: 42,
        chainHash: 'hash-chain-digest-01',
      );

      final transportJson = original.toTransportJson();
      expect(transportJson['v'], 1);
      expect(transportJson['vc'], 'VCH-SERIAL-TEST');
      expect(transportJson['am'], '1500.50000000');
      expect(transportJson['cu'], 'AKD');

      // Binary payload for NFC NDEF record (< 1KB)
      final nfcBytes = original.toNfcPayload();
      expect(nfcBytes.length, lessThan(1024));

      // Reconstruct
      final parsed = OfflineVoucher.fromTransportJson(transportJson);
      expect(parsed.voucherCode, original.voucherCode);
      expect(parsed.senderAccountId, original.senderAccountId);
      expect(parsed.recipientIdentifier, original.recipientIdentifier);
      expect(parsed.amount, original.amount);
      expect(parsed.currency, original.currency);
      expect(parsed.nonce, original.nonce);
      expect(parsed.sequenceNumber, original.sequenceNumber);
      expect(parsed.chainHash, original.chainHash);
    });

    test('enforces KYC tier transaction limits in OfflinePaymentConfig', () {
      expect(OfflinePaymentConfig.maxAmountByKycTier[1], 500.0);
      expect(OfflinePaymentConfig.maxAmountByKycTier[2], 5000.0);
      expect(OfflinePaymentConfig.maxAmountByKycTier[3], 50000.0);
    });
  });

  group('Cryptographic Provider and Chain Hashing Tests', () {
    test('SoftwareCryptoProvider generates deterministic mock keypair and signs data', () async {
      final crypto = SoftwareCryptoProvider();
      const keyId = 'test-key-id-001';

      final pubKey = await crypto.generateKeyPair(keyId: keyId);
      expect(pubKey, isNotEmpty);
      expect(await crypto.hasKeyPair(keyId: keyId), isTrue);

      final testBytes = Uint8List.fromList(utf8.encode('canonical-data-payload-to-sign'));
      final signature = await crypto.sign(
        keyId: keyId,
        data: testBytes,
      );
      expect(signature, isNotEmpty);

      final isValid = await crypto.verify(
        publicKey: pubKey,
        data: testBytes,
        signature: signature,
      );
      expect(isValid, isTrue);
    });

    test('ChainHasher computes deterministic SHA-256 chain hash for tamper-evidence', () {
      final hash1 = ChainHasher.computeChainHash(
        previousHash: null,
        voucherCode: 'VCH-001',
        amount: '100.00',
        senderAccountId: 'acc-1',
      );
      expect(hash1, isNotEmpty);

      final hash2 = ChainHasher.computeChainHash(
        previousHash: hash1,
        voucherCode: 'VCH-002',
        amount: '200.00',
        senderAccountId: 'acc-1',
      );
      expect(hash2, isNotEmpty);
      expect(hash2, isNot(equals(hash1)));
    });
  });
}
