# Changelog

All notable changes to Péthar (ဖေ့သာ) will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] — 2026-10-22

### Added
- Enterprise web wallet (React 19 + TypeScript + Vite) at `app.pethar.co.uk`
- Subdomain routing: `auth`, `admin`, `download`, `docs`, `privacy`
- Stable currency peg: 1 ₳ = $1.00 USD
- Cryptographically verifiable e-Receipts with scannable QR codes
- Flutter native mobile engine (Android + iOS) with offline payment support
- Cashu-inspired Chaumian e-cash bearer tokens for offline BLE/NFC transfers
- Supabase PostgreSQL backend with Row-Level Security
- Supabase Edge Functions: `verify-otp`, `fx-rates`, `post-transaction`, `process-transaction`
- Drizzle ORM schema and migration pipeline
- Firebase Auth integration (Google Sign-In + Email/Password)
- Direct mobile distribution: APK download + iOS Configuration Profile
- Enterprise CI/CD: GitHub Actions for web build, Flutter analysis, and security scanning
- Full documentation suite: architecture, compliance, security threat model, API spec

### Security
- Defense-in-depth authentication with OTP verification
- Firestore security rules hardened
- Production database hardening migrations
- AKD transfer idempotency protection
