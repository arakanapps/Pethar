# Péthar Wallet ProGuard Rules for Direct APK Distribution

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep Supabase/Postgres classes
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# Keep Flutter engine
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep BLE/NFC for offline payments
-keep class android.bluetooth.** { *; }
-keep class android.nfc.** { *; }

# Keep crypto libraries for offline vouchers
-keep class javax.crypto.** { *; }
-keep class java.security.** { *; }

# Prevent obfuscation of model classes
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Direct APK distribution (not Play Store): the Flutter embedding references
# Play Core deferred-component classes that are not bundled.
-dontwarn com.google.android.play.core.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
