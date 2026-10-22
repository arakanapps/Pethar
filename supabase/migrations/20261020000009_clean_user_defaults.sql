-- Migration: 20261020000009_clean_user_defaults.sql
-- Description: Removes hardcoded dummy defaults ('Péthar User', fake 'userXXXX' usernames)
-- Ensures real financial data integrity: actual user profile fields come from user input or database records.

-- 1. Drop NOT NULL constraints from optional personal name columns to avoid forced dummy fallbacks
ALTER TABLE IF EXISTS public.users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN username DROP NOT NULL;

-- 2. Clean existing database rows that received the previous dummy 'Péthar User' placeholder
UPDATE public.users
   SET first_name = NULL
 WHERE first_name = 'Péthar User';

UPDATE public.users
   SET full_name = NULL
 WHERE full_name = 'Péthar User';

UPDATE public.user_profiles
   SET first_name = NULL
 WHERE first_name = 'Péthar User';

UPDATE public.user_profiles
   SET name = NULL
 WHERE name = 'Péthar User';

-- 3. Replace ensure_user_profile function with pure database-driven implementation
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

    UPDATE public.users
       SET uid = v_uid_code
     WHERE id = v_uid AND (uid IS NULL OR uid = '');

    RETURN to_jsonb(v_profile);
END;
$$;
