-- ============================================================================
-- Migration: 20261024000002_purge_fx_rates_and_dynamic_exchange.sql
-- Purge Dynamic FX Rate Boards, Spreads, and Legacy Fiat Exchange Engines
-- 
-- System consolidated strictly into a static 1:1 hard correlation between
-- internal AKD ledger (akd_wallets) and public Web3 stablecoins (USDT/USDC).
-- ============================================================================

-- 1. DROP DYNAMIC FX TABLES & SPREAD TRACKERS
DROP TABLE IF EXISTS public.fx_rate_board CASCADE;
DROP TABLE IF EXISTS public.fx_rates CASCADE;

-- 2. DROP RETIRED DYNAMIC CONVERSION PROCEDURES
DROP FUNCTION IF EXISTS public.request_akd_to_usd(NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.convert_usd_to_akd(NUMERIC) CASCADE;

-- 3. ENSURE 1:1 DUAL-WALLET SWAP INVARIANTS
-- Swaps are strictly 1:1 hard-pegged via public.swap_crypto_to_akd and public.swap_akd_to_crypto
COMMENT ON TABLE public.akd_wallets IS 'Internal Arakan Dollar (AKD / ₳) ACID digital ledger, 1:1 hard correlation with USD stablecoins, $0.00 gas fees';
COMMENT ON TABLE public.crypto_wallets IS 'Inbound Web3 USD Gateway (USDT/USDC stablecoins), 1:1 hard correlation with AKD ledger';
