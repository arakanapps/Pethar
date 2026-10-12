# PeThar (ဖေ့သာ) — Arakan Financial Infrastructure

**အာရက္ခအမျိုးသား ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်နှင့် ခေတ်မီငွေကြေးစနစ်**

PeThar is a financial services platform for Arakan communities and their global connections. The product is designed to make everyday payments, agent-assisted cash access, international transfers, foreign-exchange conversion, and digital-asset services easier to use when local cash is worn, scarce, or difficult to move.

> **Important:** this repository contains a product prototype and an early ledger design. It is not a licensed bank, payment institution, money transmitter, exchange, or custody service. No real funds, private keys, identity documents, or production credentials belong in this repository.

## Product vision

PeThar should become a trusted, accessible wallet for web, Android, iOS, and POS devices:

- AKD  wallet with transparent balances and receipts
- Person-to-person transfers using phone numbers, PeThar IDs, and QR codes
- Agent cash-in and cash-out for communities with limited connectivity
- Signed offline vouchers that can reconcile safely when a device reconnects
- FX quotes with visible rates, fees, spreads, expiry, and rate source
- International rails through licensed partners, subject to sanctions and corridor rules
- Crypto and fiat-backed stablecoin services only through approved, compliant partners
- Arakanese-first, plain-language UX with accessibility and low-bandwidth support
- **အာရက္ခပြည်သူတွေအတွက် ငွေပေးချေမှု၊ ငွေလွှဲမှုနဲ့ ငွေသားရရှိမှုကို လုံခြုံ၊ ရိုးရှင်းပြီး ယုံကြည်စိတ်ချရအောင် ပြုလုပ်ရန်။**

## Multi-Platform Ecosystem

PeThar is organized as a multi-platform monorepo supporting **Web**, **Android**, **iOS**, **Merchant POS**, and **Desktop**:

| Platform | Directory | Framework / Core | Status & Capabilities |
| :--- | :--- | :--- | :--- |
| **🌐 Web** | [`apps/web/`](apps/web/) | React 19 + TypeScript + Vite + Tailwind CSS | Full responsive wallet, simulator controls (skin toggle, device frames) |
| **🤖 Android** | [`apps/android/`](apps/android/) | Flutter 3.47+ / Android Gradle (Kotlin) | Native Android APK & AAB, Material 3, camera QR scanner, haptics |
| **🍎 iOS** | [`apps/ios/`](apps/ios/) | Flutter 3.47+ / iOS Runner (Swift, CocoaPods) | Native iPhone/iPad experience, Dynamic Island skin, Secure Enclave ready |
| **🏪 Merchant POS** | [`apps/pos/`](apps/pos/) | React / Flutter dual-engine POS | Cashier terminal, numeric keypad, fast presets, dual-display QR, thermal receipts |
| **💻 Desktop** | [`apps/desktop/`](apps/desktop/) | Flutter Desktop (macOS/Win/Linux) + Electron | Full-screen multi-column workstation for agents, accounting & treasury |

For complete documentation on platform architecture and run scripts, see [`PLATFORMS.md`](PLATFORMS.md).

---

## Quick Launch & Scripts

Run any platform directly from the repository root:

```bash
# Web application (http://localhost:3000)
npm run web

# Android client (emulator or connected phone)
npm run android

# Build standalone Android APK
npm run android:apk

# iOS client (iPhone simulator or connected device)
npm run ios

# Open iOS project in Xcode
npm run ios:xcode

# Merchant POS Terminal (touchscreen checkout UI)
npm run pos

# macOS Desktop application
npm run desktop

# Electron Desktop application
npm run desktop:electron
```

---

## Repository Layout

```text
PeThar/
├── apps/                        # Platform launchers and entry points
│   ├── web/                     # 🌐 Web application (scripts, symlinks, docs)
│   ├── android/                 # 🤖 Android client (run script, APK builder)
│   ├── ios/                     # 🍎 iOS client (run script, Xcode launcher)
│   ├── pos/                     # 🏪 Merchant POS terminal (dual-engine)
│   └── desktop/                 # 💻 Desktop application (macOS + Electron)
│
├── pethar-wallet/               # React + TypeScript + Vite web app & skin simulator
│   ├── src/components/          # Reusable UI, QR presentation & POS terminal
│   ├── src/data.ts              # Sample accounts, transactions, and agents
│   ├── src/screens.tsx          # Main wallet screen flows
│   ├── src/types/               # Domain TypeScript interfaces
│   └── src/App.tsx              # Web app root with platform routing (?platform=...)
│
├── pethar_mobile/               # Cross-platform Flutter engine (Dart 3.13+)
│   ├── android/                 # Native Android gradle configuration & manifest
│   ├── ios/                     # Native iOS Runner Xcode project & Podfile
│   ├── macos/                   # Native macOS desktop runner
│   ├── web/                     # Flutter web output harness
│   ├── lib/                     # Clean architecture screens, state & widgets
│   └── test/                    # Automated widget and unit tests
│
├── db/                          # PostgreSQL ledger migrations & double-entry engine
├── docs/                        # Architecture decisions & operating manuals
├── PLATFORMS.md                 # Master multi-platform matrix and guides
├── package.json                 # Monorepo task orchestration
└── README.md                    # Project overview & roadmap
```

## Financial safety principles

PeThar cannot honestly promise that an app is impossible to hack. The engineering goal is layered resilience and controlled recovery:

1. Keep customer funds in a regulated safeguarding model with licensed partners.
2. Use an append-only, double-entry ledger; never treat a cached balance as the source of truth.
3. Make every money-moving request authenticated, authorized, idempotent, rate-limited, and auditable.
4. Separate customer, agent, reserve, fee, suspense, and settlement accounts.
5. Use hardware-backed key management, least privilege, independent security review, and tested incident response.
6. Apply KYC/KYB, AML, sanctions screening, transaction monitoring, dispute handling, and travel-rule requirements where applicable.
7. Do not support crypto custody, fiat-backed stablecoins, cards, or international corridors until licensing, partner due diligence, reserves, redemption, and consumer disclosures are approved.

The migration in [`db/migrations/001_initial_revised.sql`](db/migrations/001_initial_revised.sql) is a useful foundation, but it still requires migrations tests, authorization boundaries, operational tooling, reconciliation jobs, and a production threat model.

## Delivery roadmap

### Phase 0: product and legal foundation

- Confirm the operating company, jurisdictions, ownership, and licensing strategy.
- Define supported corridors, currencies, limits, fees, complaints, refunds, and safeguarding model.
- Create terms and conditions, privacy/data protection notice, acceptable-use rules, risk disclosures, and agent agreement with counsel.

### Phase 1: reliable domestic wallet

- Implement identity, device binding, KYC tiers, wallet creation, transfer limits, and receipts.
- Add a backend API around the ledger migration with strict authorization and idempotency.
- Build agent onboarding, cash-in/cash-out settlement, reconciliation, disputes, and support tooling.
- Add automated database, API, security, and failure-recovery tests.

### Phase 2: resilient access

- Ship Android, iOS, and POS clients from shared contracts.
- Implement signed offline vouchers with replay protection, expiry, device revocation, and reconciliation monitoring.
- Add accessibility, Burmese localization, low-bandwidth behavior, and safe recovery for lost devices.

### Phase 3: regulated international and digital-asset services

- Integrate licensed payment, card, remittance, and FX partners through isolated adapters.
- Add quote locking, transparent FX spread, settlement reconciliation, and corridor-specific compliance.
- Add crypto/stablecoin features only after custody, wallet screening, chain monitoring, reserve/redemption, tax, and consumer-risk controls are approved.

## Documentation map

- [`CONTRIBUTING.md`](CONTRIBUTING.md): development workflow and change requirements
- [`SECURITY.md`](SECURITY.md): vulnerability reporting and security boundaries
- [`docs/README.md`](docs/README.md): product and architecture documentation map
- [`docs/product-principles.md`](docs/product-principles.md): customer, compliance, and design principles

## Contact & Support

For inquiries, support, and security disclosures:

- **Official Secure Email**: [`pethar-app@protonmail.com`](mailto:pethar-app@protonmail.com)
- **Telegram Support**: [@petharsupport](https://t.me/petharsupport)
- **Official Web Portal**: [www.pethar.co.uk](https://www.pethar.co.uk)

## License

No open-source license has been selected yet. Until a license is added, all rights are reserved by the project owner.