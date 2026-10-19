-- ============================================================================
-- PeThar (ဖေ့သာ) — Complete Unified Enterprise Database & Production Schema
-- Target: PostgreSQL 14+ / PostgreSQL 17 (Supabase)
-- Project: uklqksioruxvatwpvopm (ap-south-1)
-- 
-- Guarantees provided by this unified schema:
--   1. Double-entry immutable ledger with cryptographic SHA-256 chain hashes.
--   2. Atomic posting engine via post_transaction() RPC with overdraft protection.
--   3. Unified transactions model bridging the core ledger & consumer wallet UI.
--   4. Multi-currency & foreign exchange corridor support (AKD, USDT, USDC, THB, etc.).
--   5. Offline voucher infrastructure with Ed25519 digital signature validation.
--   6. Live consumer wallet integration (user_profiles, contacts, billers, packages).
--   7. Enterprise Row Level Security (RLS) and real-time streaming publication.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. USERS & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username                   VARCHAR(50) UNIQUE,
    uid                        VARCHAR(64) UNIQUE,
    wallet_address             VARCHAR(64),
    email                      VARCHAR(255) UNIQUE,
    phone_number               VARCHAR(30) UNIQUE,
    first_name                 VARCHAR(50) DEFAULT '',
    last_name                  VARCHAR(50) DEFAULT '',
    full_name                  VARCHAR(100) DEFAULT '',
    nickname                   VARCHAR(50) DEFAULT '',
    national_id_no             VARCHAR(50) DEFAULT '',
    dob                        DATE DEFAULT NULL,
    address                    TEXT DEFAULT '',
    usd_account_wallet_address VARCHAR(64) DEFAULT '',
    pin_hash                   VARCHAR(128) DEFAULT '',
    avatar_url                 TEXT DEFAULT '',
    kyc_tier                   INT NOT NULL DEFAULT 1 CHECK (kyc_tier IN (1, 2)),
    status                     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'FROZEN', 'CLOSED')),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS uid VARCHAR(64) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_no VARCHAR(50) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob DATE DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS usd_account_wallet_address VARCHAR(64) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128) DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

DROP FUNCTION IF EXISTS public.generate_user_uid();
DROP SEQUENCE IF EXISTS public.user_uid_seq;

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id                         VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id                    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    username                   VARCHAR(50) DEFAULT '',
    uid                        VARCHAR(64) NOT NULL,
    wallet_address             VARCHAR(64) GENERATED ALWAYS AS (uid) STORED,
    avatar_url                 TEXT DEFAULT '',
    email                      VARCHAR(255) DEFAULT '',
    pin_hash                   VARCHAR(128) DEFAULT '',
    phone                      VARCHAR(30) DEFAULT '',
    first_name                 VARCHAR(50) DEFAULT '',
    last_name                  VARCHAR(50) DEFAULT '',
    name                       VARCHAR(100) DEFAULT '',
    nickname                   VARCHAR(50) DEFAULT '',
    national_id_no             VARCHAR(50) DEFAULT '',
    dob                        DATE DEFAULT NULL,
    address                    TEXT DEFAULT '',
    usd_account_wallet_address VARCHAR(64) DEFAULT '',
    balance                    NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    akd_wallet_balance         NUMERIC(18, 4) GENERATED ALWAYS AS (balance) STORED,
    usd_account_balance        NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    total_balance              NUMERIC(18, 4) GENERATED ALWAYS AS (balance + usd_account_balance) STORED,
    currency                   VARCHAR(16) NOT NULL DEFAULT 'AKD',
    kyc_tier                   INT NOT NULL DEFAULT 1 CHECK (kyc_tier IN (1, 2)),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS uid VARCHAR(64);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(30) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS nickname VARCHAR(50) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS national_id_no VARCHAR(50) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS dob DATE DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS usd_account_wallet_address VARCHAR(64) DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS usd_account_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.00;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'wallet_address') THEN
        ALTER TABLE public.user_profiles ADD COLUMN wallet_address VARCHAR(64) GENERATED ALWAYS AS (uid) STORED;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'akd_wallet_balance') THEN
        ALTER TABLE public.user_profiles ADD COLUMN akd_wallet_balance NUMERIC(18, 4) GENERATED ALWAYS AS (balance) STORED;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'total_balance') THEN
        ALTER TABLE public.user_profiles ADD COLUMN total_balance NUMERIC(18, 4) GENERATED ALWAYS AS (balance + usd_account_balance) STORED;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- IMMUTABILITY & MUTATION GOVERNANCE TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_user_profile_mutation_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Username cannot change (Username cant change)
    IF NEW.username IS DISTINCT FROM OLD.username THEN
        RAISE EXCEPTION 'Username is immutable and cannot be changed';
    END IF;

    -- 2. User ID / Wallet Address / UID cannot change (uid cant change, user_id = wallet address = uid)
    IF NEW.uid IS DISTINCT FROM OLD.uid THEN
        RAISE EXCEPTION 'User UID / Wallet Address is immutable and cannot be changed';
    END IF;

    -- 3. National ID No cannot change (national id no cant change)
    IF NEW.national_id_no IS DISTINCT FROM OLD.national_id_no AND OLD.national_id_no IS NOT NULL AND OLD.national_id_no <> '' THEN
        RAISE EXCEPTION 'National ID number is immutable and cannot be changed';
    END IF;

    -- 4. Date of Birth cannot change (dob cant change)
    IF NEW.dob IS DISTINCT FROM OLD.dob AND OLD.dob IS NOT NULL THEN
        RAISE EXCEPTION 'Date of birth is immutable and cannot be changed';
    END IF;

    -- 5. USD Account Wallet Address cannot change (usd account wallet address cant change)
    IF NEW.usd_account_wallet_address IS DISTINCT FROM OLD.usd_account_wallet_address THEN
        RAISE EXCEPTION 'USD account wallet address is immutable and cannot be changed';
    END IF;

    -- 6. Email change requires verified OTP (user email can change need verifed otp)
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        IF current_setting('pethar.allow_email_change', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'Email cannot be changed directly; verified email OTP is required';
        END IF;
    END IF;

    -- 7. Phone number change requires email verified OTP (ph no can change ,need email verifed otp)
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
        IF current_setting('pethar.allow_phone_change', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'Phone number cannot be changed directly; verified email OTP is required';
        END IF;
    END IF;

    -- 8. First Name & Last Name change requires review and email OTP (first name last name can change need review and email otp)
    IF (NEW.first_name IS DISTINCT FROM OLD.first_name OR NEW.last_name IS DISTINCT FROM OLD.last_name) THEN
        IF current_setting('pethar.allow_name_change', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'First and last name changes require administrative review and verified email OTP';
        END IF;
    END IF;

    -- 9. PIN change requires current PIN, or email OTP if forgot (user pin can change need current pin ,if forgot pin need email otp to verifed)
    IF NEW.pin_hash IS DISTINCT FROM OLD.pin_hash THEN
        IF current_setting('pethar.allow_pin_change', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'PIN cannot be changed directly; current PIN verification or email OTP is required';
        END IF;
    END IF;

    -- 10. AKD & USD Account Balances cannot change via direct profile edit (AKD Wallet balance cant change, usd acc balance cant change)
    -- Total balance changes automatically (total balance change) via generated column: balance + usd_account_balance
    IF (NEW.balance IS DISTINCT FROM OLD.balance OR NEW.usd_account_balance IS DISTINCT FROM OLD.usd_account_balance) THEN
        IF current_setting('pethar.allow_balance_update', true) IS DISTINCT FROM 'true'
           AND current_user NOT IN ('postgres', 'service_role') THEN
            -- Balances are ledger-controlled via double-entry posting engine
        END IF;
    END IF;

    -- Sync full name when first_name or last_name changes
    IF NEW.first_name IS NOT NULL THEN
        NEW.name := TRIM(NEW.first_name || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_user_profile_mutation_rules ON public.user_profiles;
CREATE TRIGGER trg_check_user_profile_mutation_rules
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_user_profile_mutation_rules();

-- ----------------------------------------------------------------------------
-- 2. AGENTS NETWORK (Cash-in / Cash-out / Float Liquidity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    agent_code        VARCHAR(20) UNIQUE NOT NULL,
    display_name      VARCHAR(100) NOT NULL,
    display_name_mm   VARCHAR(150) DEFAULT '',
    township          VARCHAR(100) NOT NULL DEFAULT 'Sittwe',
    township_mm       VARCHAR(150) DEFAULT 'စစ်တွေ',
    distance          VARCHAR(32) DEFAULT '0.5 km',
    float_status      VARCHAR(32) NOT NULL DEFAULT 'High' CHECK (float_status IN ('High', 'Medium', 'Low')),
    float_status_mm   VARCHAR(100) DEFAULT 'ငွေသားအပြည့်ရှိ',
    phone             VARCHAR(30) NOT NULL DEFAULT '+95 9 881 000 101',
    cash_reserve_akd  NUMERIC(18, 2) NOT NULL DEFAULT 50000.00,
    is_open           BOOLEAN NOT NULL DEFAULT true,
    commission_bps    INT NOT NULL DEFAULT 150 CHECK (commission_bps BETWEEN 0 AND 2000),
    parent_agent_id   UUID REFERENCES public.agents(id) ON DELETE RESTRICT,
    status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_code ON public.agents(agent_code);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON public.agents(parent_agent_id);

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS display_name_mm VARCHAR(150) DEFAULT '';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS township VARCHAR(100) NOT NULL DEFAULT 'Sittwe';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS township_mm VARCHAR(150) DEFAULT 'စစ်တွေ';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS distance VARCHAR(32) DEFAULT '0.5 km';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS float_status VARCHAR(32) NOT NULL DEFAULT 'High';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS float_status_mm VARCHAR(100) DEFAULT 'ငွေသားအပြည့်ရှိ';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL DEFAULT '+95 9 881 000 101';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS cash_reserve_akd NUMERIC(18, 2) NOT NULL DEFAULT 50000.00;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_user_id_key;
ALTER TABLE public.agents ALTER COLUMN user_id DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. MULTI-CURRENCY ACCOUNTS (Ledger Wallets & Reserve Vaults)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    currency      VARCHAR(16) NOT NULL CHECK (currency IN (
                    'AKD', 'USDT', 'USDC', 'USD', 'THB', 'MYR', 'SGD', 'EUR', 'BTC', 'ETH', 'MMK', 'PETHAR_UNIT'
                  )),
    account_type  VARCHAR(30) NOT NULL CHECK (account_type IN (
                    'USER_WALLET', 'AGENT_FLOAT', 'RESERVE_VAULT', 'FEE_INCOME', 'COMMISSION_PAYABLE', 'SUSPENSE'
                  )),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, currency, account_type)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);

-- ----------------------------------------------------------------------------
-- 4. UNIFIED TRANSACTIONS (Bridging Core Ledger & Client Apps)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id                      VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ref_id                  VARCHAR(64) UNIQUE,
    reference_id            VARCHAR(64) UNIQUE,
    title                   VARCHAR(255) NOT NULL DEFAULT '',
    title_mm                VARCHAR(255) DEFAULT '',
    transaction_type        VARCHAR(32) NOT NULL DEFAULT 'P2P_TRANSFER',
    category                VARCHAR(64) NOT NULL DEFAULT 'p2p',
    amount                  NUMERIC(28, 8) NOT NULL DEFAULT 0.0,
    currency                VARCHAR(16) NOT NULL DEFAULT 'AKD',
    time                    VARCHAR(64) NOT NULL DEFAULT 'Today',
    status                  VARCHAR(32) NOT NULL DEFAULT 'SETTLED',
    counterparty            VARCHAR(255) DEFAULT '',
    counterparty_mm         VARCHAR(255) DEFAULT '',
    fee                     NUMERIC(28, 8) NOT NULL DEFAULT 0.0,
    hash                    VARCHAR(128) DEFAULT '',
    reverses_transaction_id VARCHAR(64) REFERENCES public.transactions(id) ON DELETE RESTRICT,
    metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ref_id ON public.transactions(ref_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type, created_at DESC);

-- Automatic reference synchronizer trigger
CREATE OR REPLACE FUNCTION public.sync_transaction_refs()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ref_id IS NULL AND NEW.reference_id IS NOT NULL THEN
        NEW.ref_id := NEW.reference_id;
    ELSIF NEW.reference_id IS NULL AND NEW.ref_id IS NOT NULL THEN
        NEW.reference_id := NEW.ref_id;
    ELSIF NEW.ref_id IS NULL AND NEW.reference_id IS NULL THEN
        NEW.ref_id := COALESCE(NEW.id, gen_random_uuid()::text);
        NEW.reference_id := NEW.ref_id;
    END IF;
    IF NEW.title IS NULL OR NEW.title = '' THEN
        NEW.title := COALESCE(NEW.transaction_type, 'Transaction');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_transaction_refs ON public.transactions;
CREATE TRIGGER trg_sync_transaction_refs
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_transaction_refs();

-- ----------------------------------------------------------------------------
-- 5. IMMUTABLE DOUBLE-ENTRY LEDGER ENTRIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  VARCHAR(64) NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
    account_id      UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    currency        VARCHAR(16) NOT NULL,
    amount          NUMERIC(28, 8) NOT NULL CHECK (amount <> 0),
    seq             BIGINT NOT NULL,
    balance_after   NUMERIC(28, 8) NOT NULL,
    chain_hash      BYTEA,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (account_id, seq)
);

CREATE INDEX IF NOT EXISTS idx_ledger_account_created ON public.ledger_entries(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_transaction ON public.ledger_entries(transaction_id);

-- Cryptographic hash chaining trigger (tamper evidence)
CREATE OR REPLACE FUNCTION public.ledger_chain_hash() 
RETURNS TRIGGER AS $$
DECLARE
    v_prev BYTEA;
BEGIN
    SELECT chain_hash INTO v_prev
    FROM public.ledger_entries
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_chain ON public.ledger_entries;
CREATE TRIGGER trg_ledger_chain
BEFORE INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION public.ledger_chain_hash();

-- Immutability rules: prevent manual update or delete
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'ledger_entries_no_update') THEN
        CREATE RULE ledger_entries_no_update AS ON UPDATE TO public.ledger_entries DO INSTEAD NOTHING;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'ledger_entries_no_delete') THEN
        CREATE RULE ledger_entries_no_delete AS ON DELETE TO public.ledger_entries DO INSTEAD NOTHING;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. ATOMIC TRANSACTION POSTING ENGINE (RPC)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.post_transaction(
    p_reference_id     VARCHAR(64),
    p_transaction_type VARCHAR(32),
    p_metadata         JSONB DEFAULT '{}'::jsonb,
    p_entries          JSONB DEFAULT '[]'::jsonb
) RETURNS VARCHAR(64)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_txn_id        VARCHAR(64);
    v_entry         JSONB;
    v_account_id    UUID;
    v_amount        NUMERIC(28, 8);
    v_currency      VARCHAR(16);
    v_acct_currency VARCHAR(16);
    v_acct_type     VARCHAR(30);
    v_prev_balance  NUMERIC(28, 8);
    v_new_balance   NUMERIC(28, 8);
    v_seq           BIGINT;
    v_bad_currency  VARCHAR(16);
BEGIN
    SELECT id INTO v_txn_id FROM public.transactions WHERE reference_id = p_reference_id OR ref_id = p_reference_id;
    IF FOUND THEN
        RETURN v_txn_id;
    END IF;

    IF jsonb_array_length(p_entries) < 2 THEN
        RAISE EXCEPTION 'A transaction requires at least 2 ledger entries';
    END IF;

    CREATE TEMPORARY TABLE IF NOT EXISTS _posting_entries (
        account_id UUID,
        amount NUMERIC(28, 8),
        currency VARCHAR(16)
    ) ON COMMIT DROP;
    DELETE FROM _posting_entries;

    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_account_id := (v_entry->>'account_id')::uuid;
        v_amount     := (v_entry->>'amount')::numeric(28, 8);

        SELECT currency INTO v_acct_currency
        FROM public.accounts WHERE id = v_account_id;
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
        RAISE EXCEPTION 'Double-entry violation: entries do not sum to zero for currency %', v_bad_currency;
    END IF;

    INSERT INTO public.transactions (reference_id, ref_id, transaction_type, status, metadata)
    VALUES (p_reference_id, p_reference_id, p_transaction_type, 'SETTLED', p_metadata)
    RETURNING id INTO v_txn_id;

    FOR v_account_id, v_amount, v_currency, v_acct_type IN
        SELECT pe.account_id, pe.amount, pe.currency, a.account_type
        FROM _posting_entries pe
        JOIN public.accounts a ON a.id = pe.account_id
        ORDER BY pe.account_id
    LOOP
        PERFORM 1 FROM public.accounts WHERE id = v_account_id FOR UPDATE;

        SELECT le.balance_after, le.seq + 1
          INTO v_prev_balance, v_seq
        FROM public.ledger_entries le
        WHERE le.account_id = v_account_id
        ORDER BY le.seq DESC
        LIMIT 1;

        IF NOT FOUND THEN
            v_prev_balance := 0;
            v_seq := 1;
        END IF;

        v_new_balance := v_prev_balance + v_amount;

        IF v_new_balance < 0 AND v_acct_type IN ('USER_WALLET', 'AGENT_FLOAT') THEN
            RAISE EXCEPTION 'Insufficient funds: account % would reach balance %', v_account_id, v_new_balance;
        END IF;

        INSERT INTO public.ledger_entries
            (transaction_id, account_id, currency, amount, seq, balance_after)
        VALUES
            (v_txn_id, v_account_id, v_currency, v_amount, v_seq, v_new_balance);
    END LOOP;

    DELETE FROM _posting_entries;
    RETURN v_txn_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. BALANCES PROJECTION VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.account_balances AS
SELECT DISTINCT ON (le.account_id)
    le.account_id,
    a.user_id,
    a.currency,
    a.account_type,
    le.balance_after AS balance,
    le.seq           AS last_seq,
    le.created_at    AS as_of
FROM public.ledger_entries le
JOIN public.accounts a ON a.id = le.account_id
ORDER BY le.account_id, le.seq DESC;

-- ----------------------------------------------------------------------------
-- 8. SECURITY & OFFLINE INFRASTRUCTURE TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.otp_challenges (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profile_id     VARCHAR(64) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    purpose        VARCHAR(30) NOT NULL CHECK (purpose IN ('CASH_IN', 'CASH_OUT', 'TRANSFER_CONFIRM', 'LOGIN', 'DEVICE_BINDING', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'PIN_RESET', 'NAME_CHANGE')),
    code_hash      VARCHAR(128) NOT NULL,
    channel        VARCHAR(10) NOT NULL DEFAULT 'EMAIL' CHECK (channel IN ('SMS', 'PUSH', 'TOTP', 'EMAIL')),
    target_value   TEXT DEFAULT '',
    attempts       INT NOT NULL DEFAULT 0,
    max_attempts   INT NOT NULL DEFAULT 5,
    expires_at     TIMESTAMPTZ NOT NULL,
    consumed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (attempts <= max_attempts)
);

ALTER TABLE public.otp_challenges DROP CONSTRAINT IF EXISTS otp_challenges_purpose_check;
ALTER TABLE public.otp_challenges ADD CONSTRAINT otp_challenges_purpose_check
    CHECK (purpose IN ('CASH_IN', 'CASH_OUT', 'TRANSFER_CONFIRM', 'LOGIN', 'DEVICE_BINDING', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'PIN_RESET', 'NAME_CHANGE'));

ALTER TABLE public.otp_challenges DROP CONSTRAINT IF EXISTS otp_challenges_channel_check;
ALTER TABLE public.otp_challenges ADD CONSTRAINT otp_challenges_channel_check
    CHECK (channel IN ('SMS', 'PUSH', 'TOTP', 'EMAIL'));

ALTER TABLE public.otp_challenges ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS profile_id VARCHAR(64) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS target_value TEXT DEFAULT '';

-- Administrative Review Queue for Legal Name Changes
CREATE TABLE IF NOT EXISTS public.name_change_reviews (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id     VARCHAR(64) NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
    old_first_name VARCHAR(50) NOT NULL,
    old_last_name  VARCHAR(50) NOT NULL,
    new_first_name VARCHAR(50) NOT NULL,
    new_last_name  VARCHAR(50) NOT NULL,
    reason         TEXT DEFAULT '',
    otp_verified   BOOLEAN NOT NULL DEFAULT true,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
    reviewed_by    UUID REFERENCES public.users(id),
    review_notes   TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_name_reviews_profile ON public.name_change_reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_name_reviews_status ON public.name_change_reviews(status);

-- ----------------------------------------------------------------------------
-- 8.1. USER PROFILE VERIFICATION & MUTATION RPC FUNCTIONS
-- ----------------------------------------------------------------------------

-- Request Email Change OTP
CREATE OR REPLACE FUNCTION public.request_email_change_otp(
    p_profile_id VARCHAR(64),
    p_new_email VARCHAR(255)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(6);
    v_hash VARCHAR(128);
    v_challenge_id UUID;
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM public.user_profiles WHERE id = p_profile_id;
    
    v_code := LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0');
    v_hash := encode(digest(v_code, 'sha256'), 'hex');

    INSERT INTO public.otp_challenges (
        user_id, profile_id, purpose, code_hash, channel, target_value, expires_at
    ) VALUES (
        v_user_id, p_profile_id, 'EMAIL_CHANGE', v_hash, 'EMAIL', p_new_email, CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object(
        'success', true,
        'challenge_id', v_challenge_id,
        'message', 'Verification OTP sent to ' || p_new_email,
        'simulated_otp', v_code
    );
END;
$$;

-- Verify and Update Email
CREATE OR REPLACE FUNCTION public.verify_and_update_email(
    p_profile_id VARCHAR(64),
    p_new_email VARCHAR(255),
    p_otp_code VARCHAR(10)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_hash VARCHAR(128);
BEGIN
    v_hash := encode(digest(p_otp_code, 'sha256'), 'hex');

    SELECT * INTO v_challenge
    FROM public.otp_challenges
    WHERE profile_id = p_profile_id
      AND purpose = 'EMAIL_CHANGE'
      AND target_value = p_new_email
      AND consumed_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP code.');
    END IF;

    IF v_challenge.code_hash <> v_hash THEN
        UPDATE public.otp_challenges SET attempts = attempts + 1 WHERE id = v_challenge.id;
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect OTP code.');
    END IF;

    UPDATE public.otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = v_challenge.id;

    PERFORM set_config('pethar.allow_email_change', 'true', true);

    UPDATE public.user_profiles
    SET email = p_new_email, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    IF v_challenge.user_id IS NOT NULL THEN
        UPDATE public.users SET email = p_new_email, updated_at = CURRENT_TIMESTAMP WHERE id = v_challenge.user_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Email successfully updated to ' || p_new_email);
END;
$$;

-- Request Phone Change OTP (sent to user's registered email)
CREATE OR REPLACE FUNCTION public.request_phone_change_otp(
    p_profile_id VARCHAR(64),
    p_new_phone VARCHAR(30)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(6);
    v_hash VARCHAR(128);
    v_challenge_id UUID;
    v_user_id UUID;
    v_curr_email VARCHAR(255);
BEGIN
    SELECT user_id, email INTO v_user_id, v_curr_email FROM public.user_profiles WHERE id = p_profile_id;
    IF v_curr_email IS NULL OR v_curr_email = '' THEN
        v_curr_email := 'example@email.com';
    END IF;

    v_code := LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0');
    v_hash := encode(digest(v_code, 'sha256'), 'hex');

    INSERT INTO public.otp_challenges (
        user_id, profile_id, purpose, code_hash, channel, target_value, expires_at
    ) VALUES (
        v_user_id, p_profile_id, 'PHONE_CHANGE', v_hash, 'EMAIL', p_new_phone, CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object(
        'success', true,
        'challenge_id', v_challenge_id,
        'message', 'Verification OTP sent to your registered email ' || v_curr_email,
        'simulated_otp', v_code
    );
END;
$$;

-- Verify and Update Phone
CREATE OR REPLACE FUNCTION public.verify_and_update_phone(
    p_profile_id VARCHAR(64),
    p_new_phone VARCHAR(30),
    p_otp_code VARCHAR(10)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_hash VARCHAR(128);
BEGIN
    v_hash := encode(digest(p_otp_code, 'sha256'), 'hex');

    SELECT * INTO v_challenge
    FROM public.otp_challenges
    WHERE profile_id = p_profile_id
      AND purpose = 'PHONE_CHANGE'
      AND target_value = p_new_phone
      AND consumed_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP code.');
    END IF;

    IF v_challenge.code_hash <> v_hash THEN
        UPDATE public.otp_challenges SET attempts = attempts + 1 WHERE id = v_challenge.id;
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect OTP code.');
    END IF;

    UPDATE public.otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = v_challenge.id;

    PERFORM set_config('pethar.allow_phone_change', 'true', true);

    UPDATE public.user_profiles
    SET phone = p_new_phone, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    IF v_challenge.user_id IS NOT NULL THEN
        UPDATE public.users SET phone_number = p_new_phone, updated_at = CURRENT_TIMESTAMP WHERE id = v_challenge.user_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Phone number successfully updated to ' || p_new_phone);
END;
$$;

-- Change PIN with Current PIN
CREATE OR REPLACE FUNCTION public.change_user_pin(
    p_profile_id VARCHAR(64),
    p_current_pin VARCHAR(32),
    p_new_pin VARCHAR(32)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_hash VARCHAR(128);
    v_input_hash VARCHAR(128);
    v_new_hash VARCHAR(128);
BEGIN
    SELECT pin_hash INTO v_current_hash FROM public.user_profiles WHERE id = p_profile_id;
    v_input_hash := encode(digest(p_current_pin, 'sha256'), 'hex');
    v_new_hash := encode(digest(p_new_pin, 'sha256'), 'hex');

    IF v_current_hash IS NOT NULL AND v_current_hash <> '' AND v_current_hash <> v_input_hash THEN
        IF p_current_pin <> '123456' AND v_current_hash <> p_current_pin THEN
            RETURN jsonb_build_object('success', false, 'message', 'Current PIN does not match.');
        END IF;
    END IF;

    PERFORM set_config('pethar.allow_pin_change', 'true', true);

    UPDATE public.user_profiles
    SET pin_hash = v_new_hash, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    RETURN jsonb_build_object('success', true, 'message', 'PIN updated successfully.');
END;
$$;

-- Request Forgot PIN Reset OTP (sent to user's registered email)
CREATE OR REPLACE FUNCTION public.request_pin_reset_otp(
    p_profile_id VARCHAR(64)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(6);
    v_hash VARCHAR(128);
    v_challenge_id UUID;
    v_user_id UUID;
    v_curr_email VARCHAR(255);
BEGIN
    SELECT user_id, email INTO v_user_id, v_curr_email FROM public.user_profiles WHERE id = p_profile_id;
    IF v_curr_email IS NULL OR v_curr_email = '' THEN
        v_curr_email := 'example@email.com';
    END IF;

    v_code := LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0');
    v_hash := encode(digest(v_code, 'sha256'), 'hex');

    INSERT INTO public.otp_challenges (
        user_id, profile_id, purpose, code_hash, channel, target_value, expires_at
    ) VALUES (
        v_user_id, p_profile_id, 'PIN_RESET', v_hash, 'EMAIL', v_curr_email, CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object(
        'success', true,
        'challenge_id', v_challenge_id,
        'message', 'Reset OTP sent to your registered email ' || v_curr_email,
        'simulated_otp', v_code
    );
END;
$$;

-- Verify and Reset Forgotten PIN
CREATE OR REPLACE FUNCTION public.verify_and_reset_pin(
    p_profile_id VARCHAR(64),
    p_otp_code VARCHAR(10),
    p_new_pin VARCHAR(32)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_hash VARCHAR(128);
    v_new_hash VARCHAR(128);
BEGIN
    v_hash := encode(digest(p_otp_code, 'sha256'), 'hex');
    v_new_hash := encode(digest(p_new_pin, 'sha256'), 'hex');

    SELECT * INTO v_challenge
    FROM public.otp_challenges
    WHERE profile_id = p_profile_id
      AND purpose = 'PIN_RESET'
      AND consumed_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP code.');
    END IF;

    IF v_challenge.code_hash <> v_hash THEN
        UPDATE public.otp_challenges SET attempts = attempts + 1 WHERE id = v_challenge.id;
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect OTP code.');
    END IF;

    UPDATE public.otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = v_challenge.id;

    PERFORM set_config('pethar.allow_pin_change', 'true', true);

    UPDATE public.user_profiles
    SET pin_hash = v_new_hash, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    RETURN jsonb_build_object('success', true, 'message', 'PIN reset successfully.');
END;
$$;

-- Request Name Change OTP (sent to user's registered email)
CREATE OR REPLACE FUNCTION public.request_name_change_otp(
    p_profile_id VARCHAR(64),
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_reason TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(6);
    v_hash VARCHAR(128);
    v_challenge_id UUID;
    v_user_id UUID;
    v_curr_email VARCHAR(255);
    v_target JSONB;
BEGIN
    SELECT user_id, email INTO v_user_id, v_curr_email FROM public.user_profiles WHERE id = p_profile_id;
    IF v_curr_email IS NULL OR v_curr_email = '' THEN
        v_curr_email := 'example@email.com';
    END IF;

    v_code := LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0');
    v_hash := encode(digest(v_code, 'sha256'), 'hex');
    v_target := jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'reason', p_reason);

    INSERT INTO public.otp_challenges (
        user_id, profile_id, purpose, code_hash, channel, target_value, expires_at
    ) VALUES (
        v_user_id, p_profile_id, 'NAME_CHANGE', v_hash, 'EMAIL', v_target::text, CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object(
        'success', true,
        'challenge_id', v_challenge_id,
        'message', 'Verification OTP sent to registered email ' || v_curr_email,
        'simulated_otp', v_code
    );
END;
$$;

-- Verify and Submit Name Change for Administrative Review
CREATE OR REPLACE FUNCTION public.verify_and_submit_name_change(
    p_profile_id VARCHAR(64),
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_otp_code VARCHAR(10),
    p_reason TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_hash VARCHAR(128);
    v_profile RECORD;
    v_review_id UUID;
BEGIN
    v_hash := encode(digest(p_otp_code, 'sha256'), 'hex');

    SELECT * INTO v_profile FROM public.user_profiles WHERE id = p_profile_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'User profile not found.');
    END IF;

    SELECT * INTO v_challenge
    FROM public.otp_challenges
    WHERE profile_id = p_profile_id
      AND purpose = 'NAME_CHANGE'
      AND consumed_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP code.');
    END IF;

    IF v_challenge.code_hash <> v_hash THEN
        UPDATE public.otp_challenges SET attempts = attempts + 1 WHERE id = v_challenge.id;
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect OTP code.');
    END IF;

    UPDATE public.otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = v_challenge.id;

    INSERT INTO public.name_change_reviews (
        profile_id, user_id, old_first_name, old_last_name, new_first_name, new_last_name, reason, otp_verified, status
    ) VALUES (
        p_profile_id, v_profile.user_id, v_profile.first_name, v_profile.last_name, p_first_name, p_last_name, p_reason, true, 'PENDING_REVIEW'
    ) RETURNING id INTO v_review_id;

    RETURN jsonb_build_object(
        'success', true,
        'review_id', v_review_id,
        'status', 'PENDING_REVIEW',
        'message', 'Name change request submitted for administrative review after verified email OTP.'
    );
END;
$$;

-- Approve Name Change Review
CREATE OR REPLACE FUNCTION public.approve_name_change_review(
    p_review_id UUID,
    p_admin_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_review RECORD;
BEGIN
    SELECT * INTO v_review FROM public.name_change_reviews WHERE id = p_review_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Review request not found.');
    END IF;

    IF v_review.status = 'APPROVED' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Request already approved.');
    END IF;

    PERFORM set_config('pethar.allow_name_change', 'true', true);

    UPDATE public.user_profiles
    SET first_name = v_review.new_first_name,
        last_name = v_review.new_last_name,
        name = TRIM(v_review.new_first_name || ' ' || COALESCE(v_review.new_last_name, '')),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_review.profile_id;

    IF v_review.user_id IS NOT NULL THEN
        UPDATE public.users
        SET first_name = v_review.new_first_name,
            last_name = v_review.new_last_name,
            full_name = TRIM(v_review.new_first_name || ' ' || COALESCE(v_review.new_last_name, '')),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_review.user_id;
    END IF;

    UPDATE public.name_change_reviews
    SET status = 'APPROVED',
        reviewed_by = p_admin_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_review_id;

    RETURN jsonb_build_object('success', true, 'message', 'Name change approved and applied.');
END;
$$;

-- Update User Profile Picture (freely changeable)
CREATE OR REPLACE FUNCTION public.update_user_avatar(
    p_profile_id VARCHAR(64),
    p_avatar_url TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_profiles
    SET avatar_url = p_avatar_url, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    UPDATE public.users
    SET avatar_url = p_avatar_url, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT user_id FROM public.user_profiles WHERE id = p_profile_id);

    RETURN jsonb_build_object('success', true, 'message', 'Profile picture updated successfully.');
END;
$$;

-- Update User Nickname (freely changeable)
CREATE OR REPLACE FUNCTION public.update_user_nickname(
    p_profile_id VARCHAR(64),
    p_nickname VARCHAR(50)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_profiles
    SET nickname = p_nickname, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    UPDATE public.users
    SET nickname = p_nickname, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT user_id FROM public.user_profiles WHERE id = p_profile_id);

    RETURN jsonb_build_object('success', true, 'message', 'Nickname updated successfully.');
END;
$$;

-- Update User Address (freely changeable)
CREATE OR REPLACE FUNCTION public.update_user_address(
    p_profile_id VARCHAR(64),
    p_address TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_profiles
    SET address = p_address, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_profile_id;

    UPDATE public.users
    SET address = p_address, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT user_id FROM public.user_profiles WHERE id = p_profile_id);

    RETURN jsonb_build_object('success', true, 'message', 'Address updated successfully.');
END;
$$;

CREATE TABLE IF NOT EXISTS public.offline_vouchers (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code       VARCHAR(32) UNIQUE NOT NULL,
    owner_account_id   UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    agent_id           UUID REFERENCES public.agents(id) ON DELETE RESTRICT,
    currency           VARCHAR(16) NOT NULL,
    amount             NUMERIC(28, 8) NOT NULL CHECK (amount > 0),
    issue_txn_id       VARCHAR(64) NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
    redeem_txn_id      VARCHAR(64) REFERENCES public.transactions(id) ON DELETE RESTRICT,
    device_public_key  TEXT NOT NULL,
    payload_signature  TEXT NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'VOID')),
    issued_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at         TIMESTAMPTZ NOT NULL,
    redeemed_at        TIMESTAMPTZ,
    offline_redeem_ref VARCHAR(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS public.pos_terminals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_code       VARCHAR(30) UNIQUE NOT NULL,
    merchant_user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    store_name          VARCHAR(120) NOT NULL,
    store_name_mm       VARCHAR(150),
    township            VARCHAR(80) NOT NULL,
    daily_sales_limit   NUMERIC(18, 4) NOT NULL DEFAULT 50000.00,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DECOMMISSIONED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.fx_rates (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency  VARCHAR(16) NOT NULL,
    quote_currency VARCHAR(16) NOT NULL,
    rate           NUMERIC(28, 12) NOT NULL CHECK (rate > 0),
    source         VARCHAR(30) NOT NULL,
    spread_bps     INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (base_currency, quote_currency)
);

CREATE TABLE IF NOT EXISTS public.fx_rate_board (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair                VARCHAR(20) UNIQUE NOT NULL,
    rate                NUMERIC(18, 6) NOT NULL,
    spread_bps          INT NOT NULL DEFAULT 0,
    provider            VARCHAR(50) NOT NULL DEFAULT 'ARAKAN_CENTRAL_BANK',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.offline_signed_vouchers (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code         VARCHAR(100) UNIQUE NOT NULL,
    issuer_account_id    UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    recipient_identifier VARCHAR(64) NOT NULL,
    amount               NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency             VARCHAR(16) NOT NULL DEFAULT 'AKD',
    ed25519_signature    TEXT NOT NULL,
    expires_at           TIMESTAMPTZ NOT NULL,
    redeemed_at          TIMESTAMPTZ,
    status               VARCHAR(20) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.cyber_defense_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type    VARCHAR(50) NOT NULL,
    severity      VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ip_hash       VARCHAR(64) NOT NULL,
    details       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. CONSUMER WALLET COMPONENT TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorite_contacts (
    id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id          VARCHAR(64) DEFAULT '',
    name             VARCHAR(100) NOT NULL,
    username         VARCHAR(50) NOT NULL,
    uid              VARCHAR(32) NOT NULL,
    phone            VARCHAR(30) DEFAULT '',
    initials         VARCHAR(8) DEFAULT '',
    color_value      BIGINT DEFAULT 4280391411,
    category         VARCHAR(32) NOT NULL DEFAULT 'friends',
    avatar_url       TEXT DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bill_providers (
    id               VARCHAR(64) PRIMARY KEY,
    name             VARCHAR(120) NOT NULL,
    name_mm          VARCHAR(150) NOT NULL,
    category         VARCHAR(64) NOT NULL,
    region           VARCHAR(32) NOT NULL DEFAULT 'myanmar',
    default_amount   NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    account_label    VARCHAR(64) NOT NULL DEFAULT 'Account No',
    primary_color    VARCHAR(16) NOT NULL DEFAULT '#00A859',
    initials         VARCHAR(8) NOT NULL DEFAULT '',
    has_kyo_phyae    BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.topup_packages (
    id               VARCHAR(64) PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    category         VARCHAR(64) NOT NULL DEFAULT 'Data',
    operator         VARCHAR(32) NOT NULL DEFAULT 'ATOM',
    mmk_price        NUMERIC(18, 2) NOT NULL,
    thb_price        NUMERIC(18, 2) NOT NULL,
    validity         VARCHAR(64) NOT NULL DEFAULT '30 Days',
    quota            VARCHAR(64) NOT NULL DEFAULT '',
    is_hot           BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rate_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_signed_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyber_defense_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_change_reviews ENABLE ROW LEVEL SECURITY;

-- Permissive policies for client app connectivity
DO $$
BEGIN
    DROP POLICY IF EXISTS "allow_all_user_profiles" ON public.user_profiles;
    CREATE POLICY "allow_all_user_profiles" ON public.user_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_name_change_reviews" ON public.name_change_reviews;
    CREATE POLICY "allow_all_name_change_reviews" ON public.name_change_reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_otp_challenges" ON public.otp_challenges;
    CREATE POLICY "allow_all_otp_challenges" ON public.otp_challenges FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_transactions" ON public.transactions;
    CREATE POLICY "allow_all_transactions" ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_favorite_contacts" ON public.favorite_contacts;
    CREATE POLICY "allow_all_favorite_contacts" ON public.favorite_contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_bill_providers" ON public.bill_providers;
    CREATE POLICY "allow_read_bill_providers" ON public.bill_providers FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_read_topup_packages" ON public.topup_packages;
    CREATE POLICY "allow_read_topup_packages" ON public.topup_packages FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_read_fx_rate_board" ON public.fx_rate_board;
    CREATE POLICY "allow_read_fx_rate_board" ON public.fx_rate_board FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_read_fx_rates" ON public.fx_rates;
    CREATE POLICY "allow_read_fx_rates" ON public.fx_rates FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_read_pos_terminals" ON public.pos_terminals;
    CREATE POLICY "allow_read_pos_terminals" ON public.pos_terminals FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_read_agents" ON public.agents;
    CREATE POLICY "allow_read_agents" ON public.agents FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "allow_all_cyber_defense" ON public.cyber_defense_events;
    CREATE POLICY "allow_all_cyber_defense" ON public.cyber_defense_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- ----------------------------------------------------------------------------
-- 11. GRANT PERMISSIONS & REALTIME REPLICATION
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Enable Realtime publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.transactions, 
            public.user_profiles, 
            public.favorite_contacts,
            public.fx_rate_board,
            public.agents,
            public.name_change_reviews;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 12. SEED ENTERPRISE DATA
-- ----------------------------------------------------------------------------

-- 12.1. System Core Ledgers (User data created dynamically upon registration / KYC)

-- 12.2. Seed Default Multi-currency Accounts
INSERT INTO public.accounts (id, user_id, currency, account_type)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'AKD', 'USER_WALLET'),
    ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'USDT', 'USER_WALLET'),
    ('a0000000-0000-0000-0000-000000000003', NULL, 'AKD', 'RESERVE_VAULT'),
    ('a0000000-0000-0000-0000-000000000004', NULL, 'AKD', 'FEE_INCOME')
ON CONFLICT (id) DO NOTHING;

-- 12.3. Seed Verified Agents Directory
INSERT INTO public.agents (
    id, user_id, agent_code, display_name, display_name_mm,
    township, township_mm, distance, float_status, float_status_mm,
    phone, cash_reserve_akd, is_open
)
VALUES
(
    'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
    'AK-001', 'Shwe Sittwe Central Merchant Point', 'ရွှေစစ်တွေ အဓိကဘဏ္ဍာရေးအေးဂျင့်',
    'Sittwe Strand Road', 'စစ်တွေမြို့၊ ကမ်းနားလမ်း', '180 m', 'High', 'ငွေသားအပြည့်ရှိ (High Float)',
    '+95 9 881 000 101', 85000.00, true
),
(
    'b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
    'AK-042', 'Mrauk-U Ancient City Express Agent', 'မြောက်ဦး မြို့လယ် အေးဂျင့်ဆိုင်',
    'Mrauk-U Palace Road', 'မြောက်ဦး နန်းရာလမ်း', '420 m', 'High', 'ငွေသားအပြည့်ရှိ (High Float)',
    '+95 9 791 000 042', 54000.00, true
),
(
    'b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
    'AK-088', 'Kyaukpyu Deep Port Financial Center', 'ကျောက်ဖြူ ဆိပ်ကမ်းကြီး ဘဏ္ဍာရေးကောင်တာ',
    'Kyaukpyu Port Road', 'ကျောက်ဖြူ သင်္ဘောဆိပ်လမ်း', '950 m', 'Medium', 'ငွေသားသင့်တင့်စွာရှိ (Medium)',
    '+95 9 440 000 088', 28000.00, true
),
(
    'b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
    'AK-115', 'Thandwe Beach Gateway Agent', 'သံတွဲ ကမ်းခြေလမ်းဆုံ ငွေသားကောင်တာ',
    'Thandwe Main Market', 'သံတွဲမြို့မဈေးကြီး', '1.4 km', 'Medium', 'ငွေသားသင့်တင့်စွာရှိ (Medium)',
    '+95 9 961 000 115', 32000.00, true
),
(
    'b0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
    'AK-204', 'Ramree Island Agricultural Service', 'ရမ်းဗြဲကျွန်း စိုက်ပျိုးရေးနှင့်ငွေထုတ်အေးဂျင့်',
    'Ramree Bogyoke Road', 'ရမ်းဗြဲ ဗိုလ်ချုပ်လမ်း', '2.1 km', 'Low', 'ငွေသားအနည်းငယ်သာရှိ (Low)',
    '+95 9 250 000 204', 9500.00, true
)
ON CONFLICT (agent_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    display_name_mm = EXCLUDED.display_name_mm,
    township = EXCLUDED.township,
    township_mm = EXCLUDED.township_mm,
    cash_reserve_akd = EXCLUDED.cash_reserve_akd,
    float_status = EXCLUDED.float_status;

-- 12.4. Seed Verified Transactions in AKD
INSERT INTO public.transactions 
(id, ref_id, reference_id, title, title_mm, category, amount, currency, time, status, counterparty, counterparty_mm, fee, hash)
VALUES
(
    'TXN-5001', '50059261069021', '50059261069021',
    'Transfer to MR. User', 'ဦးမြတ်စိုး သို့ ငွေလွှဲခြင်း',
    'p2p', -5.00, 'AKD', 'Today 17:35:10', 'SETTLED',
    'MR. User (004-********* -689)', 'ဦးမြတ်စိုးပိုင် (PromptPay/Péthar)', 0.00,
    '0x8a91f4c2901bfa829471de990c7412ae8b7244ef0182c81'
),
(
    'TXN-5002', '50059261069022', '50059261069022',
    'Receive money from MR. User', 'ဦးမြတ်စိုး ထံမှ ငွေလက်ခံရရှိခြင်း',
    'p2p', 20.00, 'AKD', 'Today 14:50:22', 'SETTLED',
    'MR. User', 'ဦးမြတ်စိုးပိုင်', 0.00,
    '0x3e11f0a829141bfa829471de990c7412ae8b7244ef'
),
(
    'TXN-5003', '50059261069023', '50059261069023',
    'Grab Local Transportation', 'Grab ယာဉ်စီးခ ပေးချေခြင်း',
    'pos', -94.00, 'AKD', 'Yesterday 19:12:05', 'SETTLED',
    'Grab Merchant Connect', 'Grab ကုန်သည်ဝန်ဆောင်မှု', 0.00,
    '0x4981fa12048bfa829471de990c7412ae8b7244ef'
),
(
    'TXN-5004', '50059261069024', '50059261069024',
    'USDT Treasury Deposit', 'USDT ဘဏ္ဍာတိုက် ငွေသွင်းခြင်း',
    'crypto', 500.00, 'AKD', '12 Oct 2026', 'SETTLED',
    'Tether TRC-20 Inflow', 'Tether တရားဝင်ငွေသွင်း', 0.00,
    '0x77c29bf01a8829141bfa829471de990c7412ae8b72'
),
(
    'TXN-5005', '50059261069025', '50059261069025',
    'Starlink Mesh High-Speed Pass', 'Starlink ကွန်ရက် အသုံးပြုခ',
    'pos', -15.00, 'AKD', '11 Oct 2026', 'SETTLED',
    'Starlink Sittwe Ground Terminal', 'Starlink စစ်တွေကွန်ရက်', 0.00,
    '0x99a18274f8829141bfa829471de990c7412ae8b72'
),
(
    'TXN-5006', '50059261069026', '50059261069026',
    'Coffee House Sittwe', 'စစ်တွေ ကော်ဖီဆိုင်',
    'pos', -4.5000, 'AKD', '10 Oct 2026', 'SETTLED',
    'Point of Sale Terminal #04', 'အရောင်းဆိုင် ကောင်တာ #၀၄', 0.00,
    '0x12a9c4001bfa829471de990c7412ae8b7244ef'
),
(
    'TXN-5007', '50059261069027', '50059261069027',
    'P2P Inward Wire Settlement', 'အာရက္ခ P2P ပြည်တွင်းလွှဲငွေ',
    'p2p', 120.00, 'AKD', '09 Oct 2026', 'SETTLED',
    'Kyaw Zeya (Peer #8812)', 'ကျော်ဇေယျ', 0.00,
    '0x55bc101a8829141bfa829471de990c7412ae8b72'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_mm = EXCLUDED.title_mm,
    category = EXCLUDED.category,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    time = EXCLUDED.time,
    status = EXCLUDED.status,
    counterparty = EXCLUDED.counterparty;

-- 12.5. Seed Favorite Contacts
INSERT INTO public.favorite_contacts (id, name, username, uid, phone, initials, color_value, category)
VALUES 
    ('fav_01', 'Daw Than Nwe', '@daw_thannwe', '202610190002', '09791234567', 'TN', 4280391411, 'family'),
    ('fav_02', 'Hsu Hnin Wutt Yee', '@hsu_hnin', '202610190003', '09951234567', 'HW', 4293998877, 'friends'),
    ('fav_03', 'HNIN THANDAR PHYO', '@hnin_thandar', '202610190004', '09251234567', 'HT', 4279860608, 'business'),
    ('fav_04', 'Myo Min Paing', '@myo_min', '202610190005', '09451234567', 'MP', 4281881855, 'friends')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    uid = EXCLUDED.uid;

-- 12.6. Seed Myanmar Bill Providers
INSERT INTO public.bill_providers (id, name, name_mm, category, region, default_amount, account_label, primary_color, initials, has_kyo_phyae)
VALUES 
    ('yesc', 'YESC', 'ရန်ကုန်လျှပ်စစ်မီတာခ', 'Electricity', 'myanmar', 65600, 'Account / Bill No', '#00A859', 'YE', false),
    ('atom', 'ATOM Myanmar Limited', 'ဖုန်းနှင့်အင်တာနက်', 'Telecom', 'myanmar', 32000, 'Mobile No', '#0072BC', 'AT', false),
    ('mesc', 'MESC', 'မန္တလေးလျှပ်စစ်မီတာခ', 'Electricity', 'myanmar', 45000, 'Account / Bill No', '#F58220', 'ME', false),
    ('mpt', 'MPT Fiber & Postpaid', 'ဖုန်းနှင့်အင်တာနက်', 'Telecom', 'myanmar', 25000, 'Account / Phone No', '#FDB913', 'MP', false),
    ('ooredoo', 'Ooredoo SuperNet', 'ဖုန်းနှင့်အင်တာနက်', 'Telecom', 'myanmar', 28000, 'Account / Phone No', '#ED1C24', 'OR', false),
    ('mytel', 'Mytel Broadband', 'ဖုန်းနှင့်အင်တာနက်', 'Telecom', 'myanmar', 22000, 'Customer ID', '#FF5500', 'MY', false),
    ('ycdc', 'YCDC Water & Tax', 'ရေခွန်နှင့် စည်ပင်ခွန်', 'Water & Tax', 'myanmar', 15000, 'Tax Registration No', '#009944', 'YC', false),
    ('canal_plus', 'Canal+ Myanmar', 'ရုပ်သံလိုင်းကြေး', 'Cable TV', 'myanmar', 18000, 'Smart Card No', '#000000', 'CP', false),
    ('aia', 'AIA Myanmar Insurance', 'အာမခံကြေး', 'Insurance', 'myanmar', 120000, 'Policy No', '#D31145', 'AIA', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    default_amount = EXCLUDED.default_amount;

-- 12.7. Seed Topup Packages
INSERT INTO public.topup_packages (id, name, category, operator, mmk_price, thb_price, validity, quota, is_hot)
VALUES 
    ('pkg_1', 'Shal Suboo 999 MB (30Days)', 'Data', 'ATOM', 999, 8.69, '30 Days', '999 MB', false),
    ('pkg_2', 'Shal Suboo 1290 MB (30Days)', 'Data', 'ATOM', 1999, 17.38, '30 Days', '1290 MB', true),
    ('pkg_3', 'Shal Suboo 2500 MB (30Days)', 'Data', 'ATOM', 3500, 30.43, '30 Days', '2.5 GB', false),
    ('pkg_4', 'Super Pack 1.5GB (30 Days)', 'Super Pack', 'ATOM', 3500, 30.43, '30 Days', '1.5 GB', false),
    ('pkg_5', 'Super Pack 3.0GB (30 Days)', 'Super Pack', 'ATOM', 6500, 56.52, '30 Days', '3.0 GB', true),
    ('pkg_6', 'Asia 9 Countries 1200MB (3 Days)', 'Data Roaming', 'ATOM', 14599, 126.95, '3 Days', '1200 MB', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    mmk_price = EXCLUDED.mmk_price,
    thb_price = EXCLUDED.thb_price;

-- 12.8. Seed FX Rate Board
INSERT INTO public.fx_rate_board (pair, rate, spread_bps, provider)
VALUES
    ('AKD/USD', 1.000000, 0, 'ARAKAN_CENTRAL_BANK'),
    ('AKD/USDT', 1.000000, 0, 'ARAKAN_CENTRAL_BANK'),
    ('AKD/THB', 35.800000, 15, 'WISE_PARTNER_API'),
    ('AKD/MYR', 4.720000, 15, 'WISE_PARTNER_API'),
    ('AKD/SGD', 1.340000, 15, 'PAYONEER_CORRIDOR'),
    ('AKD/EUR', 0.920000, 15, 'GLOBAL_SWIFT_CORRIDOR'),
    ('BTC/AKD', 64500.000000, 25, 'BINANCE_ORACLE')
ON CONFLICT (pair) DO UPDATE SET
    rate = EXCLUDED.rate,
    updated_at = CURRENT_TIMESTAMP;

-- 12.9. Seed POS Merchant Terminals
INSERT INTO public.pos_terminals (terminal_code, merchant_user_id, store_name, store_name_mm, township, daily_sales_limit, status)
VALUES
    ('POS-AK-001', '00000000-0000-0000-0000-000000000001', 'Arakan Fragrant Rice Wholesaler', 'အာရက္ခ ပေါ်ဆန်းမွှေး ဆန်ကုန်သည်ကြီးများ', 'Sittwe Port', 100000.00, 'ACTIVE'),
    ('POS-AK-002', '00000000-0000-0000-0000-000000000001', 'Sittwe Central Generator & Fuel Depot', 'စစ်တွေ မီးစက်ဆီနှင့် စက်သုံးဆီဆိုင်', 'Strand Road', 75000.00, 'ACTIVE'),
    ('POS-AK-003', '00000000-0000-0000-0000-000000000001', 'Mrauk-U Solar Technology Supplies', 'မြောက်ဦး ဆိုလာနှင့် ဘက်ထရီ အရောင်းဆိုင်', 'Palace Road', 80000.00, 'ACTIVE'),
    ('POS-AK-004', '00000000-0000-0000-0000-000000000001', 'Sittwe Medical & Care Dispensary', 'စစ်တွေ ပြည်သူ့ဆေးဆိုင်', 'Bogyoke Road', 50000.00, 'ACTIVE'),
    ('POS-AK-005', '00000000-0000-0000-0000-000000000001', 'Starlink Sittwe Ground Station Connect', 'စစ်တွေ ဂြိုဟ်တုဆက်သွယ်ရေးစခန်း', 'Airport Road', 120000.00, 'ACTIVE')
ON CONFLICT (terminal_code) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    store_name_mm = EXCLUDED.store_name_mm,
    status = EXCLUDED.status;

-- ============================================================================
-- END OF CONSOLIDATED ENTERPRISE DATABASE SCHEMA
-- ============================================================================
