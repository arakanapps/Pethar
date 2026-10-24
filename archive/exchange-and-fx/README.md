# Archive: Fiat Exchange Engines & Foreign Exchange (FX) Rate Trackers

This directory contains decommissioned legacy modules, API handlers, and tracking engines that formerly provided dynamic fiat currency conversions and live foreign exchange rate feeds.

## Decommission Summary
In earlier iterations of Péthar (ဖေ့သာ), the system maintained dynamic FX rate boards and fiat currency conversion mechanisms (including tracking MMK, THB, and USD currency conversions with spread basis points `spread_bps`).

As part of the final architectural consolidation:
1. **Dynamic Fiat FX Engine Retired**: Live exchange rate boards, dynamic fiat spread calculations, and oracle sync cron jobs are retired.
2. **1:1 Hard-Pegged Dual-Wallet Model Adopted**: The active monorepo is consolidated exclusively into a **1:1 hard correlation** between the internal AKD database ledger (`akd_wallets`) and public Web3 stablecoin balances (`crypto_wallets` with USDT and USDC) with $0.00 gas fees and row-level ACID locking.
3. **Security & Stability**: Eliminates currency volatility risks, external oracle failure vectors, and front-running on exchange rate spreads.

## Archived Components
- `fx-rates/index.ts`: Legacy Supabase Edge Function that queried the dynamic `fx_rate_board` table to serve pair prices, spreads, and liquidity providers.
- Relational schema tracking dynamic `fx_rates` and `fx_rate_board` tables (with `spread_bps`, `rate`, `pair`, `base_currency`, `quote_currency`).
