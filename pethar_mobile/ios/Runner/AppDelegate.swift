import Flutter
import UIKit
import LocalAuthentication
import CryptoKit
import CoreNFC
import Security

/// PeThar Native Security Bridge for iOS
///
/// Implements hardware-level cryptographic isolation:
/// 1. Apple Secure Enclave (CryptoKit) for non-exportable hardware key generation & signing
/// 2. LocalAuthentication for Face ID / Touch ID biometric policy evaluation
/// 3. CoreNFC hardware capability detection for tap-to-pay offline vouchers
@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  private let channelName = "io.pethar.app/native_security"
  private let keychainService = "io.pethar.app.keystore"

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    if let controller = window?.rootViewController as? FlutterViewController {
      setupNativeSecurityChannel(controller: controller)
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    if let controller = window?.rootViewController as? FlutterViewController {
      setupNativeSecurityChannel(controller: controller)
    }
  }

  private func setupNativeSecurityChannel(controller: FlutterViewController) {
    let channel = FlutterMethodChannel(name: channelName, binaryMessenger: controller.binaryMessenger)
    channel.setMethodCallHandler { [weak self] (call, result) in
      guard let self = self else { return }

      switch call.method {
      case "getSecurityCapabilities":
        result(self.getSecurityCapabilities())

      case "authenticateWithBiometrics":
        let reason = (call.arguments as? [String: Any])?["reason"] as? String
          ?? "Authenticate with Face ID / Touch ID to authorize PeThar transaction"
        self.authenticateWithBiometrics(reason: reason, result: result)

      case "generateHardwareKey":
        guard let args = call.arguments as? [String: Any],
              let keyId = args["keyId"] as? String else {
          result(FlutterError(code: "INVALID_ARGS", message: "Missing keyId", details: nil))
          return
        }
        self.generateHardwareKey(keyId: keyId, result: result)

      case "signHardwarePayload":
        guard let args = call.arguments as? [String: Any],
              let keyId = args["keyId"] as? String,
              let payload = args["payload"] as? String else {
          result(FlutterError(code: "INVALID_ARGS", message: "Missing keyId or payload", details: nil))
          return
        }
        self.signHardwarePayload(keyId: keyId, payload: payload, result: result)

      case "verifyHardwareSignature":
        guard let args = call.arguments as? [String: Any],
              let publicKeyBase64 = args["publicKey"] as? String,
              let payload = args["payload"] as? String,
              let signatureBase64 = args["signature"] as? String else {
          result(FlutterError(code: "INVALID_ARGS", message: "Missing verification parameters", details: nil))
          return
        }
        self.verifyHardwareSignature(
          publicKeyBase64: publicKeyBase64,
          payload: payload,
          signatureBase64: signatureBase64,
          result: result
        )

      default:
        result(FlutterMethodNotImplemented)
      }
    }
  }

  // MARK: - Hardware Capabilities

  private func getSecurityCapabilities() -> [String: Any] {
    let context = LAContext()
    var error: NSError?
    let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)

    var biometryType = "none"
    if canEvaluate {
      switch context.biometryType {
      case .faceID: biometryType = "faceID"
      case .touchID: biometryType = "touchID"
      case .opticID: biometryType = "opticID"
      default: biometryType = "biometrics"
      }
    }

    let hasSecureEnclave = SecureEnclave.isAvailable
    let isNfcAvailable = NFCNDEFReaderSession.readingAvailable

    return [
      "hasSecureEnclave": hasSecureEnclave,
      "biometryType": biometryType,
      "canAuthenticateBiometrics": canEvaluate,
      "isNfcAvailable": isNfcAvailable,
      "hardwarePlatform": "iOS",
      "keystoreType": hasSecureEnclave ? "Apple Secure Enclave (CryptoKit)" : "Apple Keychain Software Fallback"
    ]
  }

  // MARK: - Biometric Authentication (Face ID / Touch ID)

  private func authenticateWithBiometrics(reason: String, result: @escaping FlutterResult) {
    let context = LAContext()
    context.localizedCancelTitle = "Cancel"

    var error: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
      result([
        "success": false,
        "error": error?.localizedDescription ?? "Biometrics not available on this device"
      ])
      return
    }

    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, evalError in
      DispatchQueue.main.async {
        if success {
          result(["success": true])
        } else {
          result([
            "success": false,
            "error": evalError?.localizedDescription ?? "Authentication failed"
          ])
        }
      }
    }
  }

  // MARK: - Secure Enclave Key Generation

  private func generateHardwareKey(keyId: String, result: @escaping FlutterResult) {
    do {
      if SecureEnclave.isAvailable {
        // Generate non-exportable hardware key in Secure Enclave
        let privateKey = try SecureEnclave.P256.Signing.PrivateKey()
        let keyData = privateKey.dataRepresentation

        // Save key reference to iOS Keychain
        try saveToKeychain(keyId: keyId, data: keyData)

        let publicKeyBase64 = privateKey.publicKey.rawRepresentation.base64EncodedString()
        result([
          "keyId": keyId,
          "publicKey": publicKeyBase64,
          "isSecureEnclave": true,
          "algorithm": "ECDSA_P256_SHA256"
        ])
      } else {
        // Fallback for Simulator / devices without Secure Enclave
        let privateKey = P256.Signing.PrivateKey()
        let keyData = privateKey.rawRepresentation

        try saveToKeychain(keyId: keyId, data: keyData)

        let publicKeyBase64 = privateKey.publicKey.rawRepresentation.base64EncodedString()
        result([
          "keyId": keyId,
          "publicKey": publicKeyBase64,
          "isSecureEnclave": false,
          "algorithm": "ECDSA_P256_SHA256"
        ])
      }
    } catch {
      result(FlutterError(
        code: "KEY_GEN_FAILED",
        message: "Failed to generate hardware key: \(error.localizedDescription)",
        details: nil
      ))
    }
  }

  // MARK: - Hardware Signing

  private func signHardwarePayload(keyId: String, payload: String, result: @escaping FlutterResult) {
    guard let payloadData = payload.data(using: .utf8) else {
      result(FlutterError(code: "INVALID_PAYLOAD", message: "Payload must be UTF-8 string", details: nil))
      return
    }

    guard let keyData = loadFromKeychain(keyId: keyId) else {
      result(FlutterError(code: "KEY_NOT_FOUND", message: "No key found for identifier \(keyId)", details: nil))
      return
    }

    do {
      if SecureEnclave.isAvailable {
        let privateKey = try SecureEnclave.P256.Signing.PrivateKey(dataRepresentation: keyData)
        let signature = try privateKey.signature(for: payloadData)
        result([
          "signature": signature.rawRepresentation.base64EncodedString(),
          "algorithm": "ECDSA_P256_SHA256",
          "isHardwareSigned": true
        ])
      } else {
        let privateKey = try P256.Signing.PrivateKey(rawRepresentation: keyData)
        let signature = try privateKey.signature(for: payloadData)
        result([
          "signature": signature.rawRepresentation.base64EncodedString(),
          "algorithm": "ECDSA_P256_SHA256",
          "isHardwareSigned": false
        ])
      }
    } catch {
      result(FlutterError(
        code: "SIGN_FAILED",
        message: "Failed to sign with hardware key: \(error.localizedDescription)",
        details: nil
      ))
    }
  }

  // MARK: - Hardware Signature Verification

  private func verifyHardwareSignature(
    publicKeyBase64: String,
    payload: String,
    signatureBase64: String,
    result: @escaping FlutterResult
  ) {
    guard let pubKeyData = Data(base64Encoded: publicKeyBase64),
          let sigData = Data(base64Encoded: signatureBase64),
          let payloadData = payload.data(using: .utf8) else {
      result(false)
      return
    }

    do {
      let publicKey = try P256.Signing.PublicKey(rawRepresentation: pubKeyData)
      let signature = try P256.Signing.ECDSASignature(rawRepresentation: sigData)
      let isValid = publicKey.isValidSignature(signature, for: payloadData)
      result(isValid)
    } catch {
      result(false)
    }
  }

  // MARK: - Keychain Helpers

  private func saveToKeychain(keyId: String, data: Data) throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: keychainService,
      kSecAttrAccount as String: keyId
    ]

    SecItemDelete(query as CFDictionary)

    var newQuery = query
    newQuery[kSecValueData as String] = data
    newQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

    let status = SecItemAdd(newQuery as CFDictionary, nil)
    guard status == errSecSuccess else {
      throw NSError(domain: NSOSStatusErrorDomain, code: Int(status), userInfo: nil)
    }
  }

  private func loadFromKeychain(keyId: String) -> Data? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: keychainService,
      kSecAttrAccount as String: keyId,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne
    ]

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess, let data = item as? Data else {
      return nil
    }
    return data
  }
}
