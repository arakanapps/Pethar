# Péthar (ဖေ့သာ) — Sovereign Mobile Financial Infrastructure

<div align="center">

**ခေတ်မီ ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်နှင့် လုံခြုံစိတ်ချရသော မိုဘိုင်းလ် အချုပ်အခြာ ပိုက်ဆံအိတ် (Android & iOS)**

[![Péthar Enterprise Mobile CI](https://github.com/arakanapps/Pethar/actions/workflows/ci.yml/badge.svg)](https://github.com/arakanapps/Pethar/actions/workflows/ci.yml)
[![Security Audit](https://github.com/arakanapps/Pethar/actions/workflows/security-audit.yml/badge.svg)](https://github.com/arakanapps/Pethar/actions/workflows/security-audit.yml)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20Mobile--Only-blue.svg)](apps/)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20%7C%20PostgreSQL-3ECF8E.svg)](supabase/)
[![License](https://img.shields.io/badge/License-Proprietary%20Enterprise-blue.svg)](LICENSE)

[Mobile Apps](apps/) • [Architecture](ARCHITECTURE.md) • [Database](supabase/) • [Documentation](docs/) • [Archived Platforms](archive-platforms/) • [Compliance](COMPLIANCE.md)

</div>

---

## Strategic Architecture Focus: Native Android & iOS Only

For the current release phase, the Péthar engineering focus is dedicated strictly to native **Android and iOS** mobile clients (`pethar-wallet` Flutter engine) backed by a hardened **PostgreSQL / Supabase** ledger. 

All non-mobile client surfaces (**Web App, Merchant POS Terminal, and Desktop Client**) have been decoupled and archived into [`archive-platforms/`](archive-platforms/) to eliminate release surface area, optimize CI execution, and guarantee native mobile security on physical smartphones.

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                Active Production Monorepo                   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌──────────────────────────────┐                       ┌──────────────────────────────┐
│  Mobile Engine (Flutter 3.x) │                       │  Backend Ledger (PostgreSQL) │
│  • Android (APK / AAB)       │ ◄─── REST / RPC ────► │  • Supabase Enterprise DB    │
│  • iOS (Runner / IPA)        │     Authenticated     │  • Row-Level Security (RLS)  │
│  • Local Hardware Encryption │     Row-Level Sec     │  • Double-Entry Journal      │
│  • Offline Dynamic AK QR     │                       │  • Idempotent Transfer RPC   │
└──────────────────────────────┘                       └──────────────────────────────┘
                                      ▲
                                      │ (Preserved in Cold Storage)
                       ┌──────────────┴──────────────┐
                       │    archive-platforms/       │
                       │    ├── web-wallet/          │
                       │    ├── pos-terminal/        │
                       │    └── desktop-client/      │
                       └─────────────────────────────┘
```

---

## Core Mobile Capabilities

### 1. Dual-Wallet Architecture (Online Cloud + Offline Vault)
- **Primary Online Account (Supabase PostgreSQL):** Instant ledger settlement, audited double-entry accounting, real-time balance synchronization, and verified peer-to-peer transfers over secure TLS.
- **Local Vault Storage (Hardware Keystore):** Cryptographic keys and session tokens protected by SQLCipher-backed SQLite (`sqflite_sqlcipher`) and secure device storage (`flutter_secure_storage`).

### 2. Arakan QR (AK QR) Dynamic Payments & Receipts
- **Customer Scan-to-Pay:** High-speed camera QR code recognition and dynamic merchant bill parsing.
- **Verifiable Digital e-Receipts:** Scannable payment slips encoding cryptographically verifiable transaction hashes (`reference_id`).

### 3. Native Device Optimization & Distribution
- **Android Target:** Optimized for budget and high-end ARM devices (`arm64-v8a`, `armeabi-v7a`) with split ABI packaging, ProGuard minimization, and direct APK download support.
- **iOS Target:** Native Xcode workspace with Swift Runner, biometric authentication (Face ID / Touch ID), and iOS keychain entitlement bindings.

---

## Monorepo Layout

```text
PeThar/
├── .github/                     # 🛡️ Enterprise CI/CD & Automated Testing
│   └── workflows/ci.yml         # Native Android (APK/AAB) & iOS Runner CI Pipeline
│
├── apps/                        # 📱 Mobile Platform Launchers
│   ├── android/                 # Android run & release build scripts
│   │   ├── run.sh               # Run on Android phone or emulator
│   │   ├── build-apk.sh         # Compile release APK
│   │   └── README.md
│   └── ios/                     # iOS run & Xcode setup scripts
│       ├── run.sh               # Run on iOS Simulator or iPhone
│       ├── open-xcode.sh        # Open Runner.xcworkspace
│       └── README.md
│
├── pethar-wallet/               # 📱 Native Mobile Engine (Flutter 3.x / Dart 3.x)
│   ├── android/                 # Native Android Gradle configuration
│   ├── ios/                     # Native iOS Runner Xcode project & Podfile
│   ├── lib/                     # Application logic, state, and UI screens
│   │   ├── app_state.dart       # State management & session lifecycle
│   │   ├── i18n.dart            # Arakanese & English bilingual localization
│   │   ├── main.dart            # Flutter app entrypoint
│   │   ├── screens/             # Mobile screens (Home, Send, Pay, Auth, Settings)
│   │   ├── services/            # Supabase service, local storage, auth service
│   │   └── widgets/             # Mobile UI widgets, keypad, Arakan emblem
│   ├── assets/                  # Currency flag assets & graphics
│   ├── test/                    # Mobile unit and widget test suite
│   └── pubspec.yaml             # Mobile-only Flutter dependencies
│
├── supabase/                    # 🔒 Supabase Backend & Database Migrations
│   ├── migrations/              # PostgreSQL schema, RLS policies & double-entry ledger
│   └── functions/               # Edge functions (OTP verification & transactions)
│
├── db/                          # 🗄️ Database Client & Verification SQL
├── drizzle/                     # ⚡ Drizzle ORM Schema & Migration tooling
├── scripts/                     # 🔧 Signing key generation & deployment utilities
│
└── archive-platforms/           # 📦 Preserved Web, POS, and Desktop Codebases
    ├── web-wallet/              # React 19 / TypeScript / Vite / Vercel web app
    ├── pos-terminal/            # Point-of-Sale UI and terminal hardware modules
    └── desktop-client/          # macOS Runner, Electron wrapper, and desktop portal
```

---

## Getting Started

### Prerequisites
- **Flutter SDK:** v3.29.x or later
- **Dart SDK:** v3.x
- **Java:** JDK 17 (Zulu / Temurin recommended for Android Gradle)
- **Xcode:** 15.x or later (for iOS development on macOS)
- **Node.js:** v20.x (for database migrations and backend tooling)

### 1. Mobile Development Setup
```bash
# Clone the repository
git clone https://github.com/arakanapps/Pethar.git
cd Pethar

# Fetch Flutter dependencies
cd pethar-wallet
flutter pub get
```

### 2. Static Analysis & Tests
```bash
# Run Dart static analyzer (fatal warnings enabled)
npm run analyze
# or: cd pethar-wallet && dart analyze --fatal-warnings

# Run full mobile unit and widget test suite
npm run test
# or: cd pethar-wallet && flutter test
```

### 3. Running on Devices

#### Android Phone / Emulator
```bash
# Run debug build
npm run android
# or: ./apps/android/run.sh

# Build release APK
npm run android:apk
# or: ./apps/android/build-apk.sh
```

#### iOS Simulator / iPhone
```bash
# Run on iOS simulator
npm run ios
# or: ./apps/ios/run.sh

# Open Xcode workspace for signing and device configuration
npm run ios:xcode
# or: ./apps/ios/open-xcode.sh
```

---

## Archived Platforms Reference

To inspect or reactivate the legacy multi-platform components:
- **Web App:** Refer to [`archive-platforms/web-wallet/README.md`](archive-platforms/web-wallet/README.md)
- **Merchant POS Terminal:** Refer to [`archive-platforms/pos-terminal/README.md`](archive-platforms/pos-terminal/README.md)
- **Desktop Client:** Refer to [`archive-platforms/desktop-client/README.md`](archive-platforms/desktop-client/README.md)

---

## Security & Compliance

Péthar is engineered for defense-in-depth with zero hardcoded credentials and strict row-level security. For security disclosures or bug bounty inquiries, refer to [SECURITY.md](SECURITY.md) or contact `pethar-app@protonmail.com`.
