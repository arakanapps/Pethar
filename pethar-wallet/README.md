# Péthar Mobile Wallet (`pethar-wallet`)

Native Android and iOS mobile client for the Péthar (ဖေ့သာ) financial platform, built with Flutter 3.x and Dart 3.x.

> **Note:** The Web, POS, and Desktop platforms, legacy offline cashout engines, and dynamic fiat FX rate engines have been archived into `/archive/` for the current mobile-focused release phase. The active workspace is dedicated exclusively to native **Android and iOS** mobile clients.

---

## Architecture Overview

- **Mobile Framework:** Flutter (Dart 3.x) targeting native Android (`android/`) and iOS (`ios/`).
- **State Management:** Provider pattern with hardware-backed session encryption.
- **Backend Infrastructure:** Supabase PostgreSQL (system of record) with authenticated row-level security (RLS).
- **Security:** Local encrypted storage via SQLCipher (`sqflite_sqlcipher`), secure device keychains via `flutter_secure_storage`, and cryptographic operations via Ed25519 (`cryptography`).

---

## Directory Structure

```text
pethar-wallet/
├── android/            # Native Android project (Gradle, build.gradle.kts)
├── ios/                # Native iOS project (Runner.xcworkspace, Podfile)
├── lib/
│   ├── main.dart       # Application entrypoint
│   ├── app_state.dart  # Global state & encrypted session management
│   ├── i18n.dart       # Bilingual localization (Burmese/Arakanese & English)
│   ├── theme.dart      # Design system & dark/light themes
│   ├── models/         # Data contracts & entities
│   ├── screens/        # Native mobile views (Home, Send, Pay, Auth, Settings, etc.)
│   ├── services/       # Supabase client, auth, local secure vault, sync engine
│   └── widgets/        # Mobile UI components, PIN entry, Arakan emblem
├── assets/             # Bundled mobile assets (flags, icons)
├── test/               # Flutter unit, widget, and state tests
└── pubspec.yaml        # Flutter mobile dependencies
```

---

## Local Development & Testing

### 1. Install Dependencies
```bash
cd pethar-wallet
flutter pub get
```

### 2. Run Static Analysis & Tests
```bash
# Run Flutter static analyzer
flutter analyze --no-fatal-infos

# Run full test suite
flutter test
```

---

## Running on Devices

### Android
```bash
# Run on connected Android device or emulator
flutter run -d android

# Or using the root runner:
npm run android

# Build release APK:
npm run android:apk
# or: flutter build apk --release --no-tree-shake-icons
```

### iOS
```bash
# Run on iOS Simulator or connected iPhone
flutter run -d ios

# Or using the root runner:
npm run ios

# Open Xcode workspace:
npm run ios:xcode
# or: open ios/Runner.xcworkspace
```

---

## Configuration & Environment

Supply client configuration via Flutter `--dart-define` parameters or `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FIREBASE_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`

> **Security Notice:** Do not check in production credentials or release keystores. Release builds must use protected CI/CD secrets.
