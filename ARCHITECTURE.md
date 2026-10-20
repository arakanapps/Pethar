# Péthar architecture and production roadmap

## Current state (verified in this repository)

- The browser application is React + TypeScript + Vite in `pethar-wallet/`; Vercel hosts the website according to the project owner. Hosting the site does not provide a secure financial transaction backend.
- Web data access uses the Supabase JavaScript client. SQL migrations and `drizzle.config.ts` target PostgreSQL. **Supabase PostgreSQL should be the sole system of record for user identities, accounts, and the financial ledger.** Firebase/Firestore code remains in the Flutter client and needs an explicit migration or narrowly defined non-financial role before production. MongoDB and MySQL appear in environment templates only; no production use is confirmed here.
- Screens still contain prototype/demo flows. The current web build can pass, but project-wide lint/test errors remain; the project must not be represented as production-ready.
- This repository does not establish that AKD has reserves, a peg, licenses, banking rails, live exchange markets, or offline settlement. Do not state such claims as facts unless independently verified and approved.

## Target production topology

```text
Flutter Android/iOS + React/Vercel web
                 │ HTTPS; user-scoped identity
                 ▼
       Trusted API / transaction service
                 │ restricted server credential; validated inputs
                 ▼
       Supabase PostgreSQL (system of record)
       ├── profiles and KYC references
       ├── accounts and immutable double-entry journal
       ├── transfer state machine/idempotency records
       └── audit/security events
```

Vercel can serve static/frontend code and host server functions if suitable for your operational model; never send a Supabase service-role key to a browser or mobile app. Client access to Supabase must use the publishable/anon key only with rigorously tested RLS. Financial writes should go through a trusted endpoint or carefully reviewed database RPC that verifies identity, authorization, limits, idempotency, and account status, then posts balanced journal entries atomically. Derive balances from ledger entries or maintain transactionally updated projections; do not accept client-supplied balances. Keep credentials in Vercel/Supabase secret management, not repository files.

## Database and migration procedure

1. Confirm the intended Supabase project and take a verified backup. Do not run migrations against production until staging validation and a recovery plan exist.
2. Establish one migration source of truth (`supabase/migrations`). Review the existing schema for ownership keys and legacy data; reconcile unsupported currencies before applying the supported set: **AKD, USD, USDC, USDT, MMK**.
3. Test migrations against a disposable/staging Supabase database. Verify authenticated owner reads, participant transaction reads, anonymous denial, cross-user denial, and prohibited direct financial writes. Review every `SECURITY DEFINER` function and its `search_path`/grants.
4. Apply reviewed migrations through the Supabase CLI / deployment process, then verify schema, policy behavior, backups, and application health. Never hand out database credentials or expose service-role credentials.
5. Current owner-scoped policies need a schema audit: transactions are scoped through JSON metadata in the new policy, which is less robust than explicit sender/recipient user/account relationships; accounts use `user_id = auth.uid()`, so confirm type and identity mapping. Ensure no permissive pre-existing policy grants broader access. Policy migrations alone do not guarantee private data.

The OTP server still optionally contains legacy MongoDB behavior for OTP persistence; it is not a financial system of record and requires a secure migration or explicit retirement. MongoDB/MySQL placeholders were removed from the root environment template. Remove unused dependencies after verifying actual deployments. `DATABASE_URL` is an administrative/migration credential and must be server/CI-only. Vite `VITE_*` values are public by design.

## Android release checklist

- Replace `com.example.pethar_mobile` with a company-owned application ID before first public release; align Firebase registration and OAuth package/signing SHA fingerprints.
- Configure production release signing with a protected keystore/signing service; current Gradle config signs release with the **debug** key. Never commit signing secrets.
- Build and test release artifacts on supported physical Android versions and devices; run Flutter analysis/tests, dependency/license/security scans, accessibility and network-failure tests, crash reporting, staged rollout, and update/rollback drills.
- The local storage service currently has an in-memory implementation; its SQLCipher code is only documented example, not active persistence. Do not cache authoritative balances or claim encrypted persistent storage until implemented and independently reviewed. Use Android Keystore-backed key protection, safe session renewal, and minimize sensitive local data.
- Add server-side idempotent transfer handling, atomic double-entry accounting, limits, fraud monitoring, audit trails, reconciliation, support/dispute paths, backup/restore drills, and incident response before any real funds.
- Before offering a financial/crypto product, get qualified advice on UK and every target-market licensing, safeguarding, KYC/AML/sanctions, consumer disclosures, privacy/data retention, and app-store obligations. Technology changes do not confer authorization.

## Immediate priorities

1. Resolve project-wide lint errors and eliminate remaining demo content/claims from launch paths.
2. Choose the supported product scope and jurisdictions with legal/compliance guidance.
3. Complete schema/ownership/RLS review and build an authenticated server-side ledger API.
4. Validate on staging with automated multi-user isolation, concurrency, idempotency, and recovery tests.
5. Only then run a limited, appropriately authorized pilot and monitor it continuously.
