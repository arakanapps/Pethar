# Péthar (ဖေ့သာ) — Mobile Platform Architecture Guide

This document provides a clean overview of how all files in the Péthar codebase are structured for the **Android** and **iOS** native mobile releases, and details the unified archive in `archive/`.

---

## 🗂️ Active Mobile Platforms (`apps/`)

```text
Péthar/
├── package.json                 # Mobile platform runner (npm run android, android:apk, ios, ios:xcode)
├── apps/
│   ├── android/                 # 🤖 ANDROID PLATFORM (Mobile Client)
│   │   ├── run.sh               # Runs app on connected Android phone or emulator
│   │   ├── build-apk.sh         # Compiles release APK (app-release.apk)
│   │   └── README.md
│   │
│   └── ios/                     # 🍎 iOS PLATFORM (iPhone / iPad Client)
│       ├── run.sh               # Runs app on iOS Simulator or physical iPhone
│       ├── open-xcode.sh        # Opens Runner.xcworkspace in Xcode
│       └── README.md
│
├── pethar-wallet/               # 📱 Native Mobile Engine (Flutter 3.x / Dart 3.x)
│   ├── android/                 # Android Gradle native configuration
│   ├── ios/                     # iOS Runner native Xcode project
│   ├── lib/                     # Flutter mobile screens, state, and services
│   ├── assets/                  # Currency flag assets
│   ├── test/                    # Mobile test suite
│   └── pubspec.yaml             # Mobile-only dependencies
│
└── archive/                     # 📦 Master Consolidated Archive Directory
    ├── archive-offline-features/# Legacy Cashu, BLE, NFC, Merchant, and Agent systems
    ├── archive-platforms/       # Preserved Web, POS, and Desktop Platforms
    │   ├── web-wallet/          # React 19 / TypeScript / Vite / Vercel web portal
    │   ├── pos-terminal/        # Merchant POS register & thermal printer modules
    │   └── desktop-client/      # macOS Runner & Electron wrapper
    └── exchange-and-fx/         # Old dynamic fiat FX rate engines & cron sync jobs
```

---

## ⚡ Quick Run Reference

From the root directory:

| Target Platform | Command | What it does |
|---|---|---|
| **🤖 Android** | `npm run android` | Deploys & runs native Android app on device/emulator |
| **📦 Android APK** | `npm run android:apk` | Compiles `app-release.apk` for direct phone download |
| **🍎 iOS** | `npm run ios` | Runs native iOS app in iOS Simulator or iPhone |
| **🛠️ iOS Xcode** | `npm run ios:xcode` | Opens Xcode workspace for signing and TestFlight |
| **🧪 Mobile Tests** | `npm run test` | Runs the full Flutter test suite |
| **🔍 Static Analysis** | `npm run analyze` | Runs Dart static analysis with fatal warnings |

---

## 📦 Master Unified Archive

For documentation and reactivation instructions for legacy components:
- **Offline & Merchant Features:** See `archive/archive-offline-features/`
- **Web Portal:** See `archive/archive-platforms/web-wallet/README.md`
- **Merchant POS Terminal:** See `archive/archive-platforms/pos-terminal/README.md`
- **Desktop Client:** See `archive/archive-platforms/desktop-client/README.md`
- **Dynamic FX & Exchange Engines:** See `archive/exchange-and-fx/README.md`
