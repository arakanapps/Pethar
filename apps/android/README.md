# Péthar Android (အန်းဒရွိုက် မိုဘိုင်းလ်)

The **Android Mobile Client** for Péthar.

## Native Project Location
The native Android Gradle project is located at:
- `apps/android/project` ➔ points to `pethar_mobile/android/`
  - `app/build.gradle.kts`
  - `app/src/main/AndroidManifest.xml`
  - `app/src/main/kotlin/com/example/pethar_mobile/MainActivity.kt`
  - `app/src/main/res/mipmap-*/ic_launcher.png`

## Features
- Full Flutter Material Design 3 experience with Android system navigation (`◀ ● ■`).
- Dark/Light mode theme with royal Arakan colors (Crimson, Gold, Obsidian).
- Bilingual: Arakanese (ရခိုင်) and English.
- Offline QR vouchers, Dynamic TOTP cash-out codes, biometric security, camera QR scanning.

## How to Run & Build
```bash
# 1. Run on connected Android device (USB Debugging enabled):
./apps/android/run.sh

# 2. Build standalone Release APK for direct download/install:
./apps/android/build-apk.sh
```

APK Output Location:
`pethar_mobile/build/app/outputs/flutter-apk/app-release.apk`
