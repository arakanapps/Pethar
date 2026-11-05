-- ============================================================================
-- Migration: 20261103000001_unify_ledger_and_faucet.sql
-- Description: Unify double-entry ledger & akd_wallets, atomic sequential UID
--              generation, disable fake crypto addresses, and provide admin test
--              faucet and KYC approval RPCs for Stage 1 solo testing.
-- ============================================================================

-- 1. Random 12-Digit User UID Generator
CREATE OR REPLACE FUNCTION public.generate_random_12digit_uid()
RETURNS VARCHAR(12)
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
    v_uid VARCHAR(12);
    v_attempts INT := 0;
BEGIN
    LOOP
        v_attempts := v_attempts + 1;
        v_uid := (floor(100000000000 + random() * 900000000000)::BIGINT)::TEXT;
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.user_profiles WHERE uid = v_uid
        ) AND NOT EXISTS (
            SELECT 1 FROM public.users WHERE uid = v_uid
        );
        IF v_attempts > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique 12-digit UID after 100 attempts';
        END IF;
    END LOOP;
    RETURN v_uid;
END;
$$;

-- 2. Update ensure_user_profile with sequence & no fake deposit addresses
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
        NULLIF(TRIM(p_first_name), ''),
        NULLIF(TRIM(p_last_name), ''),
        NULLIF(TRIM(COALESCE(TRIM(p_first_name), '') || ' ' || COALESCE(TRIM(p_last_name), '')), ''),
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

    -- Concurrency-safe random 12-digit UID generation
    v_uid_code := public.generate_random_12digit_uid();

    IF p_pin IS NOT NULL AND length(p_pin) >= 6 THEN
        v_pin_hash := crypt(p_pin, gen_salt('bf'));
    END IF;

    -- Deposit addresses are strictly NULL until external institutional custody is connected
    INSERT INTO public.user_profiles (
        user_id, username, uid, email, first_name, last_name, name,
        phone, national_id_no, address, usd_account_wallet_address,
        pin_hash, balance, usd_account_balance, kyc_tier
    )
    VALUES (
        v_uid,
        COALESCE(v_username, v_uid_code),
        v_uid_code,
        LOWER(TRIM(p_email)),
        NULLIF(TRIM(p_first_name), ''),
        NULLIF(TRIM(p_last_name), ''),
        NULLIF(TRIM(COALESCE(TRIM(p_first_name), '') || ' ' || COALESCE(TRIM(p_last_name), '')), ''),
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

    -- Update users.uid with the newly assigned code
    UPDATE public.users SET uid = v_uid_code, updated_at = NOW() WHERE id = v_uid;

    RETURN to_jsonb(v_profile);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 3. Synchronize Ledger Entries to both user_profiles AND akd_wallets
CREATE OR REPLACE FUNCTION public.sync_profile_balance_from_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user      UUID;
    v_currency  VARCHAR(16);
BEGIN
    SELECT user_id, currency INTO v_user, v_currency
      FROM public.accounts WHERE id = NEW.account_id;

    IF v_user IS NULL THEN
        RETURN NEW;
    END IF;

    IF v_currency = 'AKD' THEN
        -- 1. Sync authoritative user_profiles
        UPDATE public.user_profiles
           SET balance = NEW.balance_after
         WHERE user_id = v_user;

        -- 2. Sync akd_wallets if dual wallet system table is present
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'akd_wallets'
        ) THEN
            UPDATE public.akd_wallets
               SET balance = NEW.balance_after,
                   updated_at = NOW()
             WHERE user_id = v_user;
        END IF;

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

-- 4. Set any fake 0x deposit addresses to NULL to protect users from sending real crypto to burn addresses
UPDATE public.user_profiles
   SET usd_account_wallet_address = NULL
 WHERE usd_account_wallet_address LIKE '0x%';

-- 5. Developer Test Faucet: admin_mint_test_akd (service_role only)
CREATE OR REPLACE FUNCTION public.admin_mint_test_akd(
    p_target_uid_or_email TEXT,
    p_amount              NUMERIC,
    p_note                TEXT DEFAULT 'Founder Test Faucet'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_user_id   UUID;
    v_vault_account_id UUID;
    v_user_account_id  UUID;
    v_ref_id           VARCHAR(64);
    v_txn_id           VARCHAR(64);
    v_entries          JSONB;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Faucet amount must be greater than zero';
    END IF;

    -- Lookup target user
    SELECT user_id INTO v_target_user_id
      FROM public.user_profiles
     WHERE uid = p_target_uid_or_email
        OR LOWER(email) = LOWER(TRIM(p_target_uid_or_email))
        OR LOWER(username) = LOWER(TRIM(p_target_uid_or_email))
     LIMIT 1;

    IF v_target_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user profile not found for identifier: %', p_target_uid_or_email;
    END IF;

    -- Ensure RESERVE_VAULT account exists
    SELECT id INTO v_vault_account_id
      FROM public.accounts
     WHERE account_type = 'RESERVE_VAULT' AND currency = 'AKD'
     LIMIT 1;

    IF v_vault_account_id IS NULL THEN
        INSERT INTO public.accounts (account_type, currency, status)
        VALUES ('RESERVE_VAULT', 'AKD', 'ACTIVE')
        RETURNING id INTO v_vault_account_id;
    END IF;

    -- Ensure target USER_WALLET account exists
    SELECT id INTO v_user_account_id
      FROM public.accounts
     WHERE user_id = v_target_user_id AND account_type = 'USER_WALLET' AND currency = 'AKD'
     LIMIT 1;

    IF v_user_account_id IS NULL THEN
        INSERT INTO public.accounts (user_id, account_type, currency, status)
        VALUES (v_target_user_id, 'USER_WALLET', 'AKD', 'ACTIVE')
        RETURNING id INTO v_user_account_id;
    END IF;

    -- Build double-entry posting: Debit Vault (-), Credit User (+)
    v_ref_id := 'FAUCET-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' || substr(md5(random()::text), 1, 8);
    v_entries := jsonb_build_array(
        jsonb_build_object('account_id', v_vault_account_id, 'amount', -p_amount),
        jsonb_build_object('account_id', v_user_account_id, 'amount', p_amount)
    );

    v_txn_id := public.post_transaction(
        v_ref_id,
        'SYSTEM_FAUCET',
        jsonb_build_object(
            'note', COALESCE(p_note, 'Founder Test Faucet'),
            'target_user_id', v_target_user_id,
            'minted_by', 'service_role'
        ),
        v_entries
    );

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'reference_id', v_ref_id,
        'target_user_id', v_target_user_id,
        'amount', p_amount,
        'currency', 'AKD'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_mint_test_akd(TEXT, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mint_test_akd(TEXT, NUMERIC, TEXT) TO service_role;

-- 6. Developer Admin KYC Approval: admin_approve_kyc_level2 (service_role only)
CREATE OR REPLACE FUNCTION public.admin_approve_kyc_level2(
    p_target_uid_or_email TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_user_id UUID;
BEGIN
    SELECT user_id INTO v_target_user_id
      FROM public.user_profiles
     WHERE uid = p_target_uid_or_email
        OR LOWER(email) = LOWER(TRIM(p_target_uid_or_email))
        OR LOWER(username) = LOWER(TRIM(p_target_uid_or_email))
     LIMIT 1;

    IF v_target_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user not found for identifier: %', p_target_uid_or_email;
    END IF;

    -- Upgrade users & user_profiles
    UPDATE public.users
       SET kyc_tier = 2,
           updated_at = NOW()
     WHERE id = v_target_user_id;

    UPDATE public.user_profiles
       SET kyc_tier = 2
     WHERE user_id = v_target_user_id;

    -- Approve any pending KYC upgrade approvals
    UPDATE public.pending_approvals
       SET status = 'APPROVED',
           reviewed_at = NOW()
     WHERE user_id = v_target_user_id
       AND action = 'KYC_UPGRADE'
       AND status = 'PENDING';

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_target_user_id,
        'kyc_tier', 2,
        'status', 'APPROVED'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_kyc_level2(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_kyc_level2(TEXT) TO service_role;
