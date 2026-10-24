# Péthar Enterprise Security Policy

**Péthar (ဖေ့သာ)** adheres to defense-in-depth principles across its native mobile client and PostgreSQL / Supabase dual-wallet ledger infrastructure.

---

## 1. Reporting a Vulnerability

We welcome responsible security research. Please do **NOT** open public GitHub issues for security vulnerabilities.

Submit reports privately to our security operations team:
* **Official Security & Project Email:** [pethar-app@protonmail.com](mailto:pethar-app@protonmail.com)
* **Response SLA:** Initial triage within 24 hours; status updates every 48 hours.

### What to Include
1. Component or repository path (e.g. `pethar-wallet/lib/`, `supabase/functions/auth-middleware.ts`, `db/schema.ts`).
2. Detailed proof of concept (PoC) or reproducible steps.
3. Assessment of vulnerability impact and potential exploit vectors.
4. Redacted logs or packet traces (strictly remove all tokens, secrets, or keys).

---

## 2. Hardware Security & Mobile Key Vault

Péthar isolates all sensitive cryptographic credentials and session tokens from plain user storage:
* **Hardware-Backed Keystore & Keychain:**
  * **Android:** Hardware-backed `AndroidKeyStore` utilizing `EncryptedSharedPreferences` (AES-256 GCM authenticated encryption).
  * **iOS:** iOS Keychain Services utilizing `KeychainAccessibility.first_unlock` backed by the Secure Enclave.
* **Token & Secret Protection:**
  * Access tokens, refresh tokens, and encrypted user PIN hashes (SHA-256) are stored exclusively in hardware secure storage via `flutter_secure_storage`.
  * Zero session tokens or credentials are ever written to unencrypted `SharedPreferences` or local SQLite files.
  * Instant session zeroization: Logging out or resetting the account invokes `clearUserSession()`, immediately purging all hardware keychain entries and resetting memory state.

---

## 3. Server-Side Authentication & Endpoint Security

All backend API requests across `supabase/functions/` must satisfy strict security guarantees before ledger access is granted:
* **Server-Side Token Verification:**
  * Every incoming request is authenticated using `supabase.auth.getUser(token)` against the server-side auth provider.
  * Short-lived JWTs are required; expired tokens return `401 Unauthorized` (`TOKEN_EXPIRED`) requiring refresh token rotation.
* **Email Confirmation Check:**
  * Users must possess a verified `email_confirmed_at` timestamp. Unconfirmed accounts return `403 Forbidden` (`EMAIL_NOT_CONFIRMED`).
  * Designated testing account `realjackhalder@gmail.com` is configured for sandbox testing with OTP verification.
* **Strict Transport Security (HTTPS/TLS):**
  * Edge functions enforce strict HTTPS/TLS domain validation. Non-HTTPS requests are rejected immediately with `403 Forbidden` (`HTTPS_REQUIRED`).
  * Mandatory TLS 1.3 with strict HSTS, `X-Content-Type-Options: nosniff`, and restrictive CORS headers.

---

## 4. Dual-Wallet Financial Ledger Integrity

* **Hard Peg Equivalence:**
  * Internal Arakan Dollar (`AKD`) balance is pegged 1:1 with USD (`1.00 AKD = 1.00 USD` / `1.00 ₳ = $1.00`).
  * Fixed decimal precision: PostgreSQL `NUMERIC(18, 2)` eliminates floating-point rounding errors and drift.
* **Concurrency & Race Condition Prevention:**
  * Zero-gas-fee P2P transfers execute in isolated PostgreSQL ACID transactions (`p2p_transfer_akd`).
  * In-app 1:1 swaps (`swap_crypto_to_akd`, `swap_akd_to_crypto`) utilize PostgreSQL `FOR UPDATE` row-level locks on both `akd_wallets` and `crypto_wallets` rows to prevent double-spending and race conditions.
  * Non-negative balance constraints (`CHECK (balance >= 0.00)`) are enforced at the database engine level.

---

## 5. Data Minimization & Privacy

* **Authentication Scopes:** Only standard identity scopes (`openid`, `email`, `profile`) are requested via Google Sign-In.
* **No Unnecessary Scopes:** Péthar will never request Google Drive, Gmail, or Contact read/write access.
* **Zero Telemetry Tracking:** No third-party ad pixels or commercial trackers are embedded in the mobile application.
* **Data Erasure (GDPR Art. 17):** Users can permanently delete their accounts and credentials by contacting [pethar-app@protonmail.com](mailto:pethar-app@protonmail.com).

---

## 6. Archived Systems

Non-mobile platforms (Web React/Vite, POS Terminal, Desktop Electron/macOS) and legacy offline mesh features (Cashu Chaumian e-cash, BLE, NFC) have been consolidated into the root `/archive/` directory for historical reference and are quarantined from the active production runtime.
