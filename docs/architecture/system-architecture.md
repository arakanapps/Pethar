# Péthar Enterprise Architecture Specification

## 1. Monorepo Structural Blueprint

Péthar organizes its mobile-first financial infrastructure and archived legacy components into an enterprise monorepo:

```text
PeThar/
├── .github/                     # Enterprise CI/CD, Auditing & PR Enforcement
├── apps/                        # Platform launcher bridges
│   ├── android/                 # Android run & release scripts
│   └── ios/                     # iOS run & Xcode project openers
├── pethar-wallet/               # Native Android & iOS Flutter Mobile Application (lib/)
├── db/                          # Database schemas & SQL migrations (schema.ts, enterprise_database.sql)
├── drizzle/                     # Drizzle ORM re-export and configuration
├── supabase/                    # Supabase Edge Functions & Auth Middleware
├── docs/                        # Enterprise Architecture, Security & Compliance
└── archive/                     # Master Consolidated Archive Directory
    ├── offline-core/            # Cashu, BLE, and NFC offline bearer token modules
    ├── telecom-billing/         # Mobile top-up & utility billing services
    ├── merchant-ops/            # Merchant dashboard & vendor management
    ├── agent-network/           # Physical cash-out & human agent network
    ├── exchange-and-fx/         # Dynamic FX rate engines & cron jobs
    └── platforms/               # Preserved Web (Vite/React), POS, and Desktop platforms
```

---

## 2. Active Scope & Edge Infrastructure

Active production runtime is focused strictly on the **native Android & iOS mobile client** and the **PostgreSQL / Supabase / Drizzle dual-wallet ledger**. Legacy web portals and desktop platforms are archived in `archive/platforms/`.

```mermaid
graph TD
    Client[📱 Native Mobile Client (Android & iOS)] -->|HTTPS / TLS 1.3| Edge[⚡ Supabase Edge Functions]
    Edge --> AuthMid[🛡️ auth-middleware.ts]
    AuthMid -->|JWT Verification & Email Check| DB[(🐘 PostgreSQL Dual-Wallet Ledger)]
    
    subgraph Ledger [Dual-Wallet Architecture (1.00 AKD = 1.00 USD)]
        DB --> AKD[Main Wallet (akd_wallets) - $0.00 Gas P2P]
        DB --> Crypto[Crypto Gateway (crypto_wallets) - USDT / USDC]
        AKD <-->|1:1 In-App Swap (FOR UPDATE Lock)| Crypto
    end
```

---

## 3. Cryptographic Receipt Verification Architecture

Every transaction committed online produces a deterministically verifiable receipt:

1. **Receipt Generation:**
   - Unique reference identifier: `500...` (14-digit integer).
   - Sender & recipient public IDs, timestamp, and transaction category.
2. **Dual-Wallet Ledger Guarantee:**
   - Transactions recorded with fixed `NUMERIC(18, 2)` decimal precision.
   - P2P transfers execute with $0.00 gas fees via ACID transactions.
   - Confirms `1.00 AKD = 1.00 USD` (`1.00 ₳ = $1.00`) reserve collateralization.
