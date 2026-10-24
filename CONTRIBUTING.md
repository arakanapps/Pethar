# Contributing to Péthar (ဖေ့သာ)

Thank you for contributing to **Péthar**, the resilient financial infrastructure for Arakan and global digital commerce.

---

## 1. Development Lifecycle & Standards

### Branching Strategy
* `main`: Production-ready code for the native Android and iOS client and backend ledger.
* `develop`: Active integration branch for upcoming releases.
* `feature/<name>`: Feature branches cut from `develop`.
* `fix/<name>`: Bug fixes and security patches.

### Conventional Commits
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
* `feat:` New user-facing capability or service.
* `fix:` Bug fix or vulnerability remediation.
* `docs:` Documentation or ADR modifications.
* `refactor:` Code restructuring without logic alterations.
* `style:` UI theming, visual styling, or cosmetic changes.
* `test:` Unit or integration test cases.
* `chore:` Build scripts, dependencies, or monorepo configurations.

---

## 2. Local Setup & Verification

### Mobile Engine (`pethar-wallet`)
```bash
# Clone the repository
git clone https://github.com/arakanapps/Pethar.git
cd Pethar/pethar-wallet

# Install mobile dependencies
flutter pub get

# Run test suite
flutter test

# Run static analysis
flutter analyze
```

### Backend & Database (`db/` & `supabase/`)
```bash
# Edge Function middleware tests
deno test supabase/functions/auth-middleware_test.ts

# Drizzle ORM schema validation
npx drizzle-kit check
```

---

## 3. Core Enterprise Invariants

1. **Brand Fidelity:** All user-facing references MUST use **Péthar** (ဖေ့သာ).
2. **Hard Currency Peg:** `1.00 AKD = 1.00 USD` (`1.00 ₳ = $1.00`) must remain exact across all screens, balance badges, and ledger entries with fixed `NUMERIC(18, 2)` decimal precision.
3. **Hardware Keystore Vault:** Sensitive tokens and PIN hashes must NEVER be stored in plain `SharedPreferences`. Use `flutter_secure_storage` (Android `EncryptedSharedPreferences` / iOS `KeychainAccessibility.first_unlock`).
4. **Server-Side Endpoint Auth:** Edge functions must validate every request with `supabase.auth.getUser()`, require confirmed emails, and enforce HTTPS/TLS domain validation.
5. **System Test OTP Account:** Designated test email is `realjackhalder@gmail.com` (OTP: `123456`).
6. **Official Contact & Security:** Inquiries and vulnerability disclosures must be directed to `pethar-app@protonmail.com`.
7. **Archived Platforms Quarantined:** Non-mobile platforms (Web, POS, Desktop) and legacy offline mesh features remain isolated in root `/archive/` and must not be imported into active mobile runtime code.
