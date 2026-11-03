/// Péthar Cryptographic Service
/// 
/// Provides Ed25519 digital signature operations for offline vouchers.
/// Uses platform-native keystores (iOS Secure Enclave / Android Keystore)
/// when available, with a software fallback for development.
///
/// IMPORTANT: This service handles key generation and signing.
/// Private keys NEVER leave the device. The public key is registered
/// with the server during device binding.
///
/// Dependencies required in pubspec.yaml:
///   - cryptography: ^2.7.0 (Ed25519 operations)
///   - flutter_secure_storage: ^9.2.4 (encrypted key storage)
library;

import 'dart:typed_data';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:cryptography/cryptography.dart';

/// Abstract interface for cryptographic operations.
/// This allows swapping implementations (software vs hardware keystore).
abstract class CryptoProvider {
  /// Generate a new Ed25519 keypair
  /// Returns the public key as base64-encoded string
  /// Private key is stored securely on-device
  Future<String> generateKeyPair({required String keyId});

  /// Sign data with the private key identified by keyId
  /// Returns base64-encoded signature
  Future<String> sign({required String keyId, required Uint8List data});

  /// Verify a signature against a public key
  /// publicKey and signature are base64-encoded
  Future<bool> verify({
    required String publicKey,
    required Uint8List data,
    required String signature,
  });

  /// Get the public key for a given keyId
  Future<String?> getPublicKey({required String keyId});

  /// Check if a keypair exists for this keyId
  Future<bool> hasKeyPair({required String keyId});

  /// Delete a keypair (e.g., on device unbinding)
  Future<void> deleteKeyPair({required String keyId});
}

/// Software Ed25519 implementation used only when native hardware signing is
/// unavailable. Native keystore implementations should be preferred.
class SoftwareCryptoProvider implements CryptoProvider {
  final Ed25519 _algorithm = Ed25519();
  final Map<String, KeyPair> _keys = {};

  @override
  Future<String> generateKeyPair({required String keyId}) async {
    final keyPair = await _algorithm.newKeyPair();
    final publicKey = await keyPair.extractPublicKey();
    _keys[keyId] = keyPair;
    return base64Encode(publicKey.bytes);
  }

  @override
  Future<String> sign({required String keyId, required Uint8List data}) async {
    if (!_keys.containsKey(keyId)) {
      throw StateError('No keypair found for keyId: $keyId');
    }

    final keyPair = _keys[keyId];
    if (keyPair == null) {
      throw StateError('No keypair found for keyId: $keyId');
    }
    final signature = await _algorithm.sign(data, keyPair: keyPair);
    return base64Encode(signature.bytes);
  }

  @override
  Future<bool> verify({
    required String publicKey,
    required Uint8List data,
    required String signature,
  }) async {
    try {
      final key = SimplePublicKey(
        base64Decode(publicKey),
        type: KeyPairType.ed25519,
      );
      return await _algorithm.verify(
        data,
        signature: Signature(base64Decode(signature), publicKey: key),
      );
    } on FormatException {
      return false;
    }
  }

  @override
  Future<String?> getPublicKey({required String keyId}) async {
    final keyPair = _keys[keyId];
    if (keyPair == null) return null;
    final publicKey = await keyPair.extractPublicKey();
    return base64Encode(publicKey.bytes);
  }

  @override
  Future<bool> hasKeyPair({required String keyId}) async {
    return _keys.containsKey(keyId);
  }

  @override
  Future<void> deleteKeyPair({required String keyId}) async {
    _keys.remove(keyId);
  }

}

/// SHA-256 hash utility for chain hashing
/// Uses the standard SHA-256 implementation from the `crypto` package.
class ChainHasher {
  /// Compute chain hash for a voucher entry
  /// chain_hash = SHA256(previous_chain_hash || voucher_code || amount || balance_after)
  static String computeChainHash({
    required String? previousHash,
    required String voucherCode,
    required String amount,
    required String senderAccountId,
  }) {
    final input = '${previousHash ?? ''}|$voucherCode|$amount|$senderAccountId';
    return sha256.convert(utf8.encode(input)).toString();
  }
}
