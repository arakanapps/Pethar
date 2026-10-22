-- ============================================================================
-- Migration: 20261020000010_remove_empty_defaults_and_dummy_values.sql
-- Description:
--   1. Removes all empty string ('') and placeholder defaults across all tables.
--   2. Ensures personal/location/account columns (username, first_name, last_name,
--      name, full_name, nickname, phone, address, national_id_no,
--      usd_account_wallet_address) do NOT force dummy placeholders like '@user',
--      'User', 'Sittwe', 'Péthar User', or empty string defaults.
--   3. Sanitizes existing rows in public.users and public.user_profiles to NULL
--      where dummy values were previously inserted.
--   4. Guarantees that only real user data fetched from the database is used.
-- ============================================================================

-- 1. DROP ALL EMPTY STRING DEFAULTS FROM public.users
ALTER TABLE IF EXISTS public.users ALTER COLUMN first_name DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN last_name DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN full_name DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN nickname DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN national_id_no DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN address DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN usd_account_wallet_address DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN pin_hash DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN avatar_url DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN username DROP DEFAULT;

-- 2. DROP ALL EMPTY STRING DEFAULTS FROM public.user_profiles
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN username DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN first_name DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN last_name DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN name DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN nickname DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN phone DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN email DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN national_id_no DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN address DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN usd_account_wallet_address DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN pin_hash DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN avatar_url DROP DEFAULT;

-- 3. ENSURE OPTIONAL PROFILE FIELDS ARE NULLABLE (NO FORCED DUMMY FALLBACKS)
ALTER TABLE IF EXISTS public.users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN address DROP NOT NULL;
ALTER TABLE IF EXISTS public.users ALTER COLUMN usd_account_wallet_address DROP NOT NULL;

ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN national_id_no DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN address DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_profiles ALTER COLUMN usd_account_wallet_address DROP NOT NULL;

-- 4. DYNAMIC SCAN TO DROP ANY REMAINING EMPTY STRING DEFAULTS IN PUBLIC SCHEMA
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT table_name, column_name
          FROM information_schema.columns
         WHERE table_schema = 'public'
           AND column_default IN ('''::text', '''::character varying')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', r.table_name, r.column_name);
    END LOOP;
END $$;

-- 5. SANITIZE EXISTING DATA: PURGE DUMMY PLACEHOLDERS ('User', '@user', 'Sittwe', 'Péthar User', '')
UPDATE public.users
   SET address = NULL
 WHERE address = '' OR LOWER(TRIM(address)) = 'sittwe';

UPDATE public.user_profiles
   SET address = NULL
 WHERE address = '' OR LOWER(TRIM(address)) = 'sittwe';

UPDATE public.users
   SET username = NULL
 WHERE username = '' OR LOWER(TRIM(username)) IN ('@user', 'user', 'pethar user');

UPDATE public.user_profiles
   SET username = NULL
 WHERE username = '' OR LOWER(TRIM(username)) IN ('@user', 'user', 'pethar user');

UPDATE public.users
   SET first_name = NULL
 WHERE first_name = '' OR LOWER(TRIM(first_name)) IN ('user', 'péthar user', 'pethar user');

UPDATE public.users
   SET last_name = NULL
 WHERE last_name = '' OR LOWER(TRIM(last_name)) IN ('user', 'péthar user', 'pethar user');

UPDATE public.users
   SET full_name = NULL
 WHERE full_name = '' OR LOWER(TRIM(full_name)) IN ('user', 'user sittwe', 'péthar user', 'pethar user');

UPDATE public.user_profiles
   SET first_name = NULL
 WHERE first_name = '' OR LOWER(TRIM(first_name)) IN ('user', 'péthar user', 'pethar user');

UPDATE public.user_profiles
   SET last_name = NULL
 WHERE last_name = '' OR LOWER(TRIM(last_name)) IN ('user', 'péthar user', 'pethar user');

UPDATE public.user_profiles
   SET name = NULL
 WHERE name = '' OR LOWER(TRIM(name)) IN ('user', 'user sittwe', 'péthar user', 'pethar user');

UPDATE public.user_profiles
   SET nickname = NULL
 WHERE nickname = '' OR LOWER(TRIM(nickname)) IN ('user', 'péthar user', 'pethar user');

UPDATE public.user_profiles
   SET phone = NULL
 WHERE phone = '';

UPDATE public.user_profiles
   SET national_id_no = NULL
 WHERE national_id_no = '';

UPDATE public.user_profiles
   SET usd_account_wallet_address = NULL
 WHERE usd_account_wallet_address = ''
    OR usd_account_wallet_address = '0x36a8F492C109bE742819aBcD8391048291045f19';

UPDATE public.users
   SET usd_account_wallet_address = NULL
 WHERE usd_account_wallet_address = ''
    OR usd_account_wallet_address = '0x36a8F492C109bE742819aBcD8391048291045f19';

-- 6. AUDIT RLS POLICIES FOR PRIVATE USER DATA ISOLATION
-- Users can only select their own financial records and user profiles.
DROP POLICY IF EXISTS "profiles_own_data" ON public.user_profiles;
CREATE POLICY "profiles_own_data" ON public.user_profiles
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_data" ON public.users;
CREATE POLICY "users_own_data" ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid());
