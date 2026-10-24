-- ============================================================================
-- PeThar (ဖေ့သာ) — Dual-Wallet Architecture & Row-Level Locked Ledger Engine
-- Target: PostgreSQL 14+ / Supabase
--
-- 1. users: Linked to auth.users (id UUID, email, username, status ['pending_otp', 'active'])
-- 2. akd_wallets: Main Wallet (1:1 relation, AKD / ₳, numeric 18,2 >= 0, $0.00 gas fee)
-- 3. crypto_wallets: USD Gateway (1:1 relation, usdt_balance, usdc_balance, deposit_address)
-- 4. transactions: P2P, deposits/withdrawals, and 1:1 in-app swaps with FOR UPDATE locks
-- ============================================================================

-- 1. USER STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM ('pending_otp', 'active');
    END IF;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    status public.user_status NOT NULL DEFAULT 'pending_otp',
    pin_hash VARCHAR(128),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    avatar_url TEXT,
    phone_number VARCHAR(30) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure status column uses enum if users table already existed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status' AND udt_name <> 'user_status'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE public.users ALTER COLUMN status TYPE public.user_status USING (
            CASE 
                WHEN status ILIKE '%pending%' THEN 'pending_otp'::public.user_status
                ELSE 'active'::public.user_status
            END
        );
        ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'pending_otp'::public.user_status;
    END IF;
END $$;

-- 3. AKD WALLETS TABLE (MAIN WALLET: INTERNAL DIGITAL LEDGER)
CREATE TABLE IF NOT EXISTS public.akd_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    currency VARCHAR(8) NOT NULL DEFAULT 'AKD',
    balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    gas_fee_rate NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT akd_balance_check CHECK (balance >= 0.00)
);

-- 4. CRYPTO WALLETS TABLE (USD GATEWAY: ON-CHAIN STABLECOIN DEPOSIT)
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    deposit_address VARCHAR(128) NOT NULL UNIQUE,
    usdt_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    usdc_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usdt_balance_check CHECK (usdt_balance >= 0.00),
    CONSTRAINT usdc_balance_check CHECK (usdc_balance >= 0.00)
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    sender_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recipient_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('p2p_transfer', 'deposit', 'withdrawal', 'swap_crypto_to_akd', 'swap_akd_to_crypto')),
    amount NUMERIC(18,2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'AKD',
    fee NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    reference TEXT,
    blockchain_tx_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_akd_wallets_user ON public.akd_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON public.crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON public.crypto_wallets(deposit_address);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROVISIONING RPC
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.provision_dual_wallets(
    p_user_id UUID,
    p_email TEXT,
    p_username TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
    v_username TEXT := COALESCE(p_username, SPLIT_PART(v_clean_email, '@', 1));
    v_deposit_address TEXT;
    v_akd_id UUID;
    v_crypto_id UUID;
BEGIN
    -- 1. Upsert User
    INSERT INTO public.users (id, email, username, status)
    VALUES (p_user_id, v_clean_email, v_username, 'active')
    ON CONFLICT (id) DO UPDATE
    SET status = 'active', updated_at = CURRENT_TIMESTAMP;

    -- 2. Provision AKD Main Ledger Wallet (1:1)
    INSERT INTO public.akd_wallets (user_id, currency, balance, gas_fee_rate)
    VALUES (p_user_id, 'AKD', 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_akd_id;

    -- 3. Provision Crypto USD Gateway Wallet (1:1)
    v_deposit_address := '0x' || SUBSTRING(REPLACE(p_user_id::TEXT, '-', ''), 1, 40);
    INSERT INTO public.crypto_wallets (user_id, deposit_address, usdt_balance, usdc_balance)
    VALUES (p_user_id, v_deposit_address, 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_crypto_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'akd_wallet_id', v_akd_id,
        'crypto_wallet_id', v_crypto_id,
        'deposit_address', v_deposit_address
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1:1 IN-APP SWAP: CRYPTO TO AKD (Row-Level Locking FOR UPDATE)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.swap_crypto_to_akd(
    p_user_id UUID,
    p_amount NUMERIC,
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_amount NUMERIC(18,2) := ROUND(p_amount, 2);
    v_current_bal NUMERIC(18,2);
    v_crypto_id UUID;
    v_akd_id UUID;
    v_token TEXT := UPPER(TRIM(p_token));
BEGIN
    IF v_amount <= 0 THEN
        RAISE EXCEPTION 'Swap amount must be greater than 0.00';
    END IF;
    IF v_token NOT IN ('USDT', 'USDC') THEN
        RAISE EXCEPTION 'Unsupported crypto token for swap: %', p_token;
    END IF;

    -- 1. Row-Level Lock FOR UPDATE on Crypto USD Gateway Wallet
    IF v_token = 'USDT' THEN
        SELECT id, usdt_balance INTO v_crypto_id, v_current_bal
        FROM public.crypto_wallets
        WHERE user_id = p_user_id
        FOR UPDATE;
    ELSE
        SELECT id, usdc_balance INTO v_crypto_id, v_current_bal
        FROM public.crypto_wallets
        WHERE user_id = p_user_id
        FOR UPDATE;
    END IF;

    IF v_crypto_id IS NULL THEN
        RAISE EXCEPTION 'Crypto wallet not found for user %', p_user_id;
    END IF;

    IF v_current_bal < v_amount THEN
        RAISE EXCEPTION 'Insufficient % balance: available %, requested %', v_token, v_current_bal, v_amount;
    END IF;

    -- 2. Row-Level Lock FOR UPDATE on AKD Main Ledger Wallet
    SELECT id INTO v_akd_id
    FROM public.akd_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_akd_id IS NULL THEN
        RAISE EXCEPTION 'AKD wallet not found for user %', p_user_id;
    END IF;

    -- 3. Execute 1:1 In-App Swap Balance Adjustments
    IF v_token = 'USDT' THEN
        UPDATE public.crypto_wallets
        SET usdt_balance = usdt_balance - v_amount, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    ELSE
        UPDATE public.crypto_wallets
        SET usdc_balance = usdc_balance - v_amount, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    END IF;

    UPDATE public.akd_wallets
    SET balance = balance + v_amount, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    -- 4. Record 1:1 In-App Swap Transaction ($0.00 gas fee)
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        currency,
        fee,
        status,
        reference
    ) VALUES (
        p_user_id,
        'swap_crypto_to_akd',
        v_amount,
        v_token,
        0.00,
        'completed',
        '1:1 Swap: ' || v_amount || ' ' || v_token || ' -> ' || v_amount || ' AKD'
    );

    RETURN jsonb_build_object(
        'success', true,
        'type', 'swap_crypto_to_akd',
        'amount', v_amount,
        'currency_from', v_token,
        'currency_to', 'AKD',
        'fee', 0.00
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1:1 IN-APP SWAP: AKD TO CRYPTO (Row-Level Locking FOR UPDATE)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.swap_akd_to_crypto(
    p_user_id UUID,
    p_amount NUMERIC,
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_amount NUMERIC(18,2) := ROUND(p_amount, 2);
    v_current_akd NUMERIC(18,2);
    v_akd_id UUID;
    v_crypto_id UUID;
    v_token TEXT := UPPER(TRIM(p_token));
BEGIN
    IF v_amount <= 0 THEN
        RAISE EXCEPTION 'Swap amount must be greater than 0.00';
    END IF;
    IF v_token NOT IN ('USDT', 'USDC') THEN
        RAISE EXCEPTION 'Unsupported crypto token for swap: %', p_token;
    END IF;

    -- 1. Row-Level Lock FOR UPDATE on AKD Main Ledger Wallet
    SELECT id, balance INTO v_akd_id, v_current_akd
    FROM public.akd_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_akd_id IS NULL THEN
        RAISE EXCEPTION 'AKD wallet not found for user %', p_user_id;
    END IF;

    IF v_current_akd < v_amount THEN
        RAISE EXCEPTION 'Insufficient AKD balance: available %, requested %', v_current_akd, v_amount;
    END IF;

    -- 2. Row-Level Lock FOR UPDATE on Crypto USD Gateway Wallet
    SELECT id INTO v_crypto_id
    FROM public.crypto_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_crypto_id IS NULL THEN
        RAISE EXCEPTION 'Crypto wallet not found for user %', p_user_id;
    END IF;

    -- 3. Execute 1:1 In-App Swap Balance Adjustments
    UPDATE public.akd_wallets
    SET balance = balance - v_amount, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    IF v_token = 'USDT' THEN
        UPDATE public.crypto_wallets
        SET usdt_balance = usdt_balance + v_amount, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    ELSE
        UPDATE public.crypto_wallets
        SET usdc_balance = usdc_balance + v_amount, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    END IF;

    -- 4. Record 1:1 In-App Swap Transaction ($0.00 gas fee)
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        currency,
        fee,
        status,
        reference
    ) VALUES (
        p_user_id,
        'swap_akd_to_crypto',
        v_amount,
        'AKD',
        0.00,
        'completed',
        '1:1 Swap: ' || v_amount || ' AKD -> ' || v_amount || ' ' || v_token
    );

    RETURN jsonb_build_object(
        'success', true,
        'type', 'swap_akd_to_crypto',
        'amount', v_amount,
        'currency_from', 'AKD',
        'currency_to', v_token,
        'fee', 0.00
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- P2P INTERNAL AKD TRANSFER (Pure Relational SQL ACID, $0.00 Gas Fee)
-- Row-Level Locking FOR UPDATE to completely prevent double-spending
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.p2p_transfer_akd(
    p_sender_id UUID,
    p_recipient_id UUID,
    p_amount NUMERIC,
    p_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_amount NUMERIC(18,2) := ROUND(p_amount, 2);
    v_sender_bal NUMERIC(18,2);
    v_first_id UUID;
    v_second_id UUID;
BEGIN
    IF v_amount <= 0 THEN
        RAISE EXCEPTION 'Transfer amount must be greater than 0.00';
    END IF;
    IF p_sender_id = p_recipient_id THEN
        RAISE EXCEPTION 'Sender and recipient cannot be identical';
    END IF;

    -- Deterministic locking order to avoid deadlocks
    IF p_sender_id < p_recipient_id THEN
        v_first_id := p_sender_id;
        v_second_id := p_recipient_id;
    ELSE
        v_first_id := p_recipient_id;
        v_second_id := p_sender_id;
    END IF;

    PERFORM 1 FROM public.akd_wallets WHERE user_id = v_first_id FOR UPDATE;
    PERFORM 1 FROM public.akd_wallets WHERE user_id = v_second_id FOR UPDATE;

    SELECT balance INTO v_sender_bal FROM public.akd_wallets WHERE user_id = p_sender_id;
    IF v_sender_bal IS NULL OR v_sender_bal < v_amount THEN
        RAISE EXCEPTION 'Insufficient AKD balance';
    END IF;

    -- Transfer balances ($0.00 gas fee)
    UPDATE public.akd_wallets
    SET balance = balance - v_amount, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_sender_id;

    UPDATE public.akd_wallets
    SET balance = balance + v_amount, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_recipient_id;

    INSERT INTO public.transactions (
        user_id,
        sender_user_id,
        recipient_user_id,
        type,
        amount,
        currency,
        fee,
        status,
        reference
    ) VALUES (
        p_sender_id,
        p_sender_id,
        p_recipient_id,
        'p2p_transfer',
        v_amount,
        'AKD',
        0.00,
        'completed',
        COALESCE(p_reference, 'P2P Transfer: ' || v_amount || ' AKD')
    );

    RETURN jsonb_build_object(
        'success', true,
        'amount', v_amount,
        'currency', 'AKD',
        'fee', 0.00
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akd_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users RLS
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- AKD Wallets RLS
DROP POLICY IF EXISTS "Users can read own AKD wallet" ON public.akd_wallets;
CREATE POLICY "Users can read own AKD wallet" ON public.akd_wallets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Crypto Wallets RLS
DROP POLICY IF EXISTS "Users can read own Crypto wallet" ON public.crypto_wallets;
CREATE POLICY "Users can read own Crypto wallet" ON public.crypto_wallets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Transactions RLS
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
CREATE POLICY "Users can read own transactions" ON public.transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = sender_user_id OR auth.uid() = recipient_user_id);
