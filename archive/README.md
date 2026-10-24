# Péthar Master Archive Directory (`archive/`)

This directory serves as the unified master backup repository for all decommissioned platforms, offline features, legacy agent cashout systems, and dynamic fiat exchange engines.

## Archive Structure

```text
archive/
├── archive-offline-features/    # Legacy Cashu tokens, BLE, NFC, Merchant Ops, and Agent Network
│   ├── agent-network/           # Physical agent counter withdrawals & cash-out routers
│   ├── merchant-ops/            # Enterprise merchant store profiles & settlement logic
│   ├── offline-core/            # Offline voucher encryption, BLE mesh, and Cashu tokens
│   └── telecom-billing/         # MPT, ATOM, Mytel, and U9 airtime top-up modules
│
├── archive-platforms/           # Decommissioned Web, POS, and Desktop platform codebases
│   ├── desktop-client/          # macOS Runner, Electron wrapper, and desktop portal
│   ├── pos-terminal/            # Merchant POS touchscreen register & thermal receipt engine
│   └── web-wallet/              # React 19 / TypeScript / Vite / Tailwind / Vercel web wallet
│
└── exchange-and-fx/             # Decommissioned dynamic fiat FX tracking engines & cron jobs
    ├── README.md                # Decommission documentation and architectural rationale
    └── fx-rates/                # Supabase Edge Function that queried live dynamic rate boards
```

## Architectural Consolidation Notice
Active production development is strictly locked to **native Android & iOS mobile clients** (`pethar-wallet`) backed by an online **PostgreSQL / Supabase** dual-wallet ledger enforcing a static **1:1 hard correlation** between internal AKD ledger entries and inbound Web3 stablecoins (USDT/USDC).
