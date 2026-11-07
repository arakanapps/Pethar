/// Péthar Cryptographic Service
/// 
/// Provides real Ed25519 digital signature operations for offline vouchers and transactions.
/// Private keys are persisted in hardware-backed FlutterSecureStorage (Android Keystore / iOS Keychain)
/// and never leave the client device.
library;

import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Abstract interface for cryptographic operations.
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

/// Real Ed25519 cryptographic implementation with key persistence in FlutterSecureStorage
class SoftwareCryptoProvider implements CryptoProvider {
  final Ed25519 _algorithm = Ed25519();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _keyPrefixSk = 'pethar_ed25519_sk_';
  static const String _keyPrefixPk = 'pethar_ed25519_pk_';

  final Map<String, SimpleKeyPair> _cachedKeys = {};

  Future<SimpleKeyPair?> _loadKey(String keyId) async {
    if (_cachedKeys.containsKey(keyId)) {
      return _cachedKeys[keyId];
    }
    try {
      final skBase64 = await _secureStorage.read(key: '$_keyPrefixSk$keyId');
      if (skBase64 == null || skBase64.isEmpty) return null;
      final seed = base64Decode(skBase64);
      final keyPair = await _algorithm.newKeyPairFromSeed(seed);
      _cachedKeys[keyId] = keyPair;
      return keyPair;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String> generateKeyPair({required String keyId}) async {
    final keyPair = await _algorithm.newKeyPair();
    final privateKeyBytes = await keyPair.extractPrivateKeyBytes();
    final publicKey = await keyPair.extractPublicKey();
    final pkBase64 = base64Encode(publicKey.bytes);
    final skBase64 = base64Encode(privateKeyBytes);

    try {
      await _secureStorage.write(key: '$_keyPrefixSk$keyId', value: skBase64);
      await _secureStorage.write(key: '$_keyPrefixPk$keyId', value: pkBase64);
    } catch (_) {}

    _cachedKeys[keyId] = keyPair;
    return pkBase64;
  }

  @override
  Future<String> sign({required String keyId, required Uint8List data}) async {
    final keyPair = await _loadKey(keyId);
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
      final sigBytes = base64Decode(signature);
      return await _algorithm.verify(
        data,
        signature: Signature(sigBytes, publicKey: key),
      );
    } catch (_) {
      return false;
    }
  }

  @override
  Future<String?> getPublicKey({required String keyId}) async {
    final cached = _cachedKeys[keyId];
    if (cached != null) {
      final pk = await cached.extractPublicKey();
      return base64Encode(pk.bytes);
    }
    try {
      return await _secureStorage.read(key: '$_keyPrefixPk$keyId');
    } catch (_) {
      return null;
    }
  }

  @override
  Future<bool> hasKeyPair({required String keyId}) async {
    if (_cachedKeys.containsKey(keyId)) return true;
    try {
      final stored = await _secureStorage.read(key: '$_keyPrefixSk$keyId');
      return stored != null && stored.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<void> deleteKeyPair({required String keyId}) async {
    _cachedKeys.remove(keyId);
    try {
      await _secureStorage.delete(key: '$_keyPrefixSk$keyId');
      await _secureStorage.delete(key: '$_keyPrefixPk$keyId');
    } catch (_) {}
  }
}

/// SHA-256 hash utility for chain hashing
/// Uses the standard SHA-256 implementation from the `crypto` package.
class ChainHasher {
  /// Compute chain hash for a voucher entry:
  /// chain_hash = SHA256(previous_chain_hash || voucher_code || amount || sender_account_id)
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
