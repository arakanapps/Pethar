# PeThar (ဖေ့သာ) — Arakan Financial Infrastructure

**အာရက္ခအမျိုးသား ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်နှင့် အချုပ်အခြာအာဏာပိုင် ငွေကြေးစနစ်**

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

## Repository status

| Area | Current state |
| --- | --- |
| Web app | React + TypeScript + Vite wallet prototype |
| Mobile/POS | Planned clients; shared domain contracts should come first |
| Ledger | PostgreSQL double-entry migration with idempotent posting function |
| Payments | Mock UI flows only; no live provider integration |
| Crypto | Mock USDT presentation only; no custody, exchange, or blockchain settlement |
| Compliance | Product requirements and controls are still to be implemented with qualified counsel |
| Production readiness | Not ready for real money |

## Current prototype

The web prototype is in [`pethar-wallet/`](pethar-wallet/). It currently demonstrates:

- Home wallet with AKD, PeThar Unit, and USDT sample balances
- Send flow with recent contacts and a keypad
- Receive flow with PeThar QR and crypto deposit presentation
- Scan and agent cash-out screens
- Arakanese and English labels, offline-ready messaging, and security cues

Run it locally:

```bash
cd pethar-wallet
npm install
npm run dev
```

Build and test for production:

```bash
cd pethar-wallet
npm run build
```

## Repository layout

```text
PeThar/
├── db/
│   └── migrations/              # PostgreSQL schema and ledger functions
├── docs/                        # Product, architecture, and operating decisions
├── pethar-wallet/               # Current React/Vite web prototype
│   ├── src/components/          # Reusable UI and QR presentation
│   ├── src/data.ts              # Prototype-only sample data
│   ├── src/screens.tsx          # Wallet flows and screen composition
│   ├── src/types/               # Shared frontend domain types as they emerge
│   └── src/App.tsx              # Web prototype entry point
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

As services are implemented, the intended product structure is:

```text
apps/
├── web/                         # Customer web app and operations console
├── mobile/                      # Android and iOS client
└── pos/                         # Agent/POS client with offline mode
services/
├── identity/                    # Authentication, devices, KYC/KYB workflows
├── ledger/                      # Money movement and ledger orchestration
├── payments/                    # Provider adapters and webhooks
├── fx/                          # Rate sourcing, quotes, spreads, expiry
├── crypto/                      # Compliance-gated partner and chain adapters
└── notifications/               # SMS, push, email, and receipts
packages/
├── contracts/                   # Versioned API and event schemas
├── domain/                      # Shared money, currency, and risk rules
└── design-system/               # Accessible web/mobile design tokens
infra/
├── environments/                # IaC and deployment configuration
└── observability/               # Logs, metrics, traces, and alert rules
```

The future structure is documented here first so the team can migrate by bounded capability rather than moving files prematurely.

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

## License

No open-source license has been selected yet. Until a license is added, all rights are reserved by the project owner.