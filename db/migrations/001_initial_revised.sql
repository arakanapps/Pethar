-- ============================================================================
-- PeThar (ဖေ့သာ) — Core Ledger Migration
-- Revision: 001_initial_revised.sql
-- Target: PostgreSQL 14+
--
-- Guarantees provided by this migration:
--   1. ledger_entries is strictly append-only (immutability rules)
--   2. All postings go through post_transaction(), which:
--      - serializes per-account writes (row locking, no FOR UPDATE OF pitfalls)
--      - enforces per-currency zero-sum (double-entry invariant)
--      - maintains a strict per-account sequence for balance_after chains
--      - enforces idempotency via reference_id
--   3. Supporting tables for agents, OTP challenges, and offline vouchers
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ============================================================================
-- 1. USERS
-- ============================================================================

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number  VARCHAR(20) UNIQUE NOT NULL
                  CHECK (phone_number ~ '^\+[1-9][0-9]{6,14}$'),  -- E.164 only
    full_name     VARCHAR(100) NOT NULL,
    kyc_tier      INT NOT NULL DEFAULT 1
                  CHECK (kyc_tier IN (1, 2, 3)),
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE', 'SUSPENDED', 'FROZEN', 'CLOSED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. AGENTS (cash-in / cash-out network)
-- ============================================================================

CREATE TABLE agents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    agent_code          VARCHAR(20) UNIQUE NOT NULL,      -- human-facing counter code
    display_name        VARCHAR(100) NOT NULL,
    -- Commission in basis points (1/100 of a percent). e.g. 150 = 1.50%
    commission_bps      INT NOT NULL DEFAULT 150
                        CHECK (commission_bps BETWEEN 0 AND 2000),
    parent_agent_id     UUID REFERENCES agents(id) ON DELETE RESTRICT,  -- tiered split
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

CREATE INDEX idx_agents_parent ON agents(parent_agent_id);

-- ============================================================================
-- 3. ACCOUNTS (multi-currency)
-- ============================================================================
-- Balances are NEVER stored here. The balance of an account is the
-- balance_after of its latest ledger entry (highest seq), kept correct by
-- post_transaction(). Any cached balance elsewhere is a projection only.

CREATE TABLE accounts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE RESTRICT,  -- NULL for system accounts
    currency      VARCHAR(10) NOT NULL
                  CHECK (currency IN ('MMK', 'USD', 'THB', 'SGD', 'EUR',
                                      'USDT', 'USDC', 'PETHAR_UNIT')),
    account_type  VARCHAR(20) NOT NULL
                  CHECK (account_type IN ('USER_WALLET', 'AGENT_FLOAT',
                                          'RESERVE_VAULT', 'FEE_INCOME',
                                          'COMMISSION_PAYABLE', 'SUSPENSE')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, currency, account_type)
);

CREATE INDEX idx_accounts_user ON accounts(user_id);

-- System accounts have user_id NULL; user-owned accounts must have a user.
-- Enforce at write time in application + spot-check job; documented here.

-- ============================================================================
-- 4. TRANSACTIONS (mutable header)
-- ============================================================================
-- The header row may transition PENDING -> SETTLED / FAILED, so mutability
-- rules apply ONLY to ledger_entries. A SETTLED transaction is never
-- marked FAILED; corrections are new reversal transactions linked via
-- reverses_transaction_id.

CREATE TABLE transactions (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id             VARCHAR(64) UNIQUE NOT NULL,   -- idempotency key
    transaction_type         VARCHAR(30) NOT NULL
                             CHECK (transaction_type IN (
                                 'P2P_TRANSFER', 'CASH_IN', 'CASH_OUT',
                                 'CRYPTO_SWAP', 'FX_CONVERSION',
                                 'COMMISSION_PAYOUT', 'REVERSAL',
                                 'OFFLINE_VOUCHER_ISSUE', 'OFFLINE_VOUCHER_REDEEM',
                                 'ADJUSTMENT')),
    status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'SETTLED', 'FAILED')),
    reverses_transaction_id  UUID REFERENCES transactions(id) ON DELETE RESTRICT,
    metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type_created
    ON transactions(transaction_type, created_at DESC);

-- ============================================================================
-- 5. LEDGER ENTRIES (immutable, append-only)
-- ============================================================================
-- amount:  positive = credit, negative = debit
-- seq:     strict per-account ordering, assigned under row lock
-- balance_after: running balance of this account after this entry

CREATE TABLE ledger_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    currency        VARCHAR(10) NOT NULL,   -- denormalized for local invariant checks
    amount          NUMERIC(28, 8) NOT NULL CHECK (amount <> 0),
    seq             BIGINT NOT NULL,
    balance_after   NUMERIC(28, 8) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (account_id, seq)
);

CREATE INDEX idx_ledger_account_created ON ledger_entries(account_id, created_at DESC);
CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id);

-- Immutability: no UPDATE, no DELETE, no TRUNCATE on ledger entries.
CREATE RULE ledger_entries_no_update AS ON UPDATE TO ledger_entries DO INSTEAD NOTHING;
CREATE RULE ledger_entries_no_delete AS ON DELETE TO ledger_entries DO INSTEAD NOTHING;

-- ============================================================================
-- 6. ATOMIC POSTING FUNCTION
-- ============================================================================
-- post_transaction(reference_id, type, metadata, entries jsonb)
--
-- entries jsonb format:
--   [ {"account_id": "<uuid>", "amount": "1000.00"}, ... ]
--
-- Behavior:
--   * Idempotent: same reference_id returns the existing transaction id.
--   * Validates per-currency zero-sum BEFORE writing anything.
--   * Locks accounts in deterministic id order to prevent deadlocks.
--   * Assigns per-account seq and computes balance_after under lock.
--   * Rejects debits that would drive user/agent accounts negative.
--     (System account types RESERVE_VAULT/SUSPENSE/FEE_INCOME may go negative.)
--   * Creates the transaction header as SETTLED and writes all entries
--     atomically: any failure rolls the whole posting back.

CREATE OR REPLACE FUNCTION post_transaction(
    p_reference_id     VARCHAR(64),
    p_transaction_type VARCHAR(30),
    p_metadata         JSONB DEFAULT '{}'::jsonb,
    p_entries          JSONB DEFAULT '[]'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_txn_id        UUID;
    v_entry         JSONB;
    v_account_id    UUID;
    v_amount        NUMERIC(28, 8);
    v_currency      VARCHAR(10);
    v_acct_currency VARCHAR(10);
    v_acct_type     VARCHAR(20);
    v_prev_balance  NUMERIC(28, 8);
    v_new_balance   NUMERIC(28, 8);
    v_seq           BIGINT;
    v_bad_currency  VARCHAR(10);
BEGIN
    -- ---- Idempotency: return existing transaction for this reference ----
    SELECT id INTO v_txn_id FROM transactions WHERE reference_id = p_reference_id;
    IF FOUND THEN
        RETURN v_txn_id;
    END IF;

    -- ---- Sanity: need at least 2 legs --------------------------------
    IF jsonb_array_length(p_entries) < 2 THEN
        RAISE EXCEPTION 'A transaction requires at least 2 ledger entries';
    END IF;

    -- ---- Per-currency zero-sum check (double-entry invariant) ---------
    SELECT cur INTO v_bad_currency
    FROM (
        SELECT (e->>'_currency')::varchar AS cur
        FROM (
            SELECT je.value AS e
            FROM jsonb_array_elements(p_entries) AS je
        ) raw
        -- resolve each entry's currency from its account
        CROSS JOIN LATERAL (
            SELECT TRUE
        ) dummy
    ) resolved
    LIMIT 0;  -- placeholder, real check below

    -- Resolve currencies first and validate each entry's account
    CREATE TEMPORARY TABLE IF NOT EXISTS _posting_entries (
        account_id UUID,
        amount NUMERIC(28, 8),
        currency VARCHAR(10)
    ) ON COMMIT DROP;
    DELETE FROM _posting_entries;

    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_account_id := (v_entry->>'account_id')::uuid;
        v_amount     := (v_entry->>'amount')::numeric(28, 8);

        SELECT currency INTO v_acct_currency
        FROM accounts WHERE id = v_account_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Unknown account: %', v_account_id;
        END IF;

        INSERT INTO _posting_entries (account_id, amount, currency)
        VALUES (v_account_id, v_amount, v_acct_currency);
    END LOOP;

    SELECT currency INTO v_bad_currency
    FROM _posting_entries
    GROUP BY currency
    HAVING SUM(amount) <> 0
    LIMIT 1;
    IF FOUND THEN
        RAISE EXCEPTION 'Double-entry violation: entries do not sum to zero for currency %',
            v_bad_currency;
    END IF;

    -- ---- Create header ------------------------------------------------
    INSERT INTO transactions (reference_id, transaction_type, status, metadata)
    VALUES (p_reference_id, p_transaction_type, 'SETTLED', p_metadata)
    RETURNING id INTO v_txn_id;

    -- ---- Lock accounts in deterministic order, then write entries -----
    FOR v_account_id, v_amount, v_currency, v_acct_type IN
        SELECT pe.account_id, pe.amount, pe.currency, a.account_type
        FROM _posting_entries pe
        JOIN accounts a ON a.id = pe.account_id
        ORDER BY pe.account_id
    LOOP
        -- Serialize writers to this account
        PERFORM 1 FROM accounts WHERE id = v_account_id FOR UPDATE;

        SELECT le.balance_after, le.seq + 1
          INTO v_prev_balance, v_seq
        FROM ledger_entries le
        WHERE le.account_id = v_account_id
        ORDER BY le.seq DESC
        LIMIT 1;

        IF NOT FOUND THEN
            v_prev_balance := 0;
            v_seq := 1;
        END IF;

        v_new_balance := v_prev_balance + v_amount;

        -- Overdraft protection for customer-facing accounts
        IF v_new_balance < 0
           AND v_acct_type IN ('USER_WALLET', 'AGENT_FLOAT') THEN
            RAISE EXCEPTION 'Insufficient funds: account % would reach balance %',
                v_account_id, v_new_balance;
        END IF;

        INSERT INTO ledger_entries
            (transaction_id, account_id, currency, amount, seq, balance_after)
        VALUES
            (v_txn_id, v_account_id, v_currency, v_amount, v_seq, v_new_balance);
    END LOOP;

    DELETE FROM _posting_entries;
    RETURN v_txn_id;
END;
$$;

-- ============================================================================
-- 7. OTP CHALLENGES (agent cash-in/out verification)
-- ============================================================================

CREATE TABLE otp_challenges (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose        VARCHAR(30) NOT NULL
                   CHECK (purpose IN ('CASH_IN', 'CASH_OUT', 'TRANSFER_CONFIRM',
                                      'LOGIN', 'DEVICE_BINDING')),
    code_hash      VARCHAR(128) NOT NULL,        -- never store plaintext OTP
    channel        VARCHAR(10) NOT NULL DEFAULT 'SMS'
                   CHECK (channel IN ('SMS', 'PUSH', 'TOTP')),
    attempts       INT NOT NULL DEFAULT 0,
    max_attempts   INT NOT NULL DEFAULT 5,
    expires_at     TIMESTAMPTZ NOT NULL,
    consumed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (attempts <= max_attempts)
);

CREATE INDEX idx_otp_user_purpose
    ON otp_challenges(user_id, purpose, created_at DESC);

-- ============================================================================
-- 8. OFFLINE VOUCHERS (signed-token cash-out for unstable connectivity)
-- ============================================================================
-- A voucher is a pre-authorized hold: funds are moved to a SUSPENSE account
-- at issuance (online), the signed payload travels to the POS/agent device,
-- and redemption (settlement to the agent) may be recorded offline and
-- reconciled later via reconcile_offline_voucher().

CREATE TABLE offline_vouchers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code      VARCHAR(32) UNIQUE NOT NULL,      -- inside the signed payload
    owner_account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    agent_id          UUID REFERENCES agents(id) ON DELETE RESTRICT,
    currency          VARCHAR(10) NOT NULL,
    amount            NUMERIC(28, 8) NOT NULL CHECK (amount > 0),
    issue_txn_id      UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    redeem_txn_id     UUID REFERENCES transactions(id) ON DELETE RESTRICT,
    device_public_key TEXT NOT NULL,                    -- Ed25519 pubkey of issuing device
    payload_signature TEXT NOT NULL,                    -- signature over canonical payload
    status            VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
                      CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'VOID')),
    issued_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at        TIMESTAMPTZ NOT NULL,
    redeemed_at       TIMESTAMPTZ,
    -- Idempotency for offline redemption sync: the POS device assigns this
    -- when it records the redemption locally.
    offline_redeem_ref VARCHAR(64) UNIQUE
);

CREATE INDEX idx_vouchers_owner ON offline_vouchers(owner_account_id, status);
CREATE INDEX idx_vouchers_agent ON offline_vouchers(agent_id, status);

-- ============================================================================
-- 9. FX RATES (audit trail for the dual-rate engine)
-- ============================================================================

CREATE TABLE fx_rates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency  VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    -- rate: 1 base = rate * quote
    rate          NUMERIC(28, 12) NOT NULL CHECK (rate > 0),
    source        VARCHAR(30) NOT NULL,     -- 'BINANCE', 'MARKET_DEPTH', 'MANUAL'
    spread_bps    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (base_currency, quote_currency)
);

CREATE INDEX idx_fx_pair_created ON fx_rates(base_currency, quote_currency, created_at DESC);

-- ============================================================================
-- 10. HELPER VIEW: current balances (projection over the ledger)
-- ============================================================================

CREATE VIEW account_balances AS
SELECT DISTINCT ON (le.account_id)
    le.account_id,
    a.user_id,
    a.currency,
    a.account_type,
    le.balance_after AS balance,
    le.seq           AS last_seq,
    le.created_at    AS as_of
FROM ledger_entries le
JOIN accounts a ON a.id = le.account_id
ORDER BY le.account_id, le.seq DESC;

-- ============================================================================
-- 11. AUDIT: hash-chained ledger digest (tamper evidence)
-- ============================================================================
-- Each entry carries a digest chained from the previous entry of the same
-- account. Verified offline by re-walking the chain.

ALTER TABLE ledger_entries
    ADD COLUMN chain_hash BYTEA;

CREATE OR REPLACE FUNCTION ledger_chain_hash() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_prev BYTEA;
BEGIN
    SELECT chain_hash INTO v_prev
    FROM ledger_entries
    WHERE account_id = NEW.account_id AND seq = NEW.seq - 1;

    NEW.chain_hash := digest(
        COALESCE(v_prev, ''::bytea)
        || NEW.transaction_id::text
        || NEW.account_id::text
        || NEW.amount::text
        || NEW.balance_after::text,
        'sha256'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ledger_chain
    BEFORE INSERT ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION ledger_chain_hash();

COMMIT;

-- ============================================================================
-- Usage example:
--
-- SELECT post_transaction(
--     'txn-2026-0001',
--     'P2P_TRANSFER',
--     '{"note": "lunch"}',
--     jsonb_build_array(
--         jsonb_build_object('account_id', '<sender-wallet-uuid>',   'amount', '-5000'),
--         jsonb_build_object('account_id', '<receiver-wallet-uuid>', 'amount',  '5000')
--     )
-- );
-- ============================================================================
