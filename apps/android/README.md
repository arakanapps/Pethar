# Péthar Android (အန်းဒရွိုက် မိုဘိုင်းလ်)

The **Android Mobile Client** for Péthar.

## Native Project Location
The native Android Gradle project is located at:
- `pethar-wallet/android/`
  - `app/build.gradle.kts`
  - `app/src/main/AndroidManifest.xml`
  - `app/src/main/kotlin/com/example/pethar-wallet/MainActivity.kt`
  - `app/src/main/res/mipmap-*/ic_launcher.png`

## Features
- Full Flutter Material Design 3 experience with Android system navigation (`◀ ● ■`).
- Dark/Light mode theme with royal Arakan colors (Crimson, Gold, Obsidian).
- Bilingual: Arakanese (အာရက္ခ) and English.
- Offline QR vouchers, Dynamic TOTP cash-out codes, biometric security, camera QR scanning.

## How to Run & Build
```bash
# 1. Run on connected Android device (USB Debugging enabled):
./apps/android/run.sh

# 2. Build lightweight Release APK(s) for direct download/install:
./apps/android/build-apk.sh                 # arm64 + armv7, split per ABI
PETHAR_ABI=arm64 ./apps/android/build-apk.sh # smallest single APK (arm64 phones)

# 3. Remove disposable build caches when the workspace gets large:
./apps/android/clean-cache.sh
```

APK Output Location:
`pethar-wallet/build/app/outputs/flutter-apk/`

Release builds use R8 minification, resource shrinking, icon tree-shaking, and
ship only the `en` / `my` locale resources. Emulator-only `x86_64` binaries and
the unused SQLCipher/connectivity plugins are excluded from release downloads.
