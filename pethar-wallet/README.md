# Péthar wallet prototype

This repository contains a React + TypeScript + Vite web prototype and Flutter mobile client. The product is **not a production financial service**: screens may be illustrative, transfers and exchanges are not enabled, and this repository does not verify reserves, licensing, custody, or bank connectivity.

## Database architecture

Supabase PostgreSQL is the intended source of truth for identity-linked profiles, accounts, and financial ledger data. Drizzle is used for PostgreSQL schema tooling. The client must never receive a database connection string or Supabase service-role credential. Browser/mobile clients use only a publishable/anon key, and only with tested row-level security; balance-changing operations belong in an authenticated trusted server endpoint or reviewed database transaction function. Firebase/Firestore remains in portions of the Flutter app and must be removed or assigned a clearly non-financial role before production. MongoDB/MySQL are not part of the intended wallet architecture.

The hosted Vercel website does not itself provide a safe transaction processor. Configure frontend environment values in Vercel and secret server values only in managed server settings. `VITE_*` variables are public in built frontend assets; never put secrets in them.

## Local setup

```bash
cd pethar-wallet
npm ci
cp ../.env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project values.
npm run dev
```

For migrations, use a protected local/CI environment with a staging Supabase project first. Back up the database; reconcile existing currency values before applying currency constraints. Review every RLS policy, SQL function grant, and user/account identity mapping. Run multi-user isolation tests before production. Do not run migrations against production based on this README alone.

## Checks

```bash
npm run build
npm test
```

The TypeScript production build currently passes, but `npm test` fails in ESLint with numerous existing errors. A passing web build alone does not establish financial safety or Android readiness.

## Android

Use `./apps/android/run.sh` for development and `./apps/android/build-apk.sh` for a release artifact. Supply Firebase client settings using Flutter build-time `--dart-define` values (`FIREBASE_API_KEY`, `FIREBASE_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, and `FIREBASE_STORAGE_BUCKET`, and optionally `FIREBASE_MEASUREMENT_ID` / `FIREBASE_IOS_BUNDLE_ID`) via `--dart-define=FIREBASE_API_KEY=...` (repeat for each setting). These are public client settings, not server secrets; supply them through your deployment configuration, not committed files. Android's Gradle build no longer consumes a checked-in `google-services.json`. The prebuilt Flutter web bundle is not checked in; regenerate it with the same `--dart-define` values when building for web. The current Gradle release configuration uses debug signing and the package ID is `com.example.pethar_mobile`; both must be replaced and verified before distribution. `lib/services/local_storage_service.dart` currently includes an in-memory implementation; its encrypted-SQL example is not an implemented persistence layer.

## Before any real-user financial pilot

Choose supported jurisdictions and obtain qualified legal/compliance advice. Build and independently review a server-authoritative double-entry ledger with atomic, idempotent transfers; owner-scoped RLS; KYC/AML and sanctions controls as applicable; limits and fraud monitoring; audit logging; reconciliation; tested backups/recovery; incident response; secure release signing; and Android device/session protection. Keep the launch scope narrow and use staged testing with no real funds until these controls are verified.
