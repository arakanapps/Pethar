# Péthar Master Archive Directory (`archive/`)

This directory serves as the unified master backup repository for all decommissioned platforms, offline features, legacy agent cashout systems, and dynamic fiat exchange engines.

## Archive Structure

```text
archive/
├── offline-core/          # Offline Cashu/Chaumian e-cash, BLE mesh, NFC services and screens
├── telecom-billing/       # Mobile Topup and Utility Bill payment modules (MPT, ATOM, Mytel, U9)
├── merchant-ops/          # Merchant management dashboards, store profiles, and vendor logic
├── agent-network/         # Physical Cash-Out logic, escrow locks, and human agent modules
├── exchange-and-fx/       # Dynamic FX rate trackers, currency conversion spreads, and exchange cron jobs
└── platforms/             # Decommissioned Web, POS, and Desktop platform codebases
    ├── desktop-client/    # macOS Runner, Electron wrapper, and desktop portal
    ├── pos-terminal/      # Merchant POS touchscreen register & thermal receipt engine
    └── web-wallet/        # React 19 / TypeScript / Vite / Tailwind / Vercel web wallet
```

## Architectural Consolidation Notice
Active production development is strictly locked to **native Android & iOS mobile clients** (`pethar-wallet/lib/`) backed by an online **PostgreSQL / Supabase / Drizzle** dual-wallet ledger enforcing a static **1.00 AKD = 1.00 USD (1.00 ₳ = $1.00)** hard peg between internal AKD ledger entries and inbound Web3 stablecoins (USDT/USDC).
