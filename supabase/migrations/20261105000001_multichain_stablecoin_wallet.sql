-- ============================================================================
-- Migration: 20261105000001_multichain_stablecoin_wallet.sql
-- Description: Self-hosted custodial USDT / USDC wallet across 5 networks
--              (Ethereum, Tron, BNB Smart Chain, Polygon, Solana).
--
-- Design:
--   * One ledger balance per token (USDT, USDC) per user; any network may be
--     used to deposit or withdraw.
--   * Deposit addresses come from a PRE-GENERATED PUBLIC ADDRESS POOL produced
--     offline by scripts/crypto/generate-address-pool.ts. No private key, seed
--     or xpub is ever stored in this database.
--   * One address per chain family per user: EVM (shared by ETH/BSC/POLYGON),
--     TRON, SOLANA.
--   * Deposits are recorded by the crypto-deposit-watcher edge function
--     (service_role) and credited through the double-entry post_transaction().
--   * Withdrawals debit the user into SUSPENSE (hold) and wait in
--     PENDING_REVIEW until an operator approves and settles them.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REFERENCE DATA: NETWORKS & TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_networks (
    code             VARCHAR(16) PRIMARY KEY
                     CHECK (code IN ('ETHEREUM', 'TRON', 'BSC', 'POLYGON', 'SOLANA')),
    display_name     TEXT        NOT NULL,
    family           VARCHAR(8)  NOT NULL CHECK (family IN ('EVM', 'TRON', 'SOLANA')),
    chain_id         BIGINT,
    token_standard   VARCHAR(16) NOT NULL,
    confirmations    INT         NOT NULL CHECK (confirmations >= 0),
    explorer_tx_url  TEXT        NOT NULL,
    sort_order       INT         NOT NULL DEFAULT 0,
    enabled          BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.crypto_tokens (
    network_code        VARCHAR(16)   NOT NULL REFERENCES public.crypto_networks(code) ON DELETE RESTRICT,
    symbol              VARCHAR(8)    NOT NULL CHECK (symbol IN ('USDT', 'USDC')),
    contract_address    TEXT          NOT NULL,
    decimals            SMALLINT      NOT NULL CHECK (decimals BETWEEN 0 AND 36),
    min_deposit         NUMERIC(28,8) NOT NULL CHECK (min_deposit > 0),
    min_withdrawal      NUMERIC(28,8) NOT NULL CHECK (min_withdrawal > 0),
    withdrawal_fee      NUMERIC(28,8) NOT NULL CHECK (withdrawal_fee >= 0),
    deposit_enabled     BOOLEAN       NOT NULL DEFAULT true,
    withdrawal_enabled  BOOLEAN       NOT NULL DEFAULT true,
    PRIMARY KEY (network_code, symbol)
);

-- Mainnet contracts. Swap rows for testnet contracts on staging projects.
INSERT INTO public.crypto_networks
    (code, display_name, family, chain_id, token_standard, confirmations, explorer_tx_url, sort_order)
VALUES
    ('TRON',     'Tron',            'TRON',   NULL, 'TRC-20', 20, 'https://tronscan.org/#/transaction/', 1),
    ('ETHEREUM', 'Ethereum',        'EVM',    1,    'ERC-20', 12, 'https://etherscan.io/tx/',           2),
    ('BSC',      'BNB Smart Chain', 'EVM',    56,   'BEP-20', 15, 'https://bscscan.com/tx/',            3),
    ('POLYGON',  'Polygon PoS',     'EVM',    137,  'ERC-20', 64, 'https://polygonscan.com/tx/',        4),
    ('SOLANA',   'Solana',          'SOLANA', NULL, 'SPL',    0,  'https://solscan.io/tx/',             5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.crypto_tokens
    (network_code, symbol, contract_address, decimals, min_deposit, min_withdrawal, withdrawal_fee, deposit_enabled, withdrawal_enabled)
VALUES
    ('ETHEREUM', 'USDT', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6,  10, 20, 5,   true,  true),
    ('ETHEREUM', 'USDC', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6,  10, 20, 5,   true,  true),
    ('TRON',     'USDT', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',         6,  1,  10, 1.5, true,  true),
    -- Circle discontinued native USDC on TRON (2024). Kept for completeness, disabled.
    ('TRON',     'USDC', 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',         6,  1,  10, 1.5, false, false),
    ('BSC',      'USDT', '0x55d398326f99059ff775485246999027b3197955', 18, 1,  10, 0.3, true,  true),
    ('BSC',      'USDC', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', 18, 1,  10, 0.3, true,  true),
    ('POLYGON',  'USDT', '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6,  1,  10, 0.3, true,  true),
    ('POLYGON',  'USDC', '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', 6,  1,  10, 0.3, true,  true),
    ('SOLANA',   'USDT', 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 6, 1,  10, 0.5, true,  true),
    ('SOLANA',   'USDC', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 1,  10, 0.5, true,  true)
ON CONFLICT (network_code, symbol) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. PUBLIC ADDRESS POOL (populated offline; public addresses only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_address_pool (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    family            VARCHAR(8)  NOT NULL CHECK (family IN ('EVM', 'TRON', 'SOLANA')),
    hd_index          INT         NOT NULL CHECK (hd_index >= 0),
    address           TEXT        NOT NULL,
    assigned_user_id  UUID        REFERENCES public.users(id) ON DELETE RESTRICT,
    assigned_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (family, hd_index),
    UNIQUE (family, address),
    -- EVM addresses are stored lowercase so lookups are case-insensitive.
    CONSTRAINT crypto_pool_evm_lower CHECK (family <> 'EVM' OR address = lower(address))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_pool_one_per_user
    ON public.crypto_address_pool (family, assigned_user_id)
    WHERE assigned_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crypto_pool_available
    ON public.crypto_address_pool (family, hd_index)
    WHERE assigned_user_id IS NULL;

-- ----------------------------------------------------------------------------
-- 3. USER DEPOSIT ADDRESSES (one row per user x network)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_deposit_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    network_code    VARCHAR(16) NOT NULL REFERENCES public.crypto_networks(code) ON DELETE RESTRICT,
    address         TEXT        NOT NULL,
    pool_id         BIGINT      NOT NULL REFERENCES public.crypto_address_pool(id) ON DELETE RESTRICT,
    -- Per-token scan cursors used by Tron / Solana per-address polling.
    scan_cursors    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    last_scanned_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, network_code),
    UNIQUE (network_code, address)
);

CREATE INDEX IF NOT EXISTS idx_crypto_dep_addr_pool ON public.crypto_deposit_addresses (pool_id);
CREATE INDEX IF NOT EXISTS idx_crypto_dep_addr_scan
    ON public.crypto_deposit_addresses (network_code, last_scanned_at NULLS FIRST);

-- ----------------------------------------------------------------------------
-- 4. EVM BLOCK CURSORS (watcher progress per network/token)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_scan_cursors (
    network_code  VARCHAR(16) NOT NULL REFERENCES public.crypto_networks(code) ON DELETE RESTRICT,
    token_symbol  VARCHAR(8)  NOT NULL,
    last_block    BIGINT      NOT NULL CHECK (last_block >= 0),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (network_code, token_symbol),
    FOREIGN KEY (network_code, token_symbol) REFERENCES public.crypto_tokens(network_code, symbol)
);

-- ----------------------------------------------------------------------------
-- 5. DEPOSITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_deposits (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    network_code     VARCHAR(16)   NOT NULL,
    token_symbol     VARCHAR(8)    NOT NULL,
    tx_hash          TEXT          NOT NULL,
    log_index        INT           NOT NULL DEFAULT 0,
    from_address     TEXT,
    to_address       TEXT          NOT NULL,
    raw_amount       NUMERIC(78,0) NOT NULL CHECK (raw_amount > 0),
    amount           NUMERIC(28,8) NOT NULL CHECK (amount >= 0),
    block_number     BIGINT,
    block_time       TIMESTAMPTZ,
    status           VARCHAR(16)   NOT NULL CHECK (status IN ('CREDITED', 'BELOW_MINIMUM')),
    transaction_id   VARCHAR(64)   REFERENCES public.transactions(id) ON DELETE RESTRICT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    FOREIGN KEY (network_code, token_symbol) REFERENCES public.crypto_tokens(network_code, symbol),
    UNIQUE (network_code, tx_hash, log_index, to_address)
);

CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user ON public.crypto_deposits (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_txn  ON public.crypto_deposits (transaction_id);

-- ----------------------------------------------------------------------------
-- 6. WITHDRAWALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_withdrawals (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    network_code           VARCHAR(16)   NOT NULL,
    token_symbol           VARCHAR(8)    NOT NULL,
    to_address             TEXT          NOT NULL,
    amount                 NUMERIC(28,8) NOT NULL CHECK (amount > 0),
    fee                    NUMERIC(28,8) NOT NULL CHECK (fee >= 0),
    total_debit            NUMERIC(28,8) NOT NULL CHECK (total_debit = amount + fee),
    status                 VARCHAR(16)   NOT NULL DEFAULT 'PENDING_REVIEW'
                           CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'BROADCAST', 'CONFIRMED', 'REJECTED', 'FAILED')),
    idempotency_key        UUID          NOT NULL,
    request_hash           TEXT          NOT NULL,
    hold_transaction_id    VARCHAR(64)   REFERENCES public.transactions(id) ON DELETE RESTRICT,
    settle_transaction_id  VARCHAR(64)   REFERENCES public.transactions(id) ON DELETE RESTRICT,
    tx_hash                TEXT,
    reviewed_by            TEXT,
    review_note            TEXT,
    failure_reason         TEXT,
    created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
    FOREIGN KEY (network_code, token_symbol) REFERENCES public.crypto_tokens(network_code, symbol),
    UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_user   ON public.crypto_withdrawals (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_status ON public.crypto_withdrawals (status, created_at)
    WHERE status IN ('PENDING_REVIEW', 'APPROVED', 'BROADCAST');
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_hold   ON public.crypto_withdrawals (hold_transaction_id);
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_settle ON public.crypto_withdrawals (settle_transaction_id);

-- ----------------------------------------------------------------------------
-- 7. ROW-LEVEL SECURITY & GRANTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.crypto_networks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_tokens            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_address_pool      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_deposit_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_scan_cursors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_deposits          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_withdrawals       ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.crypto_networks, public.crypto_tokens, public.crypto_address_pool,
              public.crypto_deposit_addresses, public.crypto_scan_cursors,
              public.crypto_deposits, public.crypto_withdrawals
    FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.crypto_networks, public.crypto_tokens, public.crypto_address_pool,
             public.crypto_deposit_addresses, public.crypto_scan_cursors,
             public.crypto_deposits, public.crypto_withdrawals
    TO service_role;

GRANT SELECT ON public.crypto_networks, public.crypto_tokens,
                public.crypto_deposit_addresses, public.crypto_deposits, public.crypto_withdrawals
    TO authenticated;

DROP POLICY IF EXISTS crypto_networks_read ON public.crypto_networks;
CREATE POLICY crypto_networks_read ON public.crypto_networks
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS crypto_tokens_read ON public.crypto_tokens;
CREATE POLICY crypto_tokens_read ON public.crypto_tokens
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS crypto_dep_addr_own ON public.crypto_deposit_addresses;
CREATE POLICY crypto_dep_addr_own ON public.crypto_deposit_addresses
    FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS crypto_deposits_own ON public.crypto_deposits;
CREATE POLICY crypto_deposits_own ON public.crypto_deposits
    FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS crypto_withdrawals_own ON public.crypto_withdrawals;
CREATE POLICY crypto_withdrawals_own ON public.crypto_withdrawals
    FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- 8. INTERNAL HELPERS
-- ----------------------------------------------------------------------------

-- Returns (creating if necessary) a system account (user_id IS NULL).
CREATE OR REPLACE FUNCTION public._crypto_system_account(p_type VARCHAR, p_currency VARCHAR)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM public.accounts
     WHERE user_id IS NULL AND account_type = p_type AND currency = p_currency;
    IF v_id IS NULL THEN
        INSERT INTO public.accounts (user_id, currency, account_type)
        VALUES (NULL, p_currency, p_type)
        ON CONFLICT DO NOTHING;
        SELECT id INTO v_id FROM public.accounts
         WHERE user_id IS NULL AND account_type = p_type AND currency = p_currency;
    END IF;
    RETURN v_id;
END;
$$;

-- Returns (creating if necessary) a user's wallet account for a currency.
CREATE OR REPLACE FUNCTION public._crypto_user_account(p_user UUID, p_currency VARCHAR)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.accounts (user_id, currency, account_type)
    VALUES (p_user, p_currency, 'USER_WALLET')
    ON CONFLICT (user_id, currency, account_type) DO NOTHING;
    SELECT id INTO v_id FROM public.accounts
     WHERE user_id = p_user AND currency = p_currency AND account_type = 'USER_WALLET';
    RETURN v_id;
END;
$$;

-- Decorates a ledger transaction row so it renders in the app history.
CREATE OR REPLACE FUNCTION public._crypto_label_txn(
    p_txn_id VARCHAR, p_title TEXT, p_title_mm TEXT, p_category TEXT,
    p_amount NUMERIC, p_currency VARCHAR, p_fee NUMERIC, p_counterparty TEXT,
    p_hash TEXT, p_status TEXT
) RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.transactions
       SET title = p_title, title_mm = p_title_mm, category = p_category,
           amount = p_amount, currency = p_currency, fee = COALESCE(p_fee, 0),
           counterparty = p_counterparty, hash = p_hash, status = p_status,
           time = to_char(now(), 'YYYY-MM-DD HH24:MI'), updated_at = now()
     WHERE id = p_txn_id;
$$;

REVOKE ALL ON FUNCTION public._crypto_system_account(VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._crypto_user_account(UUID, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._crypto_label_txn(VARCHAR, TEXT, TEXT, TEXT, NUMERIC, VARCHAR, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 9. USER RPC: get_crypto_wallet()
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_crypto_wallet()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid         UUID := auth.uid();
    v_kyc         INT;
    v_balances    JSONB;
    v_networks    JSONB;
    v_deposits    JSONB;
    v_withdrawals JSONB;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    SELECT kyc_tier INTO v_kyc FROM public.user_profiles WHERE user_id = v_uid;

    SELECT jsonb_build_object(
               'USDT', COALESCE(MAX(bal) FILTER (WHERE currency = 'USDT'), 0),
               'USDC', COALESCE(MAX(bal) FILTER (WHERE currency = 'USDC'), 0))
      INTO v_balances
      FROM (
          SELECT a.currency,
                 COALESCE((SELECT le.balance_after FROM public.ledger_entries le
                            WHERE le.account_id = a.id ORDER BY le.seq DESC LIMIT 1), 0) AS bal
            FROM public.accounts a
           WHERE a.user_id = v_uid AND a.account_type = 'USER_WALLET'
             AND a.currency IN ('USDT', 'USDC')
      ) b;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'code', n.code,
               'name', n.display_name,
               'family', n.family,
               'standard', n.token_standard,
               'confirmations', n.confirmations,
               'explorer_tx_url', n.explorer_tx_url,
               'address', da.address,
               'tokens', (
                   SELECT COALESCE(jsonb_agg(jsonb_build_object(
                              'symbol', t.symbol,
                              'contract', t.contract_address,
                              'decimals', t.decimals,
                              'min_deposit', t.min_deposit,
                              'min_withdrawal', t.min_withdrawal,
                              'withdrawal_fee', t.withdrawal_fee,
                              'deposit_enabled', t.deposit_enabled,
                              'withdrawal_enabled', t.withdrawal_enabled
                          ) ORDER BY t.symbol DESC), '[]'::jsonb)
                     FROM public.crypto_tokens t
                    WHERE t.network_code = n.code
               )
           ) ORDER BY n.sort_order), '[]'::jsonb)
      INTO v_networks
      FROM public.crypto_networks n
      LEFT JOIN public.crypto_deposit_addresses da
             ON da.network_code = n.code AND da.user_id = v_uid
     WHERE n.enabled;

    SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
      INTO v_deposits
      FROM (
          SELECT id, network_code, token_symbol, tx_hash, from_address, to_address,
                 amount, status, block_number, block_time, created_at
            FROM public.crypto_deposits
           WHERE user_id = v_uid
           ORDER BY created_at DESC
           LIMIT 25
      ) d;

    SELECT COALESCE(jsonb_agg(to_jsonb(w)), '[]'::jsonb)
      INTO v_withdrawals
      FROM (
          SELECT id, network_code, token_symbol, to_address, amount, fee,
                 total_debit, status, tx_hash, review_note, failure_reason,
                 created_at, updated_at
            FROM public.crypto_withdrawals
           WHERE user_id = v_uid
           ORDER BY created_at DESC
           LIMIT 25
      ) w;

    RETURN jsonb_build_object(
        'kyc_tier', COALESCE(v_kyc, 1),
        'balances', v_balances,
        'networks', v_networks,
        'deposits', v_deposits,
        'withdrawals', v_withdrawals
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_crypto_wallet() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_crypto_wallet() TO authenticated;

-- ----------------------------------------------------------------------------
-- 10. USER RPC: provision_crypto_addresses()
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_crypto_addresses()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid    UUID := auth.uid();
    v_kyc    INT;
    v_family TEXT;
    v_pool   RECORD;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    SELECT kyc_tier INTO v_kyc FROM public.user_profiles WHERE user_id = v_uid;
    IF COALESCE(v_kyc, 1) < 2 THEN
        RAISE EXCEPTION 'KYC Level 2 is required for crypto deposits' USING ERRCODE = '42501';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('crypto_provision:' || v_uid::text, 0));

    FOREACH v_family IN ARRAY ARRAY['EVM', 'TRON', 'SOLANA']
    LOOP
        SELECT * INTO v_pool FROM public.crypto_address_pool
         WHERE family = v_family AND assigned_user_id = v_uid;

        IF NOT FOUND THEN
            SELECT * INTO v_pool FROM public.crypto_address_pool
             WHERE family = v_family AND assigned_user_id IS NULL
             ORDER BY hd_index
             LIMIT 1
             FOR UPDATE SKIP LOCKED;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Deposit address pool for % is exhausted. Please try again later.', v_family
                    USING ERRCODE = '53000';
            END IF;

            UPDATE public.crypto_address_pool
               SET assigned_user_id = v_uid, assigned_at = now()
             WHERE id = v_pool.id;
        END IF;

        INSERT INTO public.crypto_deposit_addresses (user_id, network_code, address, pool_id)
        SELECT v_uid, n.code, v_pool.address, v_pool.id
          FROM public.crypto_networks n
         WHERE n.family = v_family
        ON CONFLICT (user_id, network_code) DO NOTHING;

        IF v_family = 'EVM' THEN
            UPDATE public.user_profiles
               SET usd_account_wallet_address = v_pool.address
             WHERE user_id = v_uid
               AND (usd_account_wallet_address IS NULL OR usd_account_wallet_address = '');
        END IF;
    END LOOP;

    RETURN public.get_crypto_wallet();
END;
$$;

REVOKE ALL ON FUNCTION public.provision_crypto_addresses() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.provision_crypto_addresses() TO authenticated;

-- ----------------------------------------------------------------------------
-- 11. SERVICE RPC: record_crypto_deposit()  (called by deposit watcher)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_crypto_deposit(
    p_network      VARCHAR,
    p_token        VARCHAR,
    p_tx_hash      TEXT,
    p_log_index    INT,
    p_from_address TEXT,
    p_to_address   TEXT,
    p_raw_amount   NUMERIC,
    p_block_number BIGINT DEFAULT NULL,
    p_block_time   TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_family    TEXT;
    v_token     public.crypto_tokens%ROWTYPE;
    v_to        TEXT;
    v_user      UUID;
    v_amount    NUMERIC(28,8);
    v_status    TEXT;
    v_dep_id    UUID;
    v_txn_id    VARCHAR(64);
    v_vault     UUID;
    v_user_acct UUID;
BEGIN
    SELECT family INTO v_family FROM public.crypto_networks WHERE code = p_network;
    IF v_family IS NULL THEN
        RAISE EXCEPTION 'Unknown network %', p_network;
    END IF;

    SELECT * INTO v_token FROM public.crypto_tokens
     WHERE network_code = p_network AND symbol = p_token;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unknown token % on %', p_token, p_network;
    END IF;

    IF p_raw_amount IS NULL OR p_raw_amount <= 0 OR p_raw_amount <> trunc(p_raw_amount) THEN
        RAISE EXCEPTION 'raw_amount must be a positive integer';
    END IF;

    v_to := CASE WHEN v_family = 'EVM' THEN lower(p_to_address) ELSE p_to_address END;

    SELECT user_id INTO v_user FROM public.crypto_deposit_addresses
     WHERE network_code = p_network AND address = v_to;
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'unknown_address');
    END IF;

    -- Truncate to 6 decimal places (USDT/USDC canonical precision).
    v_amount := trunc(p_raw_amount / power(10::numeric, v_token.decimals), 6);
    v_status := CASE
        WHEN v_amount >= v_token.min_deposit AND v_token.deposit_enabled THEN 'CREDITED'
        ELSE 'BELOW_MINIMUM'
    END;

    INSERT INTO public.crypto_deposits (
        user_id, network_code, token_symbol, tx_hash, log_index,
        from_address, to_address, raw_amount, amount, block_number, block_time, status
    ) VALUES (
        v_user, p_network, p_token, p_tx_hash, COALESCE(p_log_index, 0),
        p_from_address, v_to, p_raw_amount, v_amount, p_block_number, p_block_time, v_status
    )
    ON CONFLICT (network_code, tx_hash, log_index, to_address) DO NOTHING
    RETURNING id INTO v_dep_id;

    IF v_dep_id IS NULL THEN
        RETURN jsonb_build_object('success', true, 'duplicate', true);
    END IF;

    IF v_status = 'CREDITED' THEN
        v_vault     := public._crypto_system_account('RESERVE_VAULT', p_token);
        v_user_acct := public._crypto_user_account(v_user, p_token);

        v_txn_id := public.post_transaction(
            'CDEP-' || replace(v_dep_id::text, '-', ''),
            'CRYPTO_DEPOSIT',
            jsonb_build_object('user_id', v_user, 'deposit_id', v_dep_id, 'network', p_network,
                               'token', p_token, 'tx_hash', p_tx_hash, 'from', p_from_address),
            jsonb_build_array(
                jsonb_build_object('account_id', v_vault,     'amount', -v_amount),
                jsonb_build_object('account_id', v_user_acct, 'amount',  v_amount)
            )
        );

        PERFORM public._crypto_label_txn(v_txn_id,
            p_token || ' deposit (' || p_network || ')', p_token || ' ငွေသွင်း (' || p_network || ')',
            'crypto_deposit', v_amount, p_token, 0, p_from_address, p_tx_hash, 'SETTLED');

        UPDATE public.crypto_deposits SET transaction_id = v_txn_id WHERE id = v_dep_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'deposit_id', v_dep_id, 'status', v_status,
                              'amount', v_amount, 'user_id', v_user, 'transaction_id', v_txn_id);
END;
$$;

REVOKE ALL ON FUNCTION public.record_crypto_deposit(VARCHAR, VARCHAR, TEXT, INT, TEXT, TEXT, NUMERIC, BIGINT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_crypto_deposit(VARCHAR, VARCHAR, TEXT, INT, TEXT, TEXT, NUMERIC, BIGINT, TIMESTAMPTZ) TO service_role;

-- ----------------------------------------------------------------------------
-- 12. SERVICE RPC: request_crypto_withdrawal()
--     Called by the crypto-withdraw edge function AFTER PIN verification.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.request_crypto_withdrawal(
    p_user_id         UUID,
    p_network         VARCHAR,
    p_token           VARCHAR,
    p_to_address      TEXT,
    p_amount          NUMERIC,
    p_idempotency_key UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_family    TEXT;
    v_net_ok    BOOLEAN;
    v_token     public.crypto_tokens%ROWTYPE;
    v_kyc       INT;
    v_status    TEXT;
    v_to        TEXT;
    v_hash      TEXT;
    v_existing  public.crypto_withdrawals%ROWTYPE;
    v_wd_id     UUID := gen_random_uuid();
    v_total     NUMERIC(28,8);
    v_user_acct UUID;
    v_suspense  UUID;
    v_txn_id    VARCHAR(64);
BEGIN
    IF p_user_id IS NULL OR p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'User and idempotency key are required' USING ERRCODE = '22023';
    END IF;

    SELECT family, enabled INTO v_family, v_net_ok FROM public.crypto_networks WHERE code = p_network;
    IF v_family IS NULL OR NOT v_net_ok THEN
        RAISE EXCEPTION 'Network is not available' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_token FROM public.crypto_tokens WHERE network_code = p_network AND symbol = p_token;
    IF NOT FOUND OR NOT v_token.withdrawal_enabled THEN
        RAISE EXCEPTION '% withdrawals on % are not available', p_token, p_network USING ERRCODE = '22023';
    END IF;

    SELECT up.kyc_tier, upper(u.status::text) INTO v_kyc, v_status
      FROM public.user_profiles up JOIN public.users u ON u.id = up.user_id
     WHERE up.user_id = p_user_id;
    IF COALESCE(v_kyc, 1) < 2 THEN
        RAISE EXCEPTION 'KYC Level 2 is required for withdrawals' USING ERRCODE = '42501';
    END IF;
    IF v_status IN ('SUSPENDED', 'FROZEN', 'CLOSED') THEN
        RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 OR p_amount <> round(p_amount, 6) THEN
        RAISE EXCEPTION 'Amount must be positive with at most 6 decimal places' USING ERRCODE = '22023';
    END IF;
    IF p_amount < v_token.min_withdrawal THEN
        RAISE EXCEPTION 'Minimum withdrawal is % %', v_token.min_withdrawal, p_token USING ERRCODE = '22023';
    END IF;

    v_to := CASE WHEN v_family = 'EVM' THEN lower(trim(p_to_address)) ELSE trim(p_to_address) END;
    IF v_to IS NULL OR v_to = '' THEN
        RAISE EXCEPTION 'Destination address is required' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM public.crypto_address_pool WHERE family = v_family AND address = v_to) THEN
        RAISE EXCEPTION 'Destination is a PeThar deposit address. Use an in-app transfer instead.' USING ERRCODE = '22023';
    END IF;

    v_hash := encode(extensions.digest(
        jsonb_build_object('network', p_network, 'token', p_token, 'to', v_to, 'amount', p_amount)::text,
        'sha256'), 'hex');

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

    SELECT * INTO v_existing FROM public.crypto_withdrawals
     WHERE user_id = p_user_id AND idempotency_key = p_idempotency_key;
    IF FOUND THEN
        IF v_existing.request_hash <> v_hash THEN
            RAISE EXCEPTION 'Idempotency key already used for a different request' USING ERRCODE = '22023';
        END IF;
        RETURN jsonb_build_object('success', true, 'duplicate', true, 'withdrawal_id', v_existing.id,
                                  'status', v_existing.status, 'amount', v_existing.amount,
                                  'fee', v_existing.fee, 'currency', v_existing.token_symbol);
    END IF;

    v_total     := p_amount + v_token.withdrawal_fee;
    v_user_acct := public._crypto_user_account(p_user_id, p_token);
    v_suspense  := public._crypto_system_account('SUSPENSE', p_token);

    PERFORM 1 FROM public.accounts WHERE id = v_user_acct FOR UPDATE;
    IF public.current_account_balance(v_user_acct) < v_total THEN
        RAISE EXCEPTION 'Insufficient % balance (amount + network fee %)', p_token, v_token.withdrawal_fee
            USING ERRCODE = '22023';
    END IF;

    v_txn_id := public.post_transaction(
        'CWD-HOLD-' || replace(v_wd_id::text, '-', ''),
        'CRYPTO_WITHDRAWAL',
        jsonb_build_object('user_id', p_user_id, 'withdrawal_id', v_wd_id, 'network', p_network,
                           'token', p_token, 'to', v_to, 'fee', v_token.withdrawal_fee),
        jsonb_build_array(
            jsonb_build_object('account_id', v_user_acct, 'amount', -v_total),
            jsonb_build_object('account_id', v_suspense,  'amount',  v_total)
        )
    );

    PERFORM public._crypto_label_txn(v_txn_id,
        p_token || ' withdrawal (' || p_network || ')', p_token || ' ငွေထုတ် (' || p_network || ')',
        'crypto_withdrawal', p_amount, p_token, v_token.withdrawal_fee, v_to, NULL, 'PENDING');

    INSERT INTO public.crypto_withdrawals (
        id, user_id, network_code, token_symbol, to_address, amount, fee, total_debit,
        idempotency_key, request_hash, hold_transaction_id
    ) VALUES (
        v_wd_id, p_user_id, p_network, p_token, v_to, p_amount, v_token.withdrawal_fee, v_total,
        p_idempotency_key, v_hash, v_txn_id
    );

    RETURN jsonb_build_object('success', true, 'withdrawal_id', v_wd_id, 'status', 'PENDING_REVIEW',
                              'amount', p_amount, 'fee', v_token.withdrawal_fee, 'total', v_total,
                              'currency', p_token, 'network', p_network, 'transaction_id', v_txn_id);
END;
$$;

REVOKE ALL ON FUNCTION public.request_crypto_withdrawal(UUID, VARCHAR, VARCHAR, TEXT, NUMERIC, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_crypto_withdrawal(UUID, VARCHAR, VARCHAR, TEXT, NUMERIC, UUID) TO service_role;

-- ----------------------------------------------------------------------------
-- 13. INTERNAL: refund a held withdrawal (REJECTED / FAILED)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._crypto_refund_withdrawal(p_wd public.crypto_withdrawals, p_kind TEXT)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_txn_id VARCHAR(64);
BEGIN
    v_txn_id := public.post_transaction(
        'CWD-REFUND-' || replace(p_wd.id::text, '-', ''),
        'CRYPTO_WITHDRAWAL_REFUND',
        jsonb_build_object('user_id', p_wd.user_id, 'withdrawal_id', p_wd.id, 'reason', p_kind),
        jsonb_build_array(
            jsonb_build_object('account_id', public._crypto_system_account('SUSPENSE', p_wd.token_symbol), 'amount', -p_wd.total_debit),
            jsonb_build_object('account_id', public._crypto_user_account(p_wd.user_id, p_wd.token_symbol), 'amount', p_wd.total_debit)
        )
    );
    PERFORM public._crypto_label_txn(v_txn_id,
        p_wd.token_symbol || ' withdrawal refund', p_wd.token_symbol || ' ငွေထုတ် ပြန်အမ်း',
        'crypto_withdrawal', p_wd.total_debit, p_wd.token_symbol, 0, p_wd.to_address, NULL, 'SETTLED');
    UPDATE public.transactions SET status = 'REVERSED', updated_at = now()
     WHERE id = p_wd.hold_transaction_id;
    RETURN v_txn_id;
END;
$$;

REVOKE ALL ON FUNCTION public._crypto_refund_withdrawal(public.crypto_withdrawals, TEXT) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 14. ADMIN RPC: admin_review_crypto_withdrawal()  (approve / reject)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_review_crypto_withdrawal(
    p_withdrawal_id UUID,
    p_approve       BOOLEAN,
    p_reviewer      TEXT,
    p_note          TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wd     public.crypto_withdrawals%ROWTYPE;
    v_refund VARCHAR(64);
BEGIN
    IF NULLIF(trim(p_reviewer), '') IS NULL THEN
        RAISE EXCEPTION 'Reviewer is required';
    END IF;

    SELECT * INTO v_wd FROM public.crypto_withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal not found'; END IF;
    IF v_wd.status <> 'PENDING_REVIEW' THEN
        RAISE EXCEPTION 'Withdrawal is % and cannot be reviewed', v_wd.status;
    END IF;

    IF p_approve THEN
        UPDATE public.crypto_withdrawals
           SET status = 'APPROVED', reviewed_by = p_reviewer, review_note = p_note, updated_at = now()
         WHERE id = v_wd.id;
        RETURN jsonb_build_object('success', true, 'withdrawal_id', v_wd.id, 'status', 'APPROVED');
    END IF;

    v_refund := public._crypto_refund_withdrawal(v_wd, 'REJECTED');
    UPDATE public.crypto_withdrawals
       SET status = 'REJECTED', reviewed_by = p_reviewer, review_note = p_note,
           settle_transaction_id = v_refund, updated_at = now()
     WHERE id = v_wd.id;
    RETURN jsonb_build_object('success', true, 'withdrawal_id', v_wd.id, 'status', 'REJECTED',
                              'refund_transaction_id', v_refund);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_crypto_withdrawal(UUID, BOOLEAN, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_crypto_withdrawal(UUID, BOOLEAN, TEXT, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 15. ADMIN / SIGNER RPC: admin_update_crypto_withdrawal()
--     APPROVED  -> BROADCAST (tx_hash required)
--     APPROVED | BROADCAST -> CONFIRMED (settles SUSPENSE -> RESERVE_VAULT + FEE_INCOME)
--     APPROVED | BROADCAST -> FAILED    (refunds user; ONLY when the on-chain
--                                         transfer definitively did not happen)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_crypto_withdrawal(
    p_withdrawal_id UUID,
    p_status        VARCHAR,
    p_tx_hash       TEXT DEFAULT NULL,
    p_reason        TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wd      public.crypto_withdrawals%ROWTYPE;
    v_entries JSONB;
    v_txn_id  VARCHAR(64);
BEGIN
    SELECT * INTO v_wd FROM public.crypto_withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal not found'; END IF;

    IF p_status = 'BROADCAST' THEN
        IF v_wd.status <> 'APPROVED' THEN
            RAISE EXCEPTION 'Only APPROVED withdrawals can be broadcast (current: %)', v_wd.status;
        END IF;
        IF NULLIF(trim(p_tx_hash), '') IS NULL THEN RAISE EXCEPTION 'tx_hash is required'; END IF;
        UPDATE public.crypto_withdrawals
           SET status = 'BROADCAST', tx_hash = trim(p_tx_hash), updated_at = now()
         WHERE id = v_wd.id;
        UPDATE public.transactions SET hash = trim(p_tx_hash), updated_at = now()
         WHERE id = v_wd.hold_transaction_id;

    ELSIF p_status = 'CONFIRMED' THEN
        IF v_wd.status NOT IN ('APPROVED', 'BROADCAST') THEN
            RAISE EXCEPTION 'Withdrawal is % and cannot be confirmed', v_wd.status;
        END IF;
        IF COALESCE(NULLIF(trim(p_tx_hash), ''), v_wd.tx_hash) IS NULL THEN
            RAISE EXCEPTION 'tx_hash is required';
        END IF;

        v_entries := jsonb_build_array(
            jsonb_build_object('account_id', public._crypto_system_account('SUSPENSE', v_wd.token_symbol), 'amount', -v_wd.total_debit),
            jsonb_build_object('account_id', public._crypto_system_account('RESERVE_VAULT', v_wd.token_symbol), 'amount', v_wd.amount)
        );
        IF v_wd.fee > 0 THEN
            v_entries := v_entries || jsonb_build_array(
                jsonb_build_object('account_id', public._crypto_system_account('FEE_INCOME', v_wd.token_symbol), 'amount', v_wd.fee));
        END IF;

        v_txn_id := public.post_transaction(
            'CWD-SETTLE-' || replace(v_wd.id::text, '-', ''),
            'CRYPTO_WITHDRAWAL_SETTLE',
            jsonb_build_object('withdrawal_id', v_wd.id, 'tx_hash', COALESCE(NULLIF(trim(p_tx_hash), ''), v_wd.tx_hash)),
            v_entries
        );

        UPDATE public.crypto_withdrawals
           SET status = 'CONFIRMED', tx_hash = COALESCE(NULLIF(trim(p_tx_hash), ''), tx_hash),
               settle_transaction_id = v_txn_id, updated_at = now()
         WHERE id = v_wd.id;
        UPDATE public.transactions
           SET status = 'SETTLED', hash = COALESCE(NULLIF(trim(p_tx_hash), ''), v_wd.tx_hash), updated_at = now()
         WHERE id = v_wd.hold_transaction_id;

    ELSIF p_status = 'FAILED' THEN
        IF v_wd.status NOT IN ('APPROVED', 'BROADCAST') THEN
            RAISE EXCEPTION 'Withdrawal is % and cannot be failed', v_wd.status;
        END IF;
        v_txn_id := public._crypto_refund_withdrawal(v_wd, 'FAILED');
        UPDATE public.crypto_withdrawals
           SET status = 'FAILED', failure_reason = p_reason,
               settle_transaction_id = v_txn_id, updated_at = now()
         WHERE id = v_wd.id;
    ELSE
        RAISE EXCEPTION 'Unsupported status %', p_status;
    END IF;

    RETURN jsonb_build_object('success', true, 'withdrawal_id', v_wd.id, 'status', p_status,
                              'transaction_id', v_txn_id);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_crypto_withdrawal(UUID, VARCHAR, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_crypto_withdrawal(UUID, VARCHAR, TEXT, TEXT) TO service_role;
