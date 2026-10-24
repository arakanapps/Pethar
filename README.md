# Péthar (ဖေ့သာ) — Sovereign Mobile Financial Infrastructure

<div align="center">

**ခေတ်မီ ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်နှင့် လုံခြုံစိတ်ချရသော မိုဘိုင်းလ် အချုပ်အခြာ ပိုက်ဆံအိတ် (Android & iOS)**

[![Péthar Enterprise Mobile CI](https://github.com/arakanapps/Pethar/actions/workflows/ci.yml/badge.svg)](https://github.com/arakanapps/Pethar/actions/workflows/ci.yml)
[![Security Audit](https://github.com/arakanapps/Pethar/actions/workflows/security-audit.yml/badge.svg)](https://github.com/arakanapps/Pethar/actions/workflows/security-audit.yml)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20Mobile--Only-blue.svg)](apps/)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20%7C%20PostgreSQL-3ECF8E.svg)](supabase/)
[![Currency Peg](https://img.shields.io/badge/Peg-1.00%20AKD%20%3D%201.00%20USD%20(1.00%20%E2%82%B3%20%3D%20%241.00)-emerald.svg)](db/schema.ts)
[![License](https://img.shields.io/badge/License-Proprietary%20Enterprise-blue.svg)](LICENSE)

[Mobile Apps](apps/) • [Architecture](ARCHITECTURE.md) • [Database](supabase/) • [Documentation](docs/) • [Archive](archive/) • [Compliance](COMPLIANCE.md)

</div>

---

## Strategic Architecture Focus: Native Android & iOS Mobile-First

For the current production release, Péthar is dedicated exclusively to native **Android and iOS** mobile clients (`pethar-wallet/lib/`) backed by a hardened **PostgreSQL / Supabase / Drizzle** ledger.

All legacy non-mobile platforms (**React/Vite Web App, Merchant POS Terminal, Desktop Runners**) and offline legacy features (**Offline Cashu e-cash, BLE/NFC mesh, Telecom Topup, Physical Agent Cash-Out, and Dynamic FX tracking**) have been consolidated into root [`archive/`](archive/) to eliminate attack surfaces, streamline CI execution, and guarantee bank-grade security on physical smartphones.

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
│  • Hardware Keystore Vault   │     Row-Level Sec     │  • 1.00 AKD = 1.00 USD Peg   │
│  • P2P Transfers & Swaps     │                       │  • Idempotent Transfer RPC   │
└──────────────────────────────┘                       └──────────────────────────────┘
                                      ▲
                                      │ (Master Archive / Cold Storage)
                       ┌──────────────┴──────────────────────────────┐
                       │                   archive/                  │
                       │   ├── offline-core/                         │
                       │   ├── telecom-billing/                      │
                       │   ├── merchant-ops/                         │
                       │   ├── agent-network/                        │
                       │   ├── exchange-and-fx/                      │
                       │   └── platforms/                            │
                       └─────────────────────────────────────────────┘
```

---

## Dual-Wallet Database Architecture (`1.00 AKD = 1.00 USD` Hard Peg)

The relational ledger enforces an exact 1:1 hard peg between internal Arakan Dollars (AKD / ₳) and USD-backed stablecoins (`NUMERIC(18, 2)`):

### 1. `users` Table (Supabase Auth Identity)
- `id` (UUID, Primary Key): 1:1 relation to Supabase Auth (`auth.users.id`).
- `email` (VARCHAR(255), Unique, Not Null)
- `username` (VARCHAR(50), Unique)
- `status` ('pending_otp' | 'active', Not Null, default 'pending_otp')
- `created_at` (TIMESTAMPTZ)

### 2. `akd_wallets` Table (Main Wallet: Internal Digital Ledger)
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK -> `users.id`, Unique, Cascade Delete)
- `currency` (VARCHAR(8), default 'AKD')
- `balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `balance >= 0.00`)
- **Zero Gas Fees:** Instant P2P transfers execute with **$0.00 gas fees** via atomic SQL transactions (`p2p_transfer_akd`).

### 3. `crypto_wallets` Table (USD Crypto Gateway)
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK -> `users.id`, Unique, Cascade Delete)
- `deposit_address` (VARCHAR(128), Unique): Generated public EVM blockchain address for inbound USDT and USDC.
- `usdt_balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `>= 0.00`)
- `usdc_balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `>= 0.00`)
- **1:1 In-App Swaps:** Pure atomic 1:1 swaps (`1.00 AKD = 1.00 USD`, `1.00 ₳ = $1.00`) using `FOR UPDATE` row-level locking to eliminate race conditions and double-spending.

---

## 4-Route Mobile Authentication & OTP Verification

The mobile application enforces strict conditional authentication across 4 dedicated flows:

1. **Email Login:** Input `Email` + `PIN` ➔ Verify `Email OTP` ➔ Route to `Home`
2. **Google Login:** Tap `Google Sign-In` ➔ Enter `Access PIN` ➔ Route to `Home`
3. **Email Signup:** Input `Email` + `Create PIN` ➔ Verify `Email OTP` ➔ Route to `Home`
4. **Google Signup:** Tap `Google Sign-In` ➔ `Create PIN` ➔ Route to `Home`

### Designated System Test OTP Account
For testing and automated verification, use the system test credentials:
- **Test Email:** `realjackhalder@gmail.com`
- **Test OTP Code:** `123456` (10-minute expiry window)

---

## Production Security Harness

### Mobile Hardware Keychain Storage (`app_state.dart`)
- **Android:** Hardware-backed `EncryptedSharedPreferences` via Android Keystore (AES-256 GCM).
- **iOS:** Hardware Keychain with `KeychainAccessibility.first_unlock`.
- **Zero Plain-Text Credentials:** Access Tokens, Refresh Tokens, and encrypted PIN hashes are strictly stored in hardware-level secure storage. Never written to plain SharedPreferences.

### Server-Side Endpoint Auth (`supabase/functions/`)
- Every API request is verified on the server using `supabase.auth.getUser(token)`.
- Enforces short-lived JWTs with automatic Refresh Token rotation.
- Authoritative email confirmation check (`email_confirmed_at`).
- Strict HTTPS/TLS domain validation to prevent Man-in-the-Middle (MITM) attacks.

---

## Monorepo Layout

```text
PeThar/
├── .github/                     # 🛡️ Enterprise CI/CD & Automated Testing
│   └── workflows/ci.yml         # Native Android (APK/AAB) & iOS Runner CI Pipeline
│
├── apps/                        # 📱 Mobile Platform Launchers
│   ├── android/                 # Android run & release build scripts (run.sh, build-apk.sh)
│   └── ios/                     # iOS run & Xcode setup scripts (run.sh, open-xcode.sh)
│
├── pethar-wallet/               # 📱 Native Mobile Engine (Flutter 3.x / Dart 3.x)
│   ├── android/                 # Native Android Gradle configuration
│   ├── ios/                     # Native iOS Runner Xcode project & Podfile
│   ├── lib/                     # Application logic, state, and UI screens
│   │   ├── app_state.dart       # Hardware keychain token & PIN storage
│   │   ├── i18n.dart            # Arakanese & English bilingual localization
│   │   ├── main.dart            # Flutter app entrypoint
│   │   ├── screens/             # Mobile screens (Home, Send, Pay, Auth, Settings)
│   │   ├── services/            # Supabase service, auth service, local storage
│   │   └── widgets/             # UI widgets, Arakan emblem, biometric modals
│   ├── assets/                  # Currency flag assets & graphics
│   ├── test/                    # Mobile unit and widget test suite
│   └── pubspec.yaml             # Mobile-only Flutter dependencies
│
├── supabase/                    # 🔒 Supabase Backend & Database Migrations
│   ├── migrations/              # PostgreSQL schema, RLS policies & dual-wallet ledger
│   └── functions/               # Edge functions (auth-middleware, verify-otp, post-transaction)
│
├── db/                          # 🗄️ Database Schema & Drizzle ORM
│   ├── schema.ts                # Dual-Wallet Drizzle ORM schema (1.00 AKD = 1.00 USD)
│   ├── client.ts                # PostgreSQL connection pooling & atomic swap methods
│   └── enterprise_database.sql  # Consolidated PostgreSQL enterprise schema
│
├── drizzle/                     # ⚡ Drizzle Schema Re-export & Tooling
├── scripts/                     # 🔧 Database verification & utility scripts
│
└── archive/                     # 📦 Unified Master Backup Directory
    ├── offline-core/            # Legacy Cashu tokens, BLE, and NFC modules
    ├── telecom-billing/         # MPT, ATOM, Mytel, and U9 airtime topup modules
    ├── merchant-ops/            # Merchant dashboards, store profiles, and vendor logic
    ├── agent-network/           # Physical Cash-Out logic, escrow locks, and agent hubs
    ├── exchange-and-fx/         # Dynamic FX rate trackers, spreads, and exchange cron jobs
    └── platforms/               # Preserved Web Wallet, POS Terminal, and Desktop Client
```

---

## Getting Started

### Prerequisites
- **Flutter SDK:** v3.29.x or later
- **Dart SDK:** v3.x
- **Java:** JDK 17 (Zulu / Temurin recommended for Android Gradle)
- **Xcode:** 15.x or later (for iOS development on macOS)
- **Node.js:** v20.x / Deno v1.x (for database migrations and edge functions)

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
# Run Dart static analyzer
cd pethar-wallet && flutter analyze

# Run full mobile unit and widget test suite
cd pethar-wallet && flutter test
```

### 3. Running on Devices

#### Android Phone / Emulator
```bash
./apps/android/run.sh
# Build release APK:
./apps/android/build-apk.sh
```

#### iOS Simulator / iPhone
```bash
./apps/ios/run.sh
# Open in Xcode:
./apps/ios/open-xcode.sh
```

---

## Master Unified Archive Reference

To inspect or reactivate archived legacy platforms and non-mobile features:
- **Offline Core (Cashu e-cash, BLE, NFC):** [`archive/offline-core/`](archive/offline-core/)
- **Telecom & Bill Payment:** [`archive/telecom-billing/`](archive/telecom-billing/)
- **Merchant Operations:** [`archive/merchant-ops/`](archive/merchant-ops/)
- **Agent Cash-Out Network:** [`archive/agent-network/`](archive/agent-network/)
- **Dynamic FX & Rates:** [`archive/exchange-and-fx/`](archive/exchange-and-fx/)
- **Archived Platforms (Web, POS, Desktop):** [`archive/platforms/`](archive/platforms/)

---

## Security & Contact

Péthar is engineered for defense-in-depth with zero hardcoded credentials and strict row-level security. For security disclosures, vulnerability reporting, or support inquiries, contact the security team:
- **Official Security & Project Email:** `pethar-app@protonmail.com`
- **Security Policy:** [SECURITY.md](SECURITY.md)
