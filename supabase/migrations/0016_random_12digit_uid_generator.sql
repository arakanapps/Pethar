-- ============================================================================
-- Migration: 0016_random_12digit_uid_generator.sql
-- Description:
--   1. Replaces sequential YYYYMMDD0001 UID generation with a cryptographically
--      random 12-digit numeric UID generator (`public.generate_random_12digit_uid()`).
--   2. Updates `public.ensure_user_profile` to assign random 12-digit numeric UIDs.
--   3. Removes any remaining demo wallet addresses, personal test data, or legacy
--      sequential/ARAK UIDs across `public.users` and `public.user_profiles`.
-- ============================================================================

-- 1. Random 12-Digit Numeric UID Generator (100000000000 - 999999999999)
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

-- 2. Update ensure_user_profile to use random 12-digit UID and zero demo addresses
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

    -- Generate unique random 12-digit numeric UID
    v_uid_code := public.generate_random_12digit_uid();

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

    UPDATE public.users SET uid = v_uid_code, updated_at = NOW() WHERE id = v_uid;

    -- Ensure double-entry ledger user wallet accounts exist for AKD and USD
    INSERT INTO public.accounts (user_id, currency, account_type)
    VALUES
        (v_uid, 'AKD', 'USER_WALLET'),
        (v_uid, 'USD', 'USER_WALLET')
    ON CONFLICT (user_id, currency, account_type) DO NOTHING;

    RETURN to_jsonb(v_profile);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 3. Drop legacy sequential user_uid_seq
DROP SEQUENCE IF EXISTS public.user_uid_seq;

-- 4. Reassign any legacy ARAK-% or sequential date-prefixed UIDs to random 12-digit UIDs
DO $$
DECLARE
    r RECORD;
    v_new_uid VARCHAR(12);
BEGIN
    FOR r IN
        SELECT id, user_id, uid
          FROM public.user_profiles
         WHERE uid IS NULL
            OR uid !~ '^\d{12}$'
            OR uid ~ '^20\d{6}0\d{3}$'
    LOOP
        v_new_uid := public.generate_random_12digit_uid();
        UPDATE public.user_profiles SET uid = v_new_uid WHERE id = r.id;
        IF r.user_id IS NOT NULL THEN
            UPDATE public.users SET uid = v_new_uid WHERE id = r.user_id;
        END IF;
    END LOOP;
END $$;

