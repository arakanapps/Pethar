# Péthar Architecture & Production Roadmap

## Architectural Scope: Native Android & iOS Mobile-First

For the current release phase, the Péthar platform is locked strictly to **native Android and iOS** mobile clients powered by the Flutter mobile engine (`pethar-wallet`).

All non-mobile client surfaces (**Web Application, Merchant POS Terminal, and Desktop Client**) have been formally moved out of the active workspace into [`archive-platforms/`](archive-platforms/). This narrows the attack surface, eliminates web-specific vulnerability vectors, and focuses release engineering entirely on native mobile performance, hardware key vaults, and offline resilience on physical mobile devices.

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
       │  ├── auth.users & public.profiles (Identity & KYC level)    │
       │  ├── accounts & double-entry journal (Immutable balances)   │
       │  ├── transactions & transfer state machine (Idempotency)    │
       │  ├── security_events & audit logs (Tamper-evident log)      │
       │  └── Row-Level Security (RLS: Tenant-isolated boundaries)   │
       └─────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ (Cold Storage / Archived)
                       ┌──────────────┴──────────────┐
                       │    archive-platforms/       │
                       │    ├── web-wallet/          │
                       │    ├── pos-terminal/        │
                       │    └── desktop-client/      │
                       └─────────────────────────────┘
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

4. **Archived Platform Modules (`archive-platforms/`):**
   - `archive-platforms/web-wallet/`: Full React 19 / TypeScript / Vite / Vercel web wallet codebase.
   - `archive-platforms/pos-terminal/`: Merchant Point-of-Sale UI and hardware receipt modules.
   - `archive-platforms/desktop-client/`: macOS Runner, Electron wrapper, and desktop portal screen.

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
