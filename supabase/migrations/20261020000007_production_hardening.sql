-- ============================================================================
-- Péthar production hardening
-- - Removes the retired MMK currency (and legacy THB pricing).
-- - Adds the authenticated wallet bootstrap, PIN verification, transfer and
--   conversion RPCs used by the Android app.
-- - Keeps profile balances in sync with the immutable ledger.
-- - Adds announcements and pending approvals with tight RLS.
-- Idempotent: safe to run against an existing project.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CURRENCY CLEANUP: AKD, USD, USDC, USDT only
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT c.conrelid::regclass AS tbl, c.conname
          FROM pg_constraint c
         WHERE c.contype = 'c'
           AND c.conrelid::regclass::text IN (
               'public.accounts', 'public.fx_rates', 'public.fx_rate_board',
               'public.offline_signed_vouchers', 'public.ledger_entries',
               'public.user_profiles'
           )
           AND pg_get_constraintdef(c.oid) LIKE '%MMK%'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    END LOOP;
END $$;

ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_currency_check;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_currency_supported;
ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_currency_supported;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_currency_check;
ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

ALTER TABLE public.ledger_entries DROP CONSTRAINT IF EXISTS ledger_entries_currency_check;
ALTER TABLE public.ledger_entries
    ADD CONSTRAINT ledger_entries_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

ALTER TABLE public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_base_currency_check;
ALTER TABLE public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_quote_currency_check;
ALTER TABLE public.fx_rates
    ADD CONSTRAINT fx_rates_base_currency_check CHECK (base_currency IN ('AKD', 'USD', 'USDC', 'USDT')),
    ADD CONSTRAINT fx_rates_quote_currency_check CHECK (quote_currency IN ('AKD', 'USD', 'USDC', 'USDT'));

ALTER TABLE public.fx_rate_board DROP CONSTRAINT IF EXISTS fx_rate_board_pair_check;
ALTER TABLE public.fx_rate_board
    ADD CONSTRAINT fx_rate_board_pair_check
    CHECK (pair ~ '^(AKD|USD|USDC|USDT)/(AKD|USD|USDC|USDT)$');

ALTER TABLE public.offline_signed_vouchers DROP CONSTRAINT IF EXISTS offline_signed_vouchers_currency_check;
ALTER TABLE public.offline_signed_vouchers
    ADD CONSTRAINT offline_signed_vouchers_currency_check
    CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

-- Top-up catalogue is priced in AKD. MMK/THB columns are retired.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'topup_packages' AND column_name = 'mmk_price'
    ) THEN
        ALTER TABLE public.topup_packages RENAME COLUMN mmk_price TO price_akd;
    END IF;
    ALTER TABLE public.topup_packages DROP COLUMN IF EXISTS thb_price;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'topup_packages' AND column_name = 'price_akd'
    ) THEN
        ALTER TABLE public.topup_packages ADD COLUMN price_akd NUMERIC(18, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. LEVEL 1 PROFILES MAY NOT HAVE KYC-LEVEL-2 FIELDS YET
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN national_id_no DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN usd_account_wallet_address DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN usd_account_wallet_address DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_reserve_vault
    ON public.accounts(currency, account_type)
    WHERE user_id IS NULL;

-- ----------------------------------------------------------------------------
-- 3. ANNOUNCEMENTS & PENDING APPROVALS
-- ----------------------------------------------------------------------------
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

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT ON public.announcements TO authenticated;
GRANT SELECT ON public.pending_approvals TO authenticated;
GRANT ALL ON public.announcements TO service_role;
GRANT ALL ON public.pending_approvals TO service_role;

-- ----------------------------------------------------------------------------
-- 4. AUTHENTICATED WALLET BOOTSTRAP, PIN VERIFICATION & TRANSFER RPCs
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


-- Changes the PIN after verifying the current one.
CREATE OR REPLACE FUNCTION public.set_user_pin(p_current_pin TEXT, p_new_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid    UUID := auth.uid();
    v_check  JSONB;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF p_new_pin IS NULL OR length(p_new_pin) <> 6 OR p_new_pin !~ '^[0-9]{6}$' THEN
        RETURN jsonb_build_object('success', false, 'message', 'PIN must be exactly 6 digits');
    END IF;

    v_check := public.verify_user_pin(p_current_pin);
    IF (v_check->>'valid')::boolean IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Current PIN is incorrect');
    END IF;

    UPDATE public.user_profiles
       SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
           pin_attempts = 0,
           pin_locked_until = NULL
     WHERE user_id = v_uid;

    RETURN jsonb_build_object('success', true, 'message', 'PIN updated');
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_pin(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_pin(TEXT, TEXT) TO authenticated;

-- Resets the PIN after the user has proven email ownership with a Supabase OTP.
-- PIN recovery through this RPC is disabled: it does not validate a Supabase
-- OTP. Keep existing function signature unavailable to all client roles.
REVOKE ALL ON FUNCTION public.reset_user_pin(TEXT) FROM PUBLIC, anon, authenticated;

-- Level 2 KYC submission. Stores identity fields and opens an admin review.
CREATE OR REPLACE FUNCTION public.submit_kyc_level2(
    p_national_id TEXT,
    p_dob         DATE,
    p_full_name   TEXT,
    p_address     TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid       UUID := auth.uid();
    v_parts     TEXT[];
    v_request   UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF NULLIF(TRIM(p_national_id), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'National ID is required');
    END IF;
    IF p_dob IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Date of birth is required');
    END IF;
    IF NULLIF(TRIM(p_address), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Address is required');
    END IF;

    v_parts := regexp_split_to_array(TRIM(COALESCE(p_full_name, '')), '\s+');

    UPDATE public.user_profiles
       SET national_id_no = TRIM(p_national_id),
           dob = p_dob,
           address = TRIM(p_address),
           first_name = COALESCE(NULLIF(v_parts[1], ''), first_name),
           last_name = CASE
               WHEN array_length(v_parts, 1) > 1 THEN array_to_string(v_parts[2:], ' ')
               ELSE last_name
           END
     WHERE user_id = v_uid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Profile not found');
    END IF;

    INSERT INTO public.pending_approvals (user_id, transaction_type, status, metadata)
    VALUES (
        v_uid,
        'KYC_UPGRADE',
        'PENDING',
        jsonb_build_object('national_id_no', TRIM(p_national_id), 'submitted_at', now())
    )
    RETURNING id INTO v_request;

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_request,
        'message', 'KYC Level 2 submitted for review'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT) TO authenticated;

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

-- Currency conversion and legacy recovery functions are disabled in the first
-- release. Reset/recovery routines must not be callable without OTP validation.
REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_pin(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reset_user_pin(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_and_reset_pin(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_pin(TEXT, TEXT) TO authenticated;


-- ----------------------------------------------------------------------------
-- 5. IDENTITY-BOUND FINANCIAL POLICIES (overrides the legacy fail-closed draft)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "accounts_no_client_reads_until_owner_keys" ON public.accounts;
DROP POLICY IF EXISTS "accounts_own_data" ON public.accounts;
CREATE POLICY "accounts_own_data" ON public.accounts
    FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "txn_no_client_reads_until_owner_keys" ON public.transactions;
DROP POLICY IF EXISTS "txn_own_data" ON public.transactions;
CREATE POLICY "txn_own_data" ON public.transactions
    FOR SELECT TO authenticated
    USING (
        metadata->>'user_id' = auth.uid()::text
        OR metadata->>'recipient_user_id' = auth.uid()::text
    );

DROP POLICY IF EXISTS "ledger_no_client_reads_until_owner_keys" ON public.ledger_entries;
DROP POLICY IF EXISTS "ledger_own_data" ON public.ledger_entries;
CREATE POLICY "ledger_own_data" ON public.ledger_entries
    FOR SELECT TO authenticated
    USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

REVOKE INSERT, UPDATE, DELETE ON public.accounts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.ledger_entries FROM anon, authenticated;

-- Close inherited/default grants, then expose only the audited RPC allowlist.
-- This also removes the broad grants from migration 001 and PUBLIC's default
-- EXECUTE privilege on SECURITY DEFINER routines.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Explicit allowlist only. Do not grant legacy SECURITY DEFINER helpers that
-- accept target profile IDs or perform admin actions.
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_pin(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_pin_reset_otp(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_name_change_otp(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_submit_name_change(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.approve_name_change_review(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_user_avatar(VARCHAR, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_user_nickname(VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_user_address(VARCHAR, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_update_user_email(VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.change_user_pin(VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_and_reset_pin(VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. PUBLIC USER EXPORT VIEW (no empty-string placeholders)
-- ----------------------------------------------------------------------------
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

GRANT SELECT ON public.v_database_users_export TO authenticated, service_role;

-- Keep execute privileges explicit for the new RPCs.
REVOKE ALL ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_user_pin(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_user_pin(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reset_user_pin(TEXT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_pin(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_pin(TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.reset_user_pin(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon, authenticated;
