/**
 * Drizzle ORM Schema Export (db/schema.ts)
 * Re-exports clean online-only dual-wallet schema definitions.
 * All dynamic fx_rates, conversion_spreads, source_currency columns, and legacy fiat exchange
 * engines have been completely purged and isolated to archive/exchange-and-fx/.
 * The database ledger exclusively enforces a static 1:1 hard correlation between
 * internal AKD digital ledger entries and inbound Web3 stablecoin balances (USDT/USDC).
 */

export * from '../drizzle/schema';
