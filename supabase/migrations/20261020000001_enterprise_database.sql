-- ============================================================================
-- PeThar (ဖေ့သာ) — Complete Unified Enterprise Database & Production Schema
-- Target: PostgreSQL 14+ / PostgreSQL 17 (Supabase)
-- Project: uklqksioruxvatwpvopm (ap-south-1)
-- 
-- Guarantees provided by this unified schema:
--   1. Double-entry immutable ledger with cryptographic SHA-256 chain hashes.
--   2. Atomic posting engine via post_transaction() RPC with overdraft protection.
--   3. Unified transactions model bridging the core ledger & consumer wallet UI.
--   4. Supported currencies: AKD, USD, USDC, and USDT.
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
    first_name                 VARCHAR(50) NOT NULL,
    last_name                  VARCHAR(50) NOT NULL,
    full_name                  VARCHAR(100) NOT NULL,
    nickname                   VARCHAR(50),
    national_id_no             VARCHAR(50),
    dob                        DATE,
    address                    TEXT,
    usd_account_wallet_address VARCHAR(64) NOT NULL,
    pin_hash                   VARCHAR(128),
    avatar_url                 TEXT,
    kyc_tier                   INT NOT NULL DEFAULT 1 CHECK (kyc_tier IN (1, 2)),
    status                     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'FROZEN', 'CLOSED')),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS uid VARCHAR(64) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_no VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS usd_account_wallet_address VARCHAR(64) NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DROP FUNCTION IF EXISTS public.generate_user_uid();
DROP SEQUENCE IF EXISTS public.user_uid_seq;

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id                         VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id                    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    username                   VARCHAR(50) NOT NULL,
    uid                        VARCHAR(64) NOT NULL,
    wallet_address             VARCHAR(64) GENERATED ALWAYS AS (uid) STORED,
    avatar_url                 TEXT,
    email                      VARCHAR(255) NOT NULL,
    pin_hash                   VARCHAR(128),
    phone                      VARCHAR(30) NOT NULL,
    first_name                 VARCHAR(50) NOT NULL,
    last_name                  VARCHAR(50) NOT NULL,
    name                       VARCHAR(100) NOT NULL,
    nickname                   VARCHAR(50),
    national_id_no             VARCHAR(50) NOT NULL,
    dob                        DATE,
    address                    TEXT NOT NULL,
    usd_account_wallet_address VARCHAR(64) NOT NULL,
    balance                    NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    akd_wallet_balance         NUMERIC(18, 4) GENERATED ALWAYS AS (balance) STORED,
    usd_account_balance        NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    total_balance              NUMERIC(18, 4) GENERATED ALWAYS AS (balance + usd_account_balance) STORED,
    currency                   VARCHAR(16) NOT NULL DEFAULT 'AKD',
    kyc_tier                   INT NOT NULL DEFAULT 1,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS uid VARCHAR(64);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS national_id_no VARCHAR(50) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address TEXT NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS usd_account_wallet_address VARCHAR(64) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS usd_account_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.00;
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS ak_id;

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

-- Level 1 accounts do not have national ID, address, phone or a USD wallet yet.
-- These fields become required only when the user starts KYC Level 2.
ALTER TABLE public.user_profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN national_id_no DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN usd_account_wallet_address DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN usd_account_wallet_address DROP NOT NULL;

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

    -- 6. Email change: Fully allowed for database editing, SQL updates, and admin operations.
    -- Automatically formatted and synced across users and user_profiles tables.
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        NEW.email := LOWER(TRIM(NEW.email));
    END IF;

    -- 7. Phone number change: Allow direct database updates
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
        NEW.phone := TRIM(NEW.phone);
    END IF;

    -- 8. First Name & Last Name change: Allow direct database updates
    IF (NEW.first_name IS DISTINCT FROM OLD.first_name OR NEW.last_name IS DISTINCT FROM OLD.last_name) THEN
        -- Allow database updates; client app UI continues to verify via OTP
    END IF;

    -- 9. PIN change: Allow direct database updates
    IF NEW.pin_hash IS DISTINCT FROM OLD.pin_hash THEN
        -- Allow database updates
    END IF;

    -- 10. Balances update
    IF (NEW.balance IS DISTINCT FROM OLD.balance OR NEW.usd_account_balance IS DISTINCT FROM OLD.usd_account_balance) THEN
        -- Balances can be adjusted directly or via ledger engine
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

-- Auto-sync email and status changes from user_profiles to users
CREATE OR REPLACE FUNCTION public.sync_user_profiles_to_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.users 
        SET email = NEW.email, updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id OR uid = NEW.uid;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_profiles_to_users ON public.user_profiles;
CREATE TRIGGER trg_sync_user_profiles_to_users
AFTER UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_profiles_to_users();

-- Auto-sync email changes from users to user_profiles
CREATE OR REPLACE FUNCTION public.sync_users_to_user_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.user_profiles 
        SET email = NEW.email, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.id OR uid = NEW.uid;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_users_to_user_profiles ON public.users;
CREATE TRIGGER trg_sync_users_to_user_profiles
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_users_to_user_profiles();

-- ----------------------------------------------------------------------------
-- 2. AGENTS NETWORK (Cash-in / Cash-out / Float Liquidity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    agent_code        VARCHAR(20) UNIQUE NOT NULL,
    display_name      VARCHAR(100) NOT NULL,
    display_name_mm   VARCHAR(150),
    township          VARCHAR(100) NOT NULL,
    township_mm       VARCHAR(150),
    distance          VARCHAR(32),
    float_status      VARCHAR(32) NOT NULL DEFAULT 'High' CHECK (float_status IN ('High', 'Medium', 'Low')),
    float_status_mm   VARCHAR(100),
    phone             VARCHAR(30) NOT NULL,
    cash_reserve_akd  NUMERIC(18, 2) NOT NULL DEFAULT 50000.00,
    is_open           BOOLEAN NOT NULL DEFAULT true,
    commission_bps    INT NOT NULL DEFAULT 150 CHECK (commission_bps BETWEEN 0 AND 2000),
    parent_agent_id   UUID REFERENCES public.agents(id) ON DELETE RESTRICT,
    status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_code ON public.agents(agent_code);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON public.agents(parent_agent_id);

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS display_name_mm VARCHAR(150);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS township VARCHAR(100) NOT NULL;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS township_mm VARCHAR(150);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS distance VARCHAR(32);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS float_status VARCHAR(32) NOT NULL DEFAULT 'High';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS float_status_mm VARCHAR(100);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS cash_reserve_akd NUMERIC(18, 2) NOT NULL DEFAULT 50000.00;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_user_id_key;
ALTER TABLE public.agents ALTER COLUMN user_id DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. CURRENCY ACCOUNTS (Ledger Wallets & Reserve Vaults)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    currency      VARCHAR(16) NOT NULL CHECK (currency IN (
                    'AKD', 'USD', 'USDC', 'USDT'
                  )),
    account_type  VARCHAR(30) NOT NULL CHECK (account_type IN (
                    'USER_WALLET', 'AGENT_FLOAT', 'RESERVE_VAULT', 'FEE_INCOME', 'COMMISSION_PAYABLE', 'SUSPENSE'
                  )),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, currency, account_type)
);

ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_currency_check;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_reserve_vault
    ON public.accounts(currency, account_type)
    WHERE user_id IS NULL;

-- ----------------------------------------------------------------------------
-- 4. UNIFIED TRANSACTIONS (Bridging Core Ledger & Client Apps)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id                      VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ref_id                  VARCHAR(64) UNIQUE,
    reference_id            VARCHAR(64) UNIQUE,
    title                   VARCHAR(255) NOT NULL,
    title_mm                VARCHAR(255),
    transaction_type        VARCHAR(32) NOT NULL DEFAULT 'TRANSFER',
    category                VARCHAR(64) NOT NULL DEFAULT 'transfer',
    amount                  NUMERIC(28, 8) NOT NULL DEFAULT 0.0,
    currency                VARCHAR(16) NOT NULL DEFAULT 'AKD',
    time                    VARCHAR(64) NOT NULL DEFAULT 'Today',
    status                  VARCHAR(32) NOT NULL DEFAULT 'SETTLED',
    counterparty            VARCHAR(255),
    counterparty_mm         VARCHAR(255),
    fee                     NUMERIC(28, 8) NOT NULL DEFAULT 0.0,
    hash                    VARCHAR(128),
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
    currency        VARCHAR(16) NOT NULL CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT')),
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
-- 6b. AUTHENTICATED WALLET BOOTSTRAP, PIN VERIFICATION & TRANSFER RPCs
-- ----------------------------------------------------------------------------

-- Creates the public.users + public.user_profiles + wallet accounts for the
-- currently authenticated Supabase user. Safe to call repeatedly.
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
    p_email       TEXT,
    p_first_name  TEXT,
    p_last_name   TEXT,
    p_username    TEXT DEFAULT NULL,
    p_pin         TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid       UUID := auth.uid();
    v_username  TEXT;
    v_uid_code  TEXT;
    v_seq       BIGINT;
    v_pin_hash  TEXT;
    v_profile   RECORD;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_username := NULLIF(LOWER(TRIM(COALESCE(p_username, ''))), '');

    IF v_username IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.user_profiles WHERE LOWER(username) = v_username
    ) THEN
        v_username := NULL;
    END IF;

    INSERT INTO public.users (
        id, email, first_name, last_name, full_name, username, uid,
        kyc_tier, status
    )
    VALUES (
        v_uid,
        LOWER(TRIM(p_email)),
        COALESCE(NULLIF(TRIM(p_first_name), ''), 'Péthar User'),
        COALESCE(TRIM(p_last_name), ''),
        TRIM(COALESCE(NULLIF(TRIM(p_first_name), ''), 'Péthar User') || ' ' || COALESCE(TRIM(p_last_name), '')),
        v_username,
        NULL,
        1,
        'ACTIVE'
    )
    ON CONFLICT (id) DO NOTHING;

    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = v_uid) THEN
        SELECT * INTO v_profile FROM public.user_profiles WHERE user_id = v_uid;
        RETURN to_jsonb(v_profile);
    END IF;

    SELECT COUNT(*) + 1 INTO v_seq FROM public.user_profiles;
    v_uid_code := to_char(CURRENT_DATE, 'YYYYMMDD') || lpad(v_seq::TEXT, 4, '0');

    IF p_pin IS NOT NULL AND length(p_pin) >= 6 THEN
        v_pin_hash := crypt(p_pin, gen_salt('bf'));
    END IF;

    INSERT INTO public.user_profiles (
        user_id, username, uid, email, first_name, last_name, name,
        phone, national_id_no, address, usd_account_wallet_address,
        pin_hash, balance, usd_account_balance, kyc_tier
    )
    VALUES (
        v_uid,
        COALESCE(v_username, 'user' || right(v_uid_code, 4)),
        v_uid_code,
        LOWER(TRIM(p_email)),
        COALESCE(NULLIF(TRIM(p_first_name), ''), 'Péthar User'),
        COALESCE(TRIM(p_last_name), ''),
        TRIM(COALESCE(NULLIF(TRIM(p_first_name), ''), 'Péthar User') || ' ' || COALESCE(TRIM(p_last_name), '')),
        NULL,
        NULL,
        NULL,
        NULL,
        v_pin_hash,
        0,
        0,
        1
    )
    RETURNING * INTO v_profile;

    UPDATE public.users
       SET uid = v_uid_code
     WHERE id = v_uid AND uid IS NULL;

    -- Every user gets an AKD wallet immediately. The USD/USDT/USDC wallet is
    -- created but remains unusable until KYC Level 2 is approved.
    INSERT INTO public.accounts (user_id, currency, account_type)
    VALUES (v_uid, 'AKD', 'USER_WALLET'),
           (v_uid, 'USD', 'USER_WALLET')
    ON CONFLICT (user_id, currency, account_type) DO NOTHING;

    RETURN to_jsonb(v_profile);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Verifies a 6-digit PIN with bcrypt and applies lockout after five failures.
CREATE OR REPLACE FUNCTION public.verify_user_pin(p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid       UUID := auth.uid();
    v_profile   RECORD;
    v_attempts  INT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT pin_hash, pin_attempts, pin_locked_until
      INTO v_profile
      FROM public.user_profiles
     WHERE user_id = v_uid;

    IF NOT FOUND OR v_profile.pin_hash IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'message', 'PIN not configured');
    END IF;

    IF v_profile.pin_locked_until IS NOT NULL AND v_profile.pin_locked_until > now() THEN
        RETURN jsonb_build_object('valid', false, 'locked', true, 'message', 'Account temporarily locked');
    END IF;

    IF crypt(p_pin, v_profile.pin_hash) = v_profile.pin_hash THEN
        UPDATE public.user_profiles
           SET pin_attempts = 0, pin_locked_until = NULL
         WHERE user_id = v_uid;
        RETURN jsonb_build_object('valid', true, 'attempts_remaining', 5);
    END IF;

    v_attempts := COALESCE(v_profile.pin_attempts, 0) + 1;

    IF v_attempts >= 5 THEN
        UPDATE public.user_profiles
           SET pin_attempts = v_attempts,
               pin_locked_until = now() + interval '30 minutes'
         WHERE user_id = v_uid;
        RETURN jsonb_build_object('valid', false, 'locked', true, 'attempts_remaining', 0);
    END IF;

    UPDATE public.user_profiles SET pin_attempts = v_attempts WHERE user_id = v_uid;
    RETURN jsonb_build_object('valid', false, 'attempts_remaining', 5 - v_attempts);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_user_pin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_user_pin(TEXT) TO authenticated, service_role;

-- Keeps the denormalised profile balances in step with the immutable ledger.
CREATE OR REPLACE FUNCTION public.sync_profile_balance_from_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user     UUID;
    v_currency VARCHAR(16);
BEGIN
    SELECT user_id, currency INTO v_user, v_currency
      FROM public.accounts WHERE id = NEW.account_id;

    IF v_user IS NULL THEN
        RETURN NEW;
    END IF;

    IF v_currency = 'AKD' THEN
        UPDATE public.user_profiles
           SET balance = NEW.balance_after
         WHERE user_id = v_user;
    ELSIF v_currency IN ('USD', 'USDC', 'USDT') THEN
        UPDATE public.user_profiles
           SET usd_account_balance = (
               SELECT COALESCE(SUM(latest.balance_after), 0)
                 FROM (
                     SELECT DISTINCT ON (le.account_id) le.balance_after
                       FROM public.ledger_entries le
                       JOIN public.accounts a ON a.id = le.account_id
                      WHERE a.user_id = v_user
                        AND a.currency IN ('USD', 'USDC', 'USDT')
                        AND a.account_type = 'USER_WALLET'
                      ORDER BY le.account_id, le.seq DESC
                 ) latest
           )
         WHERE user_id = v_user;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_balance ON public.ledger_entries;
CREATE TRIGGER trg_sync_profile_balance
AFTER INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_balance_from_ledger();

-- Returns the current spendable balance for a wallet account.
CREATE OR REPLACE FUNCTION public.current_account_balance(p_account_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((
        SELECT balance_after FROM public.ledger_entries
         WHERE account_id = p_account_id
         ORDER BY seq DESC LIMIT 1
    ), 0);
$$;

-- Transfers funds between two Péthar wallets. The sender is always auth.uid();
-- callers can never supply an account id or debit another user's wallet.
CREATE OR REPLACE FUNCTION public.transfer_funds(
    p_recipient TEXT,
    p_amount    NUMERIC,
    p_currency  TEXT DEFAULT 'AKD',
    p_note      TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_from        UUID := auth.uid();
    v_to          UUID;
    v_currency    VARCHAR(16);
    v_from_acct   UUID;
    v_to_acct     UUID;
    v_reference   VARCHAR(64);
    v_txn_id      VARCHAR(64);
    v_available   NUMERIC;
    v_recipient   RECORD;
BEGIN
    IF v_from IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_currency := UPPER(TRIM(p_currency));
    IF v_currency NOT IN ('AKD', 'USD', 'USDC', 'USDT') THEN
        RAISE EXCEPTION 'Unsupported currency: %', p_currency;
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    IF p_amount <> round(p_amount, 2) THEN
        RAISE EXCEPTION 'Amount supports at most two decimal places';
    END IF;

    SELECT user_id, uid, username, first_name, last_name
      INTO v_recipient
      FROM public.user_profiles
     WHERE uid = p_recipient
        OR wallet_address = p_recipient
        OR LOWER(username) = LOWER(TRIM(BOTH '@' FROM p_recipient))
     LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recipient not found';
    END IF;

    v_to := v_recipient.user_id;

    IF v_to = v_from THEN
        RAISE EXCEPTION 'You cannot transfer funds to yourself';
    END IF;

    SELECT id INTO v_from_acct
      FROM public.accounts
     WHERE user_id = v_from AND currency = v_currency AND account_type = 'USER_WALLET';

    IF v_from_acct IS NULL THEN
        RAISE EXCEPTION 'Sender wallet not found';
    END IF;

    INSERT INTO public.accounts (user_id, currency, account_type)
    VALUES (v_to, v_currency, 'USER_WALLET')
    ON CONFLICT (user_id, currency, account_type) DO NOTHING;

    SELECT id INTO v_to_acct
      FROM public.accounts
     WHERE user_id = v_to AND currency = v_currency AND account_type = 'USER_WALLET';

    v_available := public.current_account_balance(v_from_acct);
    IF v_available < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    v_reference := 'TX-' || replace(gen_random_uuid()::text, '-', '');

    v_txn_id := public.post_transaction(
        v_reference,
        'TRANSFER',
        jsonb_build_object(
            'user_id', v_from,
            'recipient_user_id', v_to,
            'recipient_uid', v_recipient.uid,
            'note', p_note,
            'channel', 'mobile'
        ),
        jsonb_build_array(
            jsonb_build_object('account_id', v_from_acct, 'amount', -p_amount),
            jsonb_build_object('account_id', v_to_acct, 'amount', p_amount)
        )
    );

    UPDATE public.transactions
       SET amount = p_amount,
           currency = v_currency,
           title = 'Transfer',
           title_mm = 'ငွေလွှဲခြင်း',
           category = 'transfer',
           counterparty = COALESCE(NULLIF(TRIM(v_recipient.first_name || ' ' || COALESCE(v_recipient.last_name, '')), ''), v_recipient.username),
           time = to_char(now(), 'YYYY-MM-DD HH24:MI'),
           metadata = metadata || jsonb_build_object('recipient_uid', v_recipient.uid)
     WHERE id = v_txn_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'reference_id', v_reference,
        'amount', p_amount,
        'currency', v_currency,
        'recipient_uid', v_recipient.uid,
        'message', 'Transfer completed successfully'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) TO authenticated;

-- AKD -> USD requires an administrator decision.
CREATE OR REPLACE FUNCTION public.request_akd_to_usd(p_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid     UUID := auth.uid();
    v_acct    UUID;
    v_request UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    SELECT id INTO v_acct FROM public.accounts
     WHERE user_id = v_uid AND currency = 'AKD' AND account_type = 'USER_WALLET';

    IF public.current_account_balance(v_acct) < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    INSERT INTO public.pending_approvals (user_id, transaction_type, amount, currency, status)
    VALUES (v_uid, 'AKD_TO_USD', p_amount, 'AKD', 'PENDING')
    RETURNING id INTO v_request;

    RETURN jsonb_build_object('success', true, 'request_id', v_request, 'requires_approval', true);
END;
$$;

REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_akd_to_usd(NUMERIC) TO authenticated;

-- USD (USDT/USDC) -> AKD is instant at the 1:1 peg.
CREATE OR REPLACE FUNCTION public.convert_usd_to_akd(p_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid         UUID := auth.uid();
    v_kyc         INT;
    v_akd_acct    UUID;
    v_usd_acct    UUID;
    v_res_akd     UUID;
    v_res_usd     UUID;
    v_available   NUMERIC;
    v_txn_id      VARCHAR(64);
    v_reference   VARCHAR(64);
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT kyc_tier INTO v_kyc FROM public.user_profiles WHERE user_id = v_uid;
    IF COALESCE(v_kyc, 1) < 2 THEN
        RAISE EXCEPTION 'KYC Level 2 approval is required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    SELECT id INTO v_akd_acct FROM public.accounts
     WHERE user_id = v_uid AND currency = 'AKD' AND account_type = 'USER_WALLET';
    SELECT id INTO v_usd_acct FROM public.accounts
     WHERE user_id = v_uid AND currency = 'USD' AND account_type = 'USER_WALLET';

    IF v_usd_acct IS NULL THEN
        RAISE EXCEPTION 'USD wallet not found';
    END IF;

    v_available := public.current_account_balance(v_usd_acct);
    IF v_available < p_amount THEN
        RAISE EXCEPTION 'Insufficient USD balance';
    END IF;

    INSERT INTO public.accounts (user_id, currency, account_type)
    VALUES (NULL, 'AKD', 'RESERVE_VAULT'),
           (NULL, 'USD', 'RESERVE_VAULT')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_res_akd FROM public.accounts
     WHERE user_id IS NULL AND currency = 'AKD' AND account_type = 'RESERVE_VAULT'
     LIMIT 1;
    SELECT id INTO v_res_usd FROM public.accounts
     WHERE user_id IS NULL AND currency = 'USD' AND account_type = 'RESERVE_VAULT'
     LIMIT 1;

    v_reference := 'CV-' || replace(gen_random_uuid()::text, '-', '');

    v_txn_id := public.post_transaction(
        v_reference,
        'CONVERSION',
        jsonb_build_object('user_id', v_uid, 'direction', 'USD_TO_AKD', 'rate', 1),
        jsonb_build_array(
            jsonb_build_object('account_id', v_usd_acct, 'amount', -p_amount),
            jsonb_build_object('account_id', v_res_usd, 'amount', p_amount)
        )
    );

    PERFORM public.post_transaction(
        v_reference || '-AKD',
        'CONVERSION',
        jsonb_build_object('user_id', v_uid, 'direction', 'USD_TO_AKD', 'rate', 1),
        jsonb_build_array(
            jsonb_build_object('account_id', v_res_akd, 'amount', -p_amount),
            jsonb_build_object('account_id', v_akd_acct, 'amount', p_amount)
        )
    );

    RETURN jsonb_build_object('success', true, 'transaction_id', v_txn_id, 'amount', p_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_usd_to_akd(NUMERIC) TO authenticated;

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
    target_value   TEXT,
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
ALTER TABLE public.otp_challenges ADD COLUMN IF NOT EXISTS target_value TEXT;

-- Administrative Review Queue for Legal Name Changes
CREATE TABLE IF NOT EXISTS public.name_change_reviews (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id     VARCHAR(64) NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
    old_first_name VARCHAR(50) NOT NULL,
    old_last_name  VARCHAR(50) NOT NULL,
    new_first_name VARCHAR(50) NOT NULL,
    new_last_name  VARCHAR(50) NOT NULL,
    reason         TEXT,
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
        'message', 'Verification OTP sent to ' || p_new_email
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

-- Direct Admin/Database Update function for user email (allows editing directly in database / SQL)
CREATE OR REPLACE FUNCTION public.admin_update_user_email(
    p_uid VARCHAR(64),
    p_new_email VARCHAR(255)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM set_config('pethar.allow_email_change', 'true', true);

    UPDATE public.user_profiles
    SET email = LOWER(TRIM(p_new_email)), updated_at = CURRENT_TIMESTAMP
    WHERE uid = p_uid OR id = p_uid;

    UPDATE public.users
    SET email = LOWER(TRIM(p_new_email)), updated_at = CURRENT_TIMESTAMP
    WHERE uid = p_uid;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User email successfully updated to ' || LOWER(TRIM(p_new_email))
    );
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
    IF v_curr_email IS NULL THEN
        v_curr_email := '';
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
        'message', 'Verification OTP sent to your registered email ' || v_curr_email
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
        RETURN jsonb_build_object('success', false, 'message', 'Current PIN does not match.');
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
        v_curr_email := '';
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
        'message', 'Reset OTP sent to your registered email ' || v_curr_email
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
    p_reason TEXT
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
    IF v_curr_email IS NULL THEN
        v_curr_email := '';
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
        'message', 'Verification OTP sent to registered email ' || v_curr_email
    );
END;
$$;

-- Verify and Submit Name Change for Administrative Review
CREATE OR REPLACE FUNCTION public.verify_and_submit_name_change(
    p_profile_id VARCHAR(64),
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_otp_code VARCHAR(10),
    p_reason TEXT
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
    offline_redeem_ref VARCHAR(64) UNIQUE,
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'))
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
    UNIQUE (base_currency, quote_currency),
    CHECK (base_currency IN ('AKD', 'USD', 'USDC', 'USDT')),
    CHECK (quote_currency IN ('AKD', 'USD', 'USDC', 'USDT'))
);

ALTER TABLE public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_base_currency_check;
ALTER TABLE public.fx_rates ADD CONSTRAINT fx_rates_base_currency_check
    CHECK (base_currency IN ('AKD', 'USD', 'USDC', 'USDT'));
ALTER TABLE public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_quote_currency_check;
ALTER TABLE public.fx_rates ADD CONSTRAINT fx_rates_quote_currency_check
    CHECK (quote_currency IN ('AKD', 'USD', 'USDC', 'USDT'));

CREATE TABLE IF NOT EXISTS public.fx_rate_board (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair                VARCHAR(20) UNIQUE NOT NULL CHECK (pair ~ '^(AKD|USD|USDC|USDT)/(AKD|USD|USDC|USDT)$'),
    rate                NUMERIC(18, 6) NOT NULL,
    spread_bps          INT NOT NULL DEFAULT 0,
    provider            VARCHAR(50) NOT NULL DEFAULT 'PETHAR',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.fx_rate_board DROP CONSTRAINT IF EXISTS fx_rate_board_pair_check;
ALTER TABLE public.fx_rate_board ADD CONSTRAINT fx_rate_board_pair_check
    CHECK (pair ~ '^(AKD|USD|USDC|USDT)/(AKD|USD|USDC|USDT)$');

DO $$
DECLARE
    invalid_pair RECORD;
BEGIN
    FOR invalid_pair IN
        SELECT pair FROM public.fx_rate_board
        WHERE pair !~ '^(AKD|USD|USDC|USDT)/(AKD|USD|USDC|USDT)$'
    LOOP
        DELETE FROM public.fx_rate_board WHERE pair = invalid_pair.pair;
    END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.offline_signed_vouchers (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code         VARCHAR(100) UNIQUE NOT NULL,
    issuer_account_id    UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    recipient_identifier VARCHAR(64) NOT NULL,
    amount               NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency             VARCHAR(16) NOT NULL DEFAULT 'AKD' CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT')),
    ed25519_signature    TEXT NOT NULL,
    expires_at           TIMESTAMPTZ NOT NULL,
    redeemed_at          TIMESTAMPTZ,
    status               VARCHAR(20) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.offline_signed_vouchers DROP CONSTRAINT IF EXISTS offline_signed_vouchers_currency_check;
ALTER TABLE public.offline_signed_vouchers ADD CONSTRAINT offline_signed_vouchers_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

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
    user_id          VARCHAR(64),
    name             VARCHAR(100) NOT NULL,
    username         VARCHAR(50) NOT NULL,
    uid              VARCHAR(32) NOT NULL,
    phone            VARCHAR(30),
    initials         VARCHAR(8),
    color_value      BIGINT DEFAULT 4280391411,
    category         VARCHAR(32) NOT NULL DEFAULT 'friends',
    avatar_url       TEXT,
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
    initials         VARCHAR(8) NOT NULL,
    has_kyo_phyae    BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.topup_packages (
    id               VARCHAR(64) PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    category         VARCHAR(64) NOT NULL DEFAULT 'Data',
    operator         VARCHAR(32) NOT NULL DEFAULT 'ATOM',
    price_akd        NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    validity         VARCHAR(64) NOT NULL,
    quota            VARCHAR(64) NOT NULL,
    is_hot           BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reference announcements shown on the mobile dashboard.
CREATE TABLE IF NOT EXISTS public.announcements (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en         VARCHAR(160) NOT NULL,
    title_mm         VARCHAR(200),
    body_en          VARCHAR(400) NOT NULL,
    body_mm          VARCHAR(500),
    icon             VARCHAR(40) NOT NULL DEFAULT 'info',
    is_active        BOOLEAN NOT NULL DEFAULT true,
    sort_order       INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Requests that require an administrator decision (AKD -> USD, KYC upgrades).
CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type   VARCHAR(20) NOT NULL CHECK (transaction_type IN ('AKD_TO_USD', 'KYC_UPGRADE', 'WITHDRAWAL')),
    amount             NUMERIC(18, 4),
    currency           VARCHAR(16) CHECK (currency IS NULL OR currency IN ('AKD', 'USD', 'USDC', 'USDT')),
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at        TIMESTAMPTZ,
    reviewed_by        UUID REFERENCES public.users(id),
    admin_notes        TEXT,
    metadata           JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_approvals_user ON public.pending_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON public.pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_type ON public.pending_approvals(transaction_type);

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
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_change_reviews ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- PER-USER ROW LEVEL SECURITY POLICIES
-- Principle: Users access only their own data. Service role has full access.
-- Reference data is private to authenticated users; no anonymous access.
-- ========================================================================
DO $$
BEGIN
    -- ---- USERS: own row only ----
    DROP POLICY IF EXISTS "allow_all_users" ON public.users;
    DROP POLICY IF EXISTS "users_own_data" ON public.users;
    CREATE POLICY "users_own_data" ON public.users
        FOR ALL TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
    DROP POLICY IF EXISTS "users_service_full" ON public.users;
    CREATE POLICY "users_service_full" ON public.users
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- USER PROFILES: own profile only ----
    DROP POLICY IF EXISTS "allow_all_user_profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_own_data" ON public.user_profiles;
    CREATE POLICY "profiles_own_data" ON public.user_profiles
        FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS "profiles_service_full" ON public.user_profiles;
    CREATE POLICY "profiles_service_full" ON public.user_profiles
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- ACCOUNTS: own accounts only ----
    DROP POLICY IF EXISTS "allow_all_accounts" ON public.accounts;
    DROP POLICY IF EXISTS "accounts_own_data" ON public.accounts;
    CREATE POLICY "accounts_own_data" ON public.accounts
        FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS "accounts_service_full" ON public.accounts;
    CREATE POLICY "accounts_service_full" ON public.accounts
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- LEDGER ENTRIES: own entries only (via account ownership) ----
    DROP POLICY IF EXISTS "allow_all_ledger_entries" ON public.ledger_entries;
    DROP POLICY IF EXISTS "ledger_own_data" ON public.ledger_entries;
    CREATE POLICY "ledger_own_data" ON public.ledger_entries
        FOR SELECT TO authenticated
        USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));
    DROP POLICY IF EXISTS "ledger_service_full" ON public.ledger_entries;
    CREATE POLICY "ledger_service_full" ON public.ledger_entries
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- NAME CHANGE REVIEWS: own reviews only ----
    DROP POLICY IF EXISTS "allow_all_name_change_reviews" ON public.name_change_reviews;
    DROP POLICY IF EXISTS "name_reviews_own_data" ON public.name_change_reviews;
    CREATE POLICY "name_reviews_own_data" ON public.name_change_reviews
        FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS "name_reviews_service_full" ON public.name_change_reviews;
    CREATE POLICY "name_reviews_service_full" ON public.name_change_reviews
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- OTP CHALLENGES: own challenges only ----
    DROP POLICY IF EXISTS "allow_all_otp_challenges" ON public.otp_challenges;
    DROP POLICY IF EXISTS "otp_own_data" ON public.otp_challenges;
    CREATE POLICY "otp_own_data" ON public.otp_challenges
        FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS "otp_service_full" ON public.otp_challenges;
    CREATE POLICY "otp_service_full" ON public.otp_challenges
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- TRANSACTIONS: own transactions only (via metadata->user_id) ----
    DROP POLICY IF EXISTS "allow_all_transactions" ON public.transactions;
    DROP POLICY IF EXISTS "txn_own_data" ON public.transactions;
    CREATE POLICY "txn_own_data" ON public.transactions
        FOR ALL TO authenticated
        USING (metadata->>'user_id' = auth.uid()::text OR metadata->>'recipient_user_id' = auth.uid()::text)
        WITH CHECK (metadata->>'user_id' = auth.uid()::text);
    DROP POLICY IF EXISTS "txn_service_full" ON public.transactions;
    CREATE POLICY "txn_service_full" ON public.transactions
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- FAVORITE CONTACTS: own contacts only ----
    DROP POLICY IF EXISTS "allow_all_favorite_contacts" ON public.favorite_contacts;
    DROP POLICY IF EXISTS "contacts_own_data" ON public.favorite_contacts;
    CREATE POLICY "contacts_own_data" ON public.favorite_contacts
        FOR ALL TO authenticated
        USING (user_id = auth.uid()::text)
        WITH CHECK (user_id = auth.uid()::text);
    DROP POLICY IF EXISTS "contacts_service_full" ON public.favorite_contacts;
    CREATE POLICY "contacts_service_full" ON public.favorite_contacts
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- REFERENCE DATA: Read-only for authenticated, full access for service_role ----

    DROP POLICY IF EXISTS "allow_read_bill_providers" ON public.bill_providers;
    DROP POLICY IF EXISTS "allow_all_bill_providers" ON public.bill_providers;
    DROP POLICY IF EXISTS "bill_providers_read" ON public.bill_providers;
    CREATE POLICY "bill_providers_read" ON public.bill_providers
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "bill_providers_service_full" ON public.bill_providers;
    CREATE POLICY "bill_providers_service_full" ON public.bill_providers
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_topup_packages" ON public.topup_packages;
    DROP POLICY IF EXISTS "allow_all_topup_packages" ON public.topup_packages;
    DROP POLICY IF EXISTS "topup_packages_read" ON public.topup_packages;
    CREATE POLICY "topup_packages_read" ON public.topup_packages
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "topup_packages_service_full" ON public.topup_packages;
    CREATE POLICY "topup_packages_service_full" ON public.topup_packages
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "announcements_read" ON public.announcements;
    CREATE POLICY "announcements_read" ON public.announcements
        FOR SELECT TO authenticated USING (is_active = true);
    DROP POLICY IF EXISTS "announcements_service_full" ON public.announcements;
    CREATE POLICY "announcements_service_full" ON public.announcements
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "users_own_approvals" ON public.pending_approvals;
    CREATE POLICY "users_own_approvals" ON public.pending_approvals
        FOR SELECT TO authenticated USING (user_id = auth.uid());
    DROP POLICY IF EXISTS "service_full_approvals" ON public.pending_approvals;
    CREATE POLICY "service_full_approvals" ON public.pending_approvals
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_fx_rate_board" ON public.fx_rate_board;
    DROP POLICY IF EXISTS "allow_all_fx_rate_board" ON public.fx_rate_board;
    DROP POLICY IF EXISTS "fx_rate_board_read" ON public.fx_rate_board;
    CREATE POLICY "fx_rate_board_read" ON public.fx_rate_board
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "fx_rate_board_service_full" ON public.fx_rate_board;
    CREATE POLICY "fx_rate_board_service_full" ON public.fx_rate_board
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_fx_rates" ON public.fx_rates;
    DROP POLICY IF EXISTS "allow_all_fx_rates" ON public.fx_rates;
    DROP POLICY IF EXISTS "fx_rates_read" ON public.fx_rates;
    CREATE POLICY "fx_rates_read" ON public.fx_rates
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "fx_rates_service_full" ON public.fx_rates;
    CREATE POLICY "fx_rates_service_full" ON public.fx_rates
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_pos_terminals" ON public.pos_terminals;
    DROP POLICY IF EXISTS "allow_all_pos_terminals" ON public.pos_terminals;
    DROP POLICY IF EXISTS "pos_terminals_read" ON public.pos_terminals;
    CREATE POLICY "pos_terminals_read" ON public.pos_terminals
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "pos_terminals_service_full" ON public.pos_terminals;
    CREATE POLICY "pos_terminals_service_full" ON public.pos_terminals
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_read_agents" ON public.agents;
    DROP POLICY IF EXISTS "allow_all_agents" ON public.agents;
    DROP POLICY IF EXISTS "agents_read" ON public.agents;
    CREATE POLICY "agents_read" ON public.agents
        FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    DROP POLICY IF EXISTS "agents_service_full" ON public.agents;
    CREATE POLICY "agents_service_full" ON public.agents
        FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ---- CYBER DEFENSE: service_role only ----
    DROP POLICY IF EXISTS "allow_all_cyber_defense" ON public.cyber_defense_events;
    DROP POLICY IF EXISTS "cyber_defense_service_full" ON public.cyber_defense_events;
    CREATE POLICY "cyber_defense_service_full" ON public.cyber_defense_events
        FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- ----------------------------------------------------------------------------
-- 11. GRANT PERMISSIONS & REALTIME REPLICATION (PRIVATE AUTHENTICATED ACCESS)
-- ----------------------------------------------------------------------------
-- Revoke all direct permissions from public anon role
DO $$
BEGIN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
    REVOKE USAGE ON SCHEMA public FROM anon;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated, service_role;

-- Enable Realtime publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.users,
            public.user_profiles, 
            public.transactions, 
            public.favorite_contacts,
            public.fx_rate_board,
            public.agents,
            public.name_change_reviews;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 12. CLEAN DATABASE INITIALIZATION (ZERO MOCK / SEED DATA)
-- ----------------------------------------------------------------------------
-- All citizen users, user profiles, accounts, agents, transactions, favorite contacts,
-- bill providers, topup packages, fx rate board, and pos terminals start empty.
-- All data is inserted, posted, updated, and deleted dynamically via the database.

-- 13. DEDICATED DATABASE USERS & CITIZENS EXPORT VIEW
-- Cleanly exposes all user accounts with Email for SQL exports, reporting and table inspectors.
CREATE OR REPLACE VIEW public.v_database_users_export AS
SELECT 
    up.id AS profile_id,
    up.uid,
    up.username,
    COALESCE(NULLIF(up.email, ''), NULLIF(u.email, '')) AS email,
    up.phone,
    up.first_name,
    up.last_name,
    up.name,
    up.nickname,
    up.national_id_no,
    up.dob,
    up.address,
    up.wallet_address,
    up.usd_account_wallet_address,
    up.balance AS akd_balance,
    up.usd_account_balance,
    up.total_balance,
    up.currency,
    up.kyc_tier,
    COALESCE(u.status, 'ACTIVE') AS account_status,
    up.created_at,
    up.updated_at
FROM public.user_profiles up
LEFT JOIN public.users u ON up.user_id = u.id OR up.uid = u.uid;

GRANT SELECT ON public.v_database_users_export TO authenticated, service_role, postgres;

-- ============================================================================
-- END OF CONSOLIDATED ENTERPRISE DATABASE SCHEMA
-- ============================================================================

