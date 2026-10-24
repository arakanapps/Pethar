# Péthar Architecture & Production Roadmap

## Architectural Scope: Native Android & iOS Mobile-First

For the current release phase, the Péthar platform is locked strictly to **native Android and iOS** mobile clients powered by the Flutter mobile engine (`pethar-wallet`).

All non-mobile client surfaces (**Web Application, Merchant POS Terminal, and Desktop Client**), offline hardware cashout modules, and dynamic fiat exchange/FX tracking engines have been formally moved out of the active workspace into [`archive/`](archive/). This narrows the attack surface, eliminates web-specific vulnerability vectors, and focuses release engineering entirely on native mobile performance, hardware key vaults, and online 1:1 dual-wallet transfers and crypto gateway swaps.

---

## Current Topology & System Boundaries

```text
       ┌─────────────────────────────────────────────────────────────┐
       │             Native Mobile Clients (Flutter 3.x)             │
       │    • Android (pethar-wallet/android/ — APK / AAB)           │
       │    • iOS     (pethar-wallet/ios/     — Runner / IPA)        │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      │ HTTPS / TLS 1.3
                                      │ Authenticated User JWT + Anon Key
                                      │ Zero Service-Role Secrets on Device
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │           Supabase PostgreSQL (System of Record)            │
       │  ├── auth.users & public.users (Identity & KYC level)       │
       │  ├── akd_wallets (Main internal digital ledger, $0 gas fee) │
       │  ├── crypto_wallets (USDT/USDC Web3 stablecoin gateway)     │
       │  ├── 1:1 In-App Swaps (swap_crypto_to_akd, swap_akd_to_...)  │
       │  ├── transactions & P2P state machine (Idempotency)         │
       │  └── Row-Level Security (RLS: Strict user-boundary lock)    │
       └─────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ (Master Archive / Cold Storage)
                       ┌──────────────┴──────────────────────────────┐
                       │                   archive/                  │
                       │   ├── archive-offline-features/             │
                       │   ├── archive-platforms/                    │
                       │   └── exchange-and-fx/                      │
                       └─────────────────────────────────────────────┘
```

---

## Active Monorepo Components

1. **Mobile Application Engine (`pethar-wallet/`):**
   - Retains strictly the `android/`, `ios/`, `lib/`, `test/`, and `assets/` directories.
   - Cleaned of all web/Vite and desktop plugins in `pubspec.yaml`.
   - Uses `flutter_secure_storage` and `sqflite_sqlcipher` for hardware-backed local credential protection.
   - All financial mutations are routed through database RPCs (`post_transaction`, `transfer_balance_akd`) rather than client-side direct writes.

2. **Backend & Ledger Engine (`supabase/` & `db/`):**
   - **PostgreSQL Database:** Authoritative ledger containing double-entry records, account state machines, and idempotent transfer routines (`reference_id` uniqueness).
   - **Row-Level Security (RLS):** Every table enforces strict user ownership checks (`user_id = auth.uid()`). Direct mutations by unauthorized roles are rejected at the database engine level.
   - **Drizzle Tooling (`drizzle/`):** TypeScript-based schema and migration management for the PostgreSQL database.

3. **Platform Launchers (`apps/`):**
   - `apps/android/`: Direct APK compilation script (`build-apk.sh`) and device runner (`run.sh`).
   - `apps/ios/`: Native Xcode workspace opener (`open-xcode.sh`) and simulator runner (`run.sh`).

4. **Unified Master Archive (`archive/`):**
   - `archive/archive-offline-features/`: Legacy Cashu, BLE, NFC, Merchant operations, and physical Agent network systems.
   - `archive/archive-platforms/`: Archived Web Wallet (React 19/Vite), POS terminal screen, and Desktop client (macOS/Electron).
   - `archive/exchange-and-fx/`: Legacy dynamic fiat foreign exchange rate tracking engines, oracle listeners, and live rate boards.

---

## Mobile Release Checklist

### Android (`android/`)
- Replace package identifier with company-owned namespace (`uk.co.pethar.wallet`) before public distribution.
- Configure production release keystore signing via CI secrets; never commit keystore files or passwords to version control.
- Validate release APK & AppBundle (AAB) builds with ProGuard/R8 shrinking enabled.
- Verify that runtime permissions (Camera for QR, Biometrics for login) are requested contextually and gracefully handle denial.

### iOS (`ios/`)
- Verify signing profiles and entitlements in `ios/Runner.xcworkspace`.
- Ensure NSCameraUsageDescription and NSFaceIDUsageDescription strings are localized in English and Burmese/Arakanese.
- Verify zero warnings or unresolved CocoaPods in the iOS build pipeline.

---

## Continuous Integration & Automated Verification

The automated CI workflow (`.github/workflows/ci.yml`) executes exclusively for mobile targets:
1. **Analysis & Tests:** Runs `dart analyze --fatal-warnings` and `flutter test` across all mobile unit and widget tests.
2. **Android Build:** Compiles both release APK (`flutter build apk --release`) and release AppBundle (`flutter build appbundle --release`), verifying output binaries.
3. **iOS Build:** Builds the native iOS Runner (`flutter build ios --release --no-codesign`) on macOS runners.
4. **Security Audit:** Scans for hardcoded credentials, exposed private keys, and unencrypted secrets.
