# Péthar Architecture & Technical Reference

## Architectural Scope: Native Android & iOS Mobile-First

Péthar is engineered exclusively as a native **Android and iOS** mobile financial platform powered by the Flutter mobile engine (`pethar-wallet/lib/`) and backed by a hardened **PostgreSQL / Supabase / Drizzle** backend.

All non-mobile client surfaces (**Web Application, Merchant POS Terminal, and Desktop Client**), offline hardware layers (**Cashu e-cash, BLE/NFC mesh**), physical cash-out agent modules, and dynamic fiat exchange engines have been consolidated into root [`archive/`](archive/). This narrows the attack surface, eliminates web-specific vulnerability vectors, and focuses release engineering entirely on native mobile performance, hardware key vaults, and online 1:1 dual-wallet transfers and crypto gateway swaps.

---

## System Topology & Architecture

```text
       ┌─────────────────────────────────────────────────────────────┐
       │             Native Mobile Clients (Flutter 3.x)             │
       │    • Android (pethar-wallet/android/ — APK / AAB)           │
       │    • iOS     (pethar-wallet/ios/     — Runner / IPA)        │
       │    • Hardware Vault: Keychain / EncryptedSharedPreferences  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      │ HTTPS / TLS 1.3 (Strict Domain Check)
                                      │ Short-Lived JWT + Refresh Token Rotation
                                      │ Zero Service-Role Secrets on Device
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │           Supabase PostgreSQL (System of Record)            │
       │  ├── auth.users & public.users (Identity & status)          │
       │  ├── akd_wallets (Main internal digital ledger, $0 gas fee) │
       │  ├── crypto_wallets (USDT/USDC Web3 stablecoin gateway)     │
       │  ├── 1:1 In-App Swaps (FOR UPDATE row-level locking)         │
       │  ├── transactions & P2P state machine (ACID transfer)       │
       │  └── Row-Level Security (RLS: Strict user-boundary lock)    │
       └─────────────────────────────────────────────────────────────┘
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

The database schema (`db/schema.ts`) strictly enforces an exact 1:1 hard correlation (`1.00 AKD = 1.00 USD` or `1.00 ₳ = $1.00`) with `NUMERIC(18, 2)` decimal precision:

### 1. `users` Table
- `id` (UUID, Primary Key): Directly maps 1:1 to Supabase Auth (`auth.users.id`).
- `email` (VARCHAR(255), Unique, Not Null)
- `username` (VARCHAR(50), Unique)
- `status` (`user_status` enum: `'pending_otp' | 'active'`, default `'pending_otp'`)
- `pin_hash` (VARCHAR(128))
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2. `akd_wallets` Table (Main Wallet: Arakan Dollar Ledger)
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK -> `users.id`, Unique, Cascade Delete)
- `currency` (VARCHAR(8), default `'AKD'`)
- `balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `balance >= 0.00`)
- `gas_fee_rate` (`NUMERIC(18, 2)`, default `0.00`): P2P transfers are free (**$0.00 gas fees**).
- **Execution:** P2P transfers execute via atomic SQL stored procedure (`p2p_transfer_akd`) with sorted user lock ordering to eliminate deadlocks.

### 3. `crypto_wallets` Table (USD Crypto Gateway)
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK -> `users.id`, Unique, Cascade Delete)
- `deposit_address` (VARCHAR(128), Unique): Unique public blockchain address for inbound stablecoins.
- `usdt_balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `usdt_balance >= 0.00`)
- `usdc_balance` (`NUMERIC(18, 2)`, default `0.00`, Constraint `usdc_balance >= 0.00`)
- **1:1 In-App Swaps:** Executed via `swap_crypto_to_akd` and `swap_akd_to_crypto` using `FOR UPDATE` row-level locks on both wallet records to eliminate race conditions and double-spending.

---

## 4-Route Authentication Router & OTP Flow

Mobile authentication follows 4 explicit routes:

1. **Email Login:**
   - Step 1: Input `Email` + `6-digit PIN`
   - Step 2: Trigger and verify `Email OTP` (10-minute validity)
   - Step 3: Route directly to `Home`
2. **Google Login:**
   - Step 1: Authenticate via `Google Sign-In`
   - Step 2: Enter `Access PIN`
   - Step 3: Route directly to `Home`
3. **Email Signup:**
   - Step 1: Input `Email` + `Create PIN` (+ confirm PIN)
   - Step 2: Trigger and verify `Email OTP`
   - Step 3: Issue account and route directly to `Home`
4. **Google Signup:**
   - Step 1: Authenticate via `Google Sign-In`
   - Step 2: Create `Access PIN` (+ confirm PIN)
   - Step 3: Issue account and route directly to `Home`

### Designated OTP Test Account
- **Test Email:** `realjackhalder@gmail.com`
- **Test OTP Code:** `123456`
- Supported across local testing, unit tests, and QA environments.

---

## Production Security Harness

### Mobile Hardware Keychain Storage (`app_state.dart`)
- **Android:** Hardware-backed `EncryptedSharedPreferences` via Android Keystore (AES-256 GCM).
- **iOS:** Hardware Keychain Services with `KeychainAccessibility.first_unlock`.
- **Zero Plain-Text Storage:** Access tokens, refresh tokens, and encrypted SHA-256 PIN hashes are persisted only in the hardware vault. Plain `SharedPreferences` is never used for security-critical data.
- **Cryptographic Purge:** Active key deletion on sign-out or session expiration.

### Server-Side Endpoint Auth (`supabase/functions/`)
- Every endpoint request is authenticated server-side using `supabase.auth.getUser(token)`.
- Client-supplied user identities are never trusted; the verified user UUID is extracted directly from the session token.
- Enforces short-lived JWTs with automatic refresh token rotation.
- Requires confirmed email status (`email_confirmed_at`).
- Enforces strict HTTPS/TLS domain validation to prevent Man-in-the-Middle (MITM) attacks.

---

## Monorepo Layout & Active Scope

```text
PeThar/
├── apps/                        # Mobile platform launchers (Android & iOS scripts)
├── pethar-wallet/               # Active Flutter mobile application codebase
│   ├── android/                 # Native Android configuration
│   ├── ios/                     # Native iOS configuration
│   ├── lib/                     # Mobile Dart source code
│   └── test/                    # Unit and widget test suite
├── supabase/                    # Supabase backend, RLS policies, migrations, edge functions
├── db/                          # Database schema (db/schema.ts) & PostgreSQL client
├── drizzle/                     # Drizzle ORM schema re-export & migrations
└── archive/                     # Master root archive
    ├── offline-core/            # Decommissioned Cashu tokens, BLE, NFC
    ├── telecom-billing/         # Decommissioned mobile top-up & utility bills
    ├── merchant-ops/            # Decommissioned merchant dashboards & vendor logic
    ├── agent-network/           # Decommissioned physical agent cash-out logic
    ├── exchange-and-fx/         # Decommissioned dynamic FX rate engines
    └── platforms/               # Preserved Web Wallet, POS, and Desktop codebases
```

---

## Contact & Security

For security inquiries or vulnerability reports, contact:
- **Email:** `pethar-app@protonmail.com`
- **Repository:** `https://github.com/arakanapps/Pethar.git`
