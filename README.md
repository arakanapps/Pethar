# Pe Thar (ဖေ့သာ) — Resilient Digital Cash Infrastructure

**ခေတ်မီ ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်နှင့် လုံခြုံစိတ်ချရသော ပိုက်ဆံအိတ်**

**Pe Thar (ဖေ့သာ)** is the Arakanese word for *money* or *currency*. It is an enterprise-grade digital cash and wallet platform designed for resilient community commerce and borderless financial transactions.

```
                           [ pethar.co.uk ]
                 Public Enterprise Landing & Download Hub
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       [ auth.pethar.co.uk ]             [ Mobile Installation ]
     Firebase Identity Gateway           • Android: Direct APK
      (Google / Email + Pass)            • iOS: Config Profile (.mobileconfig)
                 │
  ┌──────────────┴──────────────┐
  ▼                             ▼
[ app.pethar.co.uk ]    [ admin.pethar.co.uk ]
Customer Wallet Hub     Internal Treasury Ops
• 1 ₳ = 1 $ Cashflow    • USDT / USDC / USD1 Reserves
• Online Cloud Sync     • Offline Batch Reconciliation
• Mobile Download Link  • Ledger Telemetry
```

---

## Core System Architecture

### 1. Stable Peg: 1 ₳ = 1 $ (AKD to USD Parity)
* **User-Facing Simplicity:** Balances are held and denominated in **₳** (Arakan Dollar). $1\ \text{₳} = \$1.00\ \text{USD}$. Users enjoy stable digital cash without exposure to market volatility or complex blockchain mechanics.
* **Internal Stablecoin Backing:** In the backend treasury, all circulating ₳ is collateralized 1:1 by audited USD reserves and major crypto stablecoins (**USDT, USDC, USD1**). Crypto complexities and gas fees are handled invisibly by internal infrastructure.

### 2. Dual Connectivity: Online + Offline Mode
* **Online Mode (Web & Mobile):** Instant cloud-ledger settlement, live balance updates, real-time transaction history, and multi-user transfers powered by Google Cloud and Firebase.
* **Offline Mode (Exclusively on Android & iOS):** Built into the native Flutter mobile client (`pethar_mobile`). Powered by a Cashu-inspired Chaumian e-cash bearer token model:
  * **Device-to-Device Data Handshake:** Transact phone-to-phone without cellular networks, internet connections, or SIM cards.
  * **Native Transport Channels:** Supports Bluetooth Low Energy (BLE), NFC tap-to-pay, and offline dynamic animated QR codes.
  * **Contextual Permission Handling:** The app prompts for device permissions (Nearby Devices / Bluetooth / Camera) only when initiating a transfer.
  * **Automatic Reconciliation:** When either device reconnects to internet or Starlink, the signed transaction envelope syncs and finalizes against the central ledger.

### 3. Direct Mobile Distribution (Zero Store Gatekeeping)
To ensure reliable access independent of app store delays or regional restrictions:
* **Android:** Direct APK download (`pethar-latest.apk`) with published SHA-256 integrity checksums.
* **iOS:** Direct Configuration Profile (`pethar.mobileconfig` / OTA Profile) for instantaneous home screen installation without App Store friction.
* **Web:** Universal online wallet accessible across all desktop and mobile browsers at `app.pethar.co.uk`.

### 4. Device-Adaptive App Icon Theming (iOS 18 & Android Material You)
Pe Thar features full, native adaptive icon theming matching modern operating system design guidelines:
* **Light Theme (`icon-light.png`):** Clean white continuous-curvature squircle with vivid crimson brand emblem for standard daylight mode.
* **Dark Theme (`icon-dark.png`):** Deep matte obsidian squircle (`#18181B`) with high-contrast crimson emblem matching iOS 18 dark theme and OLED battery-saving standards.
* **Tinted Theme (`icon-tinted.png`):** Deep graphite squircle (`#22232D`) with a metallic silver-grey luminance gradient emblem, engineered for iOS 18 dynamic tinting and Android Material You dynamic color palettes.

---

## Subdomain Matrix

| Domain | Role & Audience | Key Capabilities |
| :--- | :--- | :--- |
| **`pethar.co.uk`** | Global Public | Public homepage, `1 ₳ = 1 $` presentation, Online + Offline Mode showcase, direct download buttons. |
| **`download.pethar.co.uk`** | Mobile Visitors | Direct APK installer for Android, Configuration Profile installer for iOS, and verification hashes. |
| **`auth.pethar.co.uk`** | All Users | Unified authentication gateway: Google Sign-In & Email/Password. No web biometrics required. |
| **`app.pethar.co.uk`** | Registered Customers | Online wallet hub: balance management, payments, cashflow statements, and mobile app download bridge. |
| **`admin.pethar.co.uk`** | Internal Finance & Ops | Multi-sig treasury reserve management (USDT/USDC/USD1), offline batch settlement queue, and node telemetry. |
| **`privacy.pethar.co.uk`** | Public & Compliance | Google Cloud Console OAuth 2.0 compliant privacy policy, data protection, and self-service deletion rights. |

---

## Authentication & Privacy Standards

1. **Frictionless Entry:** Sign up in seconds with **Continue with Google** (Firebase Auth) or **Name + Email + Password**.
2. **Progressive Identity:** No citizenship documents, national ID cards, phone SMS gates, or photo KYC required to open and use a standard wallet.
3. **Google API Compliance:** 
   * Requests only standard identity scopes: `openid`, `email`, and `profile`.
   * No access to sensitive user data (no Gmail, Drive, Contacts, or Calendar).
   * User data is never sold, brokered, or used for advertising.
4. **Account & Data Deletion:** Users can request full deletion of personal records and wallet profiles at `privacy@pethar.co.uk`.

---

## Repository Structure

```text
PeThar/
├── pethar-wallet/               # 🌐 Web Application (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── src/pages/Main.tsx       # Unified enterprise landing page
│   ├── src/pages/DashboardPage.tsx # Unified app.pethar.co.uk wallet & platform dashboard
│   ├── src/pages/subdomains/    # Subdomain pages (Auth, Admin, Privacy, Download, Docs)
│   ├── public/                  # Static assets & Adaptive App Icons (Light, Dark, Tinted)
│   ├── src/utils/subdomain.ts   # Subdomain routing and multi-tenancy helper
│   └── src/lib/firebase.ts      # Firebase Authentication & Google Cloud integration
│
├── pethar_mobile/               # 📱 Native Mobile Engine (Flutter 3.x / Dart 3.x)
│   ├── android/                 # Native Android Gradle configuration (Direct APK build)
│   ├── ios/                     # Native iOS Runner (Configuration Profile & OTA ready)
│   ├── lib/screens/             # Mobile screens including offline_payment_screen.dart
│   ├── lib/services/            # Offline payment service (Cashu bearer tokens, BLE, NFC)
│   └── lib/app_state.dart       # State management and local secure storage
│
├── db/                          # 🗄️ Database & Ledger Migrations
│   └── migrations/              # Double-entry append-only accounting schema
│
├── docs/                        # 📚 Architecture, Threat Models & Product Guides
│   ├── pethar-landing-outline.md# Design specifications
│   └── product-principles.md   # Customer and compliance standards
│
└── package.json                 # Monorepo task orchestration
```

---

## Quick Start & Local Development

### 1. Web Ecosystem (`pethar-wallet`)

```bash
# Navigate to web project
cd pethar-wallet

# Install dependencies
npm install

# Start development server
npm run dev
```

To test subdomains locally, use query parameters:
* Landing Page: `http://localhost:5173/`
* Customer Wallet: `http://localhost:5173/?subdomain=app`
* Auth Portal: `http://localhost:5173/?subdomain=auth`
* Admin Treasury: `http://localhost:5173/?subdomain=admin`
* Privacy & Security: `http://localhost:5173/?subdomain=privacy`

### 2. Mobile Client (`pethar_mobile`)

```bash
# Navigate to mobile project
cd pethar_mobile

# Fetch Flutter dependencies
flutter pub get

# Run on connected Android / iOS device
flutter run

# Build release Android APK (for direct download)
flutter build apk --release
```

---

## Security & Operational Principles

1. **Append-Only Double-Entry Ledger:** All accounting transactions follow double-entry debit/credit rules. Balances are derived from cryptographic ledgers, never cached states.
2. **Cryptographic Bearer Integrity:** Offline tokens are protected by cryptographic signatures and nonce checks to prevent replay attacks and double-spending upon reconnection.
3. **Segregated Treasury Reserves:** Customer balances, operational fees, and reserve collateral (USDT/USDC/USD1) remain strictly isolated in segregated accounts.
4. **Responsible Disclosure:** For vulnerability reports and security inquiries, contact `privacy@pethar.co.uk`.

---

## License

All rights reserved © 2026 Pe Thar (`pethar.co.uk`).