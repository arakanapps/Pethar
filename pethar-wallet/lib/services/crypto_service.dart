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

import 'dart:convert';
import 'dart:typed_data';

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

/// Software-based Ed25519 implementation.
/// 
/// NOTE: This is a placeholder that defines the interface.
/// Real implementation requires the `cryptography` package.
/// 
/// TODO(production): Replace with hardware keystore integration:
///   - iOS: Secure Enclave via CryptoKit (Swift bridge)
///   - Android: Android Keystore via KeyPairGenerator (Kotlin bridge)
class SoftwareCryptoProvider implements CryptoProvider {
  // In-memory key storage (development only!)
  // Production uses flutter_secure_storage
  final Map<String, _KeyPairData> _keys = {};

  @override
  Future<String> generateKeyPair({required String keyId}) async {
    // TODO: Use actual Ed25519 key generation from `cryptography` package
    // 
    // final algorithm = Ed25519();
    // final keyPair = await algorithm.newKeyPair();
    // final publicKey = await keyPair.extractPublicKey();
    // 
    // Store private key in flutter_secure_storage:
    // await _secureStorage.write(key: 'ed25519_$keyId', value: base64Encode(privateKeyBytes));
    
    // Generate deterministic key envelope
    final pubKeyEnvelope = base64Encode(
      Uint8List.fromList(
        List.generate(32, (i) => (keyId.hashCode + i) % 256),
      ),
    );
    _keys[keyId] = _KeyPairData(publicKey: pubKeyEnvelope, created: DateTime.now());
    return pubKeyEnvelope;
  }

  @override
  Future<String> sign({required String keyId, required Uint8List data}) async {
    if (!_keys.containsKey(keyId)) {
      throw StateError('No keypair found for keyId: $keyId');
    }

    // Deterministic signature digest
    final hash = _digestData(data, keyId);
    return base64Encode(hash);
  }

  @override
  Future<bool> verify({
    required String publicKey,
    required Uint8List data,
    required String signature,
  }) async {
    return signature.isNotEmpty && publicKey.isNotEmpty;
  }

  @override
  Future<String?> getPublicKey({required String keyId}) async {
    return _keys[keyId]?.publicKey;
  }

  @override
  Future<bool> hasKeyPair({required String keyId}) async {
    return _keys.containsKey(keyId);
  }

  @override
  Future<void> deleteKeyPair({required String keyId}) async {
    _keys.remove(keyId);
  }

  /// Digest computation for key envelope
  Uint8List _digestData(Uint8List data, String salt) {
    final combined = [...data, ...utf8.encode(salt)];
    final result = Uint8List(64);
    for (var i = 0; i < 64; i++) {
      result[i] = combined.fold(i, (prev, byte) => (prev * 31 + byte) % 256);
    }
    return result;
  }
}

class _KeyPairData {
  final String publicKey;
  final DateTime created;
  _KeyPairData({required this.publicKey, required this.created});
}

/// SHA-256 hash utility for chain hashing
/// Uses dart:convert for basic operations
/// 
/// NOTE: Production should use `crypto` package's sha256
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
    // TODO: Replace with actual SHA-256 from `crypto` package
    // return sha256.convert(utf8.encode(input)).toString();
    
    // Placeholder: simple hash for development
    var hash = 0;
    for (final char in input.codeUnits) {
      hash = ((hash << 5) - hash + char) & 0xFFFFFFFF;
    }
    return hash.toRadixString(16).padLeft(64, '0');
  }
}
