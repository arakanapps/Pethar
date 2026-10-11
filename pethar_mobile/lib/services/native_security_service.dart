/// PeThar Native Hardware Security Service
///
/// Bridges Flutter to platform-native hardware security capabilities:
/// - iOS: Apple Secure Enclave & CryptoKit via MethodChannel (`AppDelegate.swift`)
/// - iOS: LocalAuthentication for Face ID / Touch ID evaluation
/// - iOS & Android: CoreNFC and Hardware Keystore integration
///
/// Fallback: If hardware keystore is unavailable (e.g. simulator or unsupported OS),
/// gracefully falls back to software cryptographic provider.
library;

import 'package:flutter/services.dart';
import 'crypto_service.dart';

class NativeSecurityCapabilities {
  final bool hasSecureEnclave;
  final String biometryType; // 'faceID', 'touchID', 'opticID', 'none'
  final bool canAuthenticateBiometrics;
  final bool isNfcAvailable;
  final String hardwarePlatform;
  final String keystoreType;

  const NativeSecurityCapabilities({
    required this.hasSecureEnclave,
    required this.biometryType,
    required this.canAuthenticateBiometrics,
    required this.isNfcAvailable,
    required this.hardwarePlatform,
    required this.keystoreType,
  });

  factory NativeSecurityCapabilities.fromMap(Map<dynamic, dynamic> map) {
    return NativeSecurityCapabilities(
      hasSecureEnclave: map['hasSecureEnclave'] as bool? ?? false,
      biometryType: map['biometryType'] as String? ?? 'none',
      canAuthenticateBiometrics: map['canAuthenticateBiometrics'] as bool? ?? false,
      isNfcAvailable: map['isNfcAvailable'] as bool? ?? false,
      hardwarePlatform: map['hardwarePlatform'] as String? ?? 'Unknown',
      keystoreType: map['keystoreType'] as String? ?? 'Software Fallback',
    );
  }

  factory NativeSecurityCapabilities.softwareFallback() {
    return const NativeSecurityCapabilities(
      hasSecureEnclave: false,
      biometryType: 'none',
      canAuthenticateBiometrics: false,
      isNfcAvailable: false,
      hardwarePlatform: 'Software',
      keystoreType: 'Software Cryptographic Provider (Ed25519)',
    );
  }
}

class HardwareKeyResult {
  final String keyId;
  final String publicKey;
  final bool isSecureEnclave;
  final String algorithm;

  const HardwareKeyResult({
    required this.keyId,
    required this.publicKey,
    required this.isSecureEnclave,
    required this.algorithm,
  });
}

class HardwareSignatureResult {
  final String signature;
  final String algorithm;
  final bool isHardwareSigned;

  const HardwareSignatureResult({
    required this.signature,
    required this.algorithm,
    required this.isHardwareSigned,
  });
}

class NativeSecurityService {
  static const MethodChannel _channel = MethodChannel('io.pethar.app/native_security');
  static final NativeSecurityService _instance = NativeSecurityService._internal();

  factory NativeSecurityService() => _instance;
  NativeSecurityService._internal();

  NativeSecurityCapabilities? _cachedCapabilities;

  /// Query hardware security capabilities (Secure Enclave, Face ID, NFC)
  Future<NativeSecurityCapabilities> getCapabilities() async {
    if (_cachedCapabilities != null) return _cachedCapabilities!;

    try {
      final result = await _channel.invokeMethod<Map<dynamic, dynamic>>('getSecurityCapabilities');
      if (result != null) {
        _cachedCapabilities = NativeSecurityCapabilities.fromMap(result);
        return _cachedCapabilities!;
      }
    } on PlatformException catch (_) {
      // Platform channel not available (e.g. running on Android/Desktop or mock)
    } on MissingPluginException catch (_) {
      // Not implemented on this platform
    }

    _cachedCapabilities = NativeSecurityCapabilities.softwareFallback();
    return _cachedCapabilities!;
  }

  /// Request biometric authentication (Face ID / Touch ID)
  Future<bool> authenticateBiometrics({String? reason}) async {
    try {
      final result = await _channel.invokeMethod<Map<dynamic, dynamic>>(
        'authenticateWithBiometrics',
        {'reason': reason ?? 'Authorize Arakan Dollar transfer'},
      );
      return result?['success'] as bool? ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Generate hardware-isolated keypair in Secure Enclave
  Future<HardwareKeyResult> generateHardwareKey({required String keyId}) async {
    try {
      final result = await _channel.invokeMethod<Map<dynamic, dynamic>>(
        'generateHardwareKey',
        {'keyId': keyId},
      );
      if (result != null) {
        return HardwareKeyResult(
          keyId: result['keyId'] as String? ?? keyId,
          publicKey: result['publicKey'] as String? ?? '',
          isSecureEnclave: result['isSecureEnclave'] as bool? ?? false,
          algorithm: result['algorithm'] as String? ?? 'ECDSA_P256_SHA256',
        );
      }
    } catch (_) {
      // Fallback to software provider
    }

    final software = SoftwareCryptoProvider();
    final pubKey = await software.generateKeyPair(keyId: keyId);
    return HardwareKeyResult(
      keyId: keyId,
      publicKey: pubKey,
      isSecureEnclave: false,
      algorithm: 'Ed25519-Software',
    );
  }

  /// Sign canonical payload string with hardware key
  Future<HardwareSignatureResult> signPayload({
    required String keyId,
    required String payload,
  }) async {
    try {
      final result = await _channel.invokeMethod<Map<dynamic, dynamic>>(
        'signHardwarePayload',
        {'keyId': keyId, 'payload': payload},
      );
      if (result != null) {
        return HardwareSignatureResult(
          signature: result['signature'] as String? ?? '',
          algorithm: result['algorithm'] as String? ?? 'ECDSA_P256_SHA256',
          isHardwareSigned: result['isHardwareSigned'] as bool? ?? false,
        );
      }
    } catch (_) {
      // Fallback
    }

    final software = SoftwareCryptoProvider();
    final sig = await software.sign(keyId: keyId, data: Uint8List.fromList(payload.codeUnits));
    return HardwareSignatureResult(
      signature: sig,
      algorithm: 'Ed25519-Software',
      isHardwareSigned: false,
    );
  }

  /// Verify signature
  Future<bool> verifySignature({
    required String publicKey,
    required String payload,
    required String signature,
  }) async {
    try {
      final result = await _channel.invokeMethod<bool>(
        'verifyHardwareSignature',
        {
          'publicKey': publicKey,
          'payload': payload,
          'signature': signature,
        },
      );
      if (result != null) return result;
    } catch (_) {
      // Fallback
    }

    final software = SoftwareCryptoProvider();
    return await software.verify(
      publicKey: publicKey,
      data: Uint8List.fromList(payload.codeUnits),
      signature: signature,
    );
  }
}
