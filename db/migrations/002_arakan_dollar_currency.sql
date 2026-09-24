-- ============================================================================
-- PeThar (ဖေ့သာ) — Arakan Monetary Migration
-- Revision: 002_arakan_dollar_currency.sql
-- Target: PostgreSQL 14+
--
-- This migration establishes:
--   1. AKD (Arakan Dollar / အာရက္ခဒေါ်လာ) replacing MMK.
--   2. Multi-currency and digital asset account constraints:
--      - Base currency: AKD (Arakan Dollar, 1 AKD = 100 Cent)
--      - Stablecoin & Crypto: USDT, USDC, BTC, ETH
--      - Foreign Exchange Corridors: USD, THB, MYR, SGD, EUR
--   3. POS Merchant Terminal support (merchant_code, terminal_id, batch_settlement)
--   4. Cryptographic offline mesh voucher ledger verification (Ed25519)
--   5. AI Anti-Cyber Threat & Fraud scoring metadata on ledger transactions
-- ============================================================================

BEGIN;

-- 1. Ensure pgcrypto extension for UUIDs and SHA-256 / SHA-3 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Update Currency Domain to Arakan Dollar (AKD)
-- Drop old currency check if exists and re-apply strictly excluding MMK
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_currency_check;

ALTER TABLE accounts
    ADD CONSTRAINT accounts_currency_check
    CHECK (currency IN (
        'AKD',   -- Arakan Dollar (အာရက္ခဒေါ်လာ)
        'USDT',  -- Tether USD (Multi-chain)
        'USDC',  -- USD Coin
        'USD',   -- United States Dollar (Global IBAN Corridor)
        'THB',   -- Thai Baht (Cross-Border Corridor)
        'MYR',   -- Malaysian Ringgit (Cross-Border Corridor)
        'SGD',   -- Singapore Dollar
        'EUR',   -- Euro
        'BTC',   -- Bitcoin
        'ETH'    -- Ethereum
    ));

-- 3. Enhance Transactions for POS, Cross-Border Remittance, and Crypto Swaps
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_transaction_type_check
    CHECK (transaction_type IN (
        'P2P_TRANSFER',            -- Domestic instant transfer (Phone/ID/QR)
        'CASH_IN',                 -- Physical cash-in via verified Arakan Agent
        'CASH_OUT',                -- Physical cash-out via TOTP token at Agent
        'POS_CHECKOUT',            -- Merchant Point of Sale retail payment
        'CRYPTO_SWAP',             -- USDT/USDC to AKD instant swap
        'BINANCE_PAY_DEPOSIT',     -- Direct Binance bridge deposit
        'MEXC_BRIDGE_DEPOSIT',     -- Direct MEXC exchange bridge
        'WISE_REMITTANCE',         -- International inward wire (THB/MYR/USD/EUR)
        'CARD_TOPUP',              -- Visa / Mastercard / AMEX gateway funding
        'COMMISSION_PAYOUT',       -- Agent liquidity commission settlement
        'OFFLINE_VOUCHER_ISSUE',   -- Signed voucher created during outage
        'OFFLINE_VOUCHER_REDEEM',  -- Signed voucher reconciled on re-connection
        'REVERSAL',                -- Cryptographic correction
        'ADJUSTMENT'               -- Regulatory audited balance adjustment
    ));

-- 4. POS Terminals Registry
CREATE TABLE IF NOT EXISTS pos_terminals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_code       VARCHAR(30) UNIQUE NOT NULL,      -- e.g. 'POS-AK-092'
    merchant_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    store_name          VARCHAR(120) NOT NULL,
    store_name_mm       VARCHAR(150),
    township            VARCHAR(80) NOT NULL,
    daily_sales_limit   NUMERIC(15, 2) NOT NULL DEFAULT 50000.00,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DECOMMISSIONED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_merchant ON pos_terminals(merchant_user_id);

-- 5. Foreign Exchange Corridor Rates Board
CREATE TABLE IF NOT EXISTS fx_rate_board (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair                VARCHAR(20) UNIQUE NOT NULL,      -- e.g. 'AKD/THB'
    rate                NUMERIC(18, 6) NOT NULL,
    spread_bps          INT NOT NULL DEFAULT 0,           -- 0 bps for parity
    provider            VARCHAR(50) NOT NULL DEFAULT 'ARAKAN_CENTRAL_BANK',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Exchange Rates
INSERT INTO fx_rate_board (pair, rate, spread_bps, provider)
VALUES
    ('AKD/USD', 1.000000, 0, 'ARAKAN_CENTRAL_BANK'),
    ('AKD/USDT', 1.000000, 0, 'ARAKAN_CENTRAL_BANK'),
    ('AKD/THB', 35.800000, 15, 'WISE_PARTNER_API'),
    ('AKD/MYR', 4.720000, 15, 'WISE_PARTNER_API'),
    ('AKD/SGD', 1.340000, 15, 'PAYONEER_CORRIDOR'),
    ('AKD/EUR', 0.920000, 15, 'GLOBAL_SWIFT_CORRIDOR'),
    ('BTC/AKD', 64500.000000, 25, 'BINANCE_ORACLE')
ON CONFLICT (pair) DO UPDATE
SET rate = EXCLUDED.rate, updated_at = CURRENT_TIMESTAMP;

-- 6. Offline Signed Vouchers Store (for telecom blackouts)
CREATE TABLE IF NOT EXISTS offline_signed_vouchers (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code         VARCHAR(100) UNIQUE NOT NULL,
    issuer_account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    recipient_identifier VARCHAR(64) NOT NULL,
    amount               NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency             VARCHAR(10) NOT NULL DEFAULT 'AKD',
    ed25519_signature    TEXT NOT NULL,
    expires_at           TIMESTAMPTZ NOT NULL,
    redeemed_at          TIMESTAMPTZ,
    status               VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
                         CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offline_vouchers_issuer ON offline_signed_vouchers(issuer_account_id);
CREATE INDEX IF NOT EXISTS idx_offline_vouchers_status ON offline_signed_vouchers(status);

-- 7. Audit Log for AI Cyber Threat Defense & Security Events
CREATE TABLE IF NOT EXISTS cyber_defense_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type    VARCHAR(50) NOT NULL,   -- 'BRUTE_FORCE_BLOCKED', 'DDOS_MITIGATED', 'ANOMALY_FLAGGED'
    severity      VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ip_hash       VARCHAR(64) NOT NULL,
    details       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cyber_defense_severity ON cyber_defense_events(severity, created_at DESC);

COMMIT;
