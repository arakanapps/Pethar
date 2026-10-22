# Péthar (ဖေ့သာ) — Digital Cash & Financial Infrastructure

<div align="center">

**ခေတ်မီ ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်နှင့် လုံခြုံစိတ်ချရသော အချုပ်အခြာ ပိုက်ဆံအိတ်**

[![Péthar Enterprise CI](https://github.com/realjackhalder/pethar/actions/workflows/ci.yml/badge.svg)](https://github.com/realjackhalder/pethar/actions/workflows/ci.yml)
[![Security Audit](https://github.com/realjackhalder/pethar/actions/workflows/security-audit.yml/badge.svg)](https://github.com/realjackhalder/pethar/actions/workflows/security-audit.yml)
[![Peg Standard](https://img.shields.io/badge/Currency%20Peg-1%20%E2%82%B3%20%3D%20%241.00%20USD-FF6B00.svg)](https://pethar.co.uk)
[![Connectivity](https://img.shields.io/badge/Mode-Online%20%2B%20Offline%20BLE%2FNFC-10B981.svg)](https://download.pethar.co.uk)
[![License](https://img.shields.io/badge/License-Proprietary%20Enterprise-blue.svg)](LICENSE)

[Platform](https://pethar.co.uk) • [Download](https://download.pethar.co.uk) • [Wallet App](https://app.pethar.co.uk) • [Documentation](docs/) • [Architecture](ARCHITECTURE.md) • [Compliance](COMPLIANCE.md) • [Changelog](CHANGELOG.md)

</div>

---

## Executive Overview

**Péthar (ဖေ့သာ)** is the Arakanese word for *money* or *currency*. It represents an enterprise-grade digital cash platform and financial infrastructure designed to provide resilient, censorship-resistant community commerce and stable digital transactions both online and during complete telecommunication cutoffs.

```
                           [ pethar.co.uk ]
                 Public Enterprise Landing & Download Hub
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       [ auth.pethar.co.uk ]             [ Direct Mobile Hub ]
     Firebase Identity Gateway           • Android: Direct APK
      (Google / Email + Pass)            • iOS: Config Profile (.mobileconfig)
                 │
  ┌──────────────┴──────────────┐
  ▼                             ▼
[ app.pethar.co.uk ]    [ admin.pethar.co.uk ]
Customer Wallet Hub     Internal Treasury Ops
• 1 ₳ = 1 $ Cashflow    • USDT / USDC / USD1 Reserves
• Online Cloud Sync     • Offline Batch Settlement
• Verified QR Receipts  • Node Telemetry
```

---

## Core Pillars & Technological Innovations

### 1. Stable Currency Peg: 1 ₳ = $1.00 USD
* **User-Facing Simplicity:** Balances are held and denominated in **₳** (Arakan Dollar). $1\ \text{₳} = \$1.00\ \text{USD}$. Users enjoy stable digital cash without exposure to market volatility or complex gas calculations.
* **Internal Stablecoin Backing:** In the backend treasury, all circulating ₳ is collateralized 1:1 by audited USD reserves and major crypto stablecoins (**USDT, USDC, USD1**). Gas fees and blockchain routing are abstracted completely.

### 2. Dual Connectivity: Online + Offline Mode
* **Online Mode (Web & Mobile):** Instant cloud-ledger settlement, live balance updates, real-time transaction history, and multi-user transfers powered by Google Cloud and Firebase.
* **Offline Mode (Exclusively on Android & iOS):** Built into the native Flutter mobile client (`pethar-wallet`). Powered by a Cashu-inspired Chaumian e-cash bearer token model:
  * **Device-to-Device Data Handshake:** Transact phone-to-phone without cellular networks, internet connections, or SIM cards.
  * **Native Transport Channels:** Supports Bluetooth Low Energy (BLE), NFC tap-to-pay, and offline dynamic animated QR codes.
  * **Contextual Permission Handling:** The app prompts for device permissions (Nearby Devices / Bluetooth / Camera) only when initiating an offline transfer.
  * **Automatic Reconciliation:** When either device reconnects to internet or Starlink, the signed transaction envelope syncs and finalizes against the central ledger.

### 3. Cryptographically Verifiable e-Receipts with Scannable QR Codes
* Replicates official commercial e-Slips with perforated dashed cut-lines, scalloped circular edge punch notches, and sender-to-recipient flow.
* Generates mathematically valid, high-resolution QR codes encoding `https://app.pethar.co.uk/verify/${refId}` that any phone camera can read.
* On-ledger verification modal displaying Merkle tree inclusion proof, block height, and collateral status.

### 4. Direct Mobile Distribution (Zero App Store Friction)
* **Android:** Direct APK download (`pethar-latest.apk`) with published SHA-256 integrity checksums.
* **iOS:** Direct Configuration Profile (`pethar.mobileconfig` / OTA Profile) for instantaneous home screen installation without App Store delays.
* **Universal Web:** Full-featured responsive wallet accessible across all desktop and mobile browsers at `app.pethar.co.uk`.

---

## Subdomain Topology

| Domain | Role & Audience | Key Capabilities |
| :--- | :--- | :--- |
| **`pethar.co.uk`** | Global Public | Public homepage, `1 ₳ = 1 $` presentation, Online + Offline Mode showcase, direct download buttons. |
| **`download.pethar.co.uk`** | Mobile Visitors | Direct APK installer for Android, Configuration Profile installer for iOS, and verification hashes. |
| **`auth.pethar.co.uk`** | All Users | Unified authentication gateway: Google Sign-In & Email/Password. No web biometrics required. |
| **`app.pethar.co.uk`** | Registered Customers | Online wallet hub: balance management, payments, cashflow statements, and verified QR receipts. |
| **`admin.pethar.co.uk`** | Internal Finance & Ops | Multi-sig treasury reserve management (USDT/USDC/USD1), offline batch settlement queue, and node telemetry. |
| **`docs.pethar.co.uk`** | Developers & Partners | API specifications, cryptographic proofs, and SDK integration guides. |
| **`privacy.pethar.co.uk`** | Public & Compliance | Google Cloud Console OAuth 2.0 compliant privacy policy, data protection, and self-service deletion rights. |

---

## Monorepo Architecture

```text
PeThar/
├── .github/                     # 🛡️ Enterprise CI/CD, Security Scanning, and PR Workflows
│   ├── workflows/ci.yml         # Automated Lint, TypeScript Check & Build
│   ├── workflows/security.yml   # Dependency and Secret Scanning
│   └── pull_request_template.md # PR Review Checklist
│
├── pethar-wallet/               # 🌐 Enterprise Web Application (React 19 + TypeScript + Vite)
│   ├── src/pages/Main.tsx       # Unified enterprise landing page
│   ├── src/pages/DashboardPage.tsx # Unified app.pethar.co.uk wallet & platform dashboard
│   ├── src/pages/subdomains/    # Subdomain pages (Auth, Admin, Privacy, Download, Docs)
│   ├── src/components/          # TransactionSlip (QR Receipt), ReceiveQRCard, ArakanEmblem
│   ├── public/                  # Static assets & Adaptive App Icons (Light, Dark, Tinted)
│   └── src/utils/subdomain.ts   # Subdomain routing and multi-tenancy helper
│
├── pethar-wallet/               # 📱 Native Mobile Engine (Flutter 3.x / Dart 3.x)
│   ├── android/                 # Native Android Gradle configuration (Direct APK build)
│   ├── ios/                     # Native iOS Runner (Configuration Profile & OTA ready)
│   ├── lib/screens/             # Mobile screens including offline_payment_screen.dart
│   ├── lib/services/            # Offline payment service (Cashu bearer tokens, BLE, NFC)
│   └── lib/app_state.dart       # State management and local secure storage
│
├── docs/                        # 📚 Enterprise Documentation & ADRs
│   ├── architecture/            # System Architecture and Topology
│   ├── security/                # Threat Model and Cryptographic Specs
│   ├── compliance/              # Privacy, Google OAuth, and Regulatory Policies
│   ├── api/                     # Versioned API Contracts
│   ├── auth/                    # Authentication, KYC, and Identity Flows
│   ├── guides/                  # Setup, Maintenance, and Platform Guides
│   ├── implementation/          # Roadmaps and Implementation Details
│   └── product/                 # Product Vision and Principles
│
├── db/                          # 🗄️ Database Client & SQL Migrations (PostgreSQL)
├── drizzle/                     # ⚡ Drizzle ORM Schema & Migrations
├── supabase/                    # 🔒 Supabase Migrations & Edge Functions
├── scripts/                     # 🔧 Build, Signing, and Utility Scripts
├── apps/                        # 📲 Platform Launcher Scripts (Android, iOS, Desktop, POS, Web)
└── vercel.json                  # 🚀 Enterprise Edge Deployment Configuration
```

---

## Getting Started

### Prerequisites
* **Node.js:** v20.x or later
* **npm:** v10.x or later
* **Flutter SDK:** v3.29.x (for mobile development)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/realjackhalder/pethar.git
cd pethar

# Install and start the web wallet
cd pethar-wallet
npm install
npm run dev

# Run full typecheck and production build
npm run build
```

---

## Security & Compliance

Péthar is engineered for defense-in-depth and compliance with Google API Services Limited Use requirements. For security disclosures or bug bounty inquiries, refer to [SECURITY.md](SECURITY.md) or contact `pethar-app@protonmail.com`.