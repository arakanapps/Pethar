package uk.co.pethar.wallet

import android.app.KeyguardManager
import android.content.Context
import android.content.DialogInterface
import android.content.pm.PackageManager
import android.graphics.Color
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.view.View
import android.view.WindowInsetsController
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterFragmentActivity() {
    private val channelName = "io.pethar.app/native_security"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getSecurityCapabilities" -> {
                        val hasFingerprint = packageManager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)
                        val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                        val isDeviceSecure = keyguard?.isDeviceSecure == true
                        result.success(
                            mapOf(
                                "hasSecureEnclave" to true,
                                "biometryType" to if (hasFingerprint) "fingerprint" else "biometrics",
                                "canAuthenticateBiometrics" to (hasFingerprint || isDeviceSecure),
                                "isNfcAvailable" to packageManager.hasSystemFeature(PackageManager.FEATURE_NFC),
                                "hardwarePlatform" to "Android",
                                "keystoreType" to "Android Hardware Keystore"
                            )
                        )
                    }
                    "authenticateWithBiometrics" -> {
                        val reason = call.argument<String>("reason")
                            ?: "Authenticate with Fingerprint or Face ID"
                        authenticateWithBiometrics(reason, result)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun authenticateWithBiometrics(reason: String, result: MethodChannel.Result) {
        val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
        val isDeviceSecure = keyguard?.isDeviceSecure == true

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && isDeviceSecure) {
            try {
                val prompt = BiometricPrompt.Builder(this)
                    .setTitle("Péthar Biometric Verification")
                    .setSubtitle(reason)
                    .setNegativeButton(
                        "Use 6-Digit PIN",
                        mainExecutor,
                        DialogInterface.OnClickListener { _, _ ->
                            result.success(mapOf("success" to false, "error" to "User selected PIN"))
                        }
                    )
                    .build()

                val cancellationSignal = CancellationSignal()
                prompt.authenticate(
                    cancellationSignal,
                    mainExecutor,
                    object : BiometricPrompt.AuthenticationCallback() {
                        override fun onAuthenticationSucceeded(authResult: BiometricPrompt.AuthenticationResult?) {
                            result.success(mapOf("success" to true))
                        }

                        override fun onAuthenticationError(errorCode: Int, errString: CharSequence?) {
                            result.success(
                                mapOf(
                                    "success" to false,
                                    "error" to (errString?.toString() ?: "Biometric error $errorCode")
                                )
                            )
                        }

                        override fun onAuthenticationFailed() {
                            // Keep prompt open for retry
                        }
                    }
                )
                return
            } catch (e: Exception) {
                result.success(mapOf("success" to false, "error" to (e.message ?: "Biometrics not available")))
                return
            }
        }

        result.success(mapOf("success" to false, "error" to "Biometrics not enrolled on this device"))
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        applyLightSystemBars()
    }

    override fun onResume() {
        super.onResume()
        applyLightSystemBars()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            applyLightSystemBars()
        }
    }

    private fun applyLightSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.statusBarColor = Color.TRANSPARENT
            window.navigationBarColor = Color.TRANSPARENT
            window.isNavigationBarContrastEnforced = false
            window.isStatusBarContrastEnforced = false
            window.insetsController?.setSystemBarsAppearance(
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
            )
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            )
            window.statusBarColor = Color.TRANSPARENT
            window.navigationBarColor = Color.TRANSPARENT
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                window.isNavigationBarContrastEnforced = false
                window.isStatusBarContrastEnforced = false
            }
        }
    }
}
