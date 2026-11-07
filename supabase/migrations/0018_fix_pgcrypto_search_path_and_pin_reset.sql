-- 0018_fix_pgcrypto_search_path_and_pin_reset.sql
--
-- Why: On Supabase, pgcrypto (digest/crypt/gen_salt) lives in the `extensions`
-- schema. Several RPCs are declared with `SET search_path = public`, so calls
-- such as `digest(...)` fail at runtime with:
--     function digest(character varying, unknown) does not exist  (42883)
-- This broke request_pin_reset_otp / verify_and_reset_pin and the other
-- OTP/PIN RPCs. Include `extensions` in the functions' search_path.
--
-- It also (re)creates reset_user_pin, which existed only in the legacy
-- db/enterprise_database.sql bootstrap and was missing from the deployed
-- database, so the email-OTP PIN reset could not complete.

DO $$
DECLARE
    fn RECORD;
BEGIN
    FOR fn IN
        SELECT p.oid::regprocedure AS signature
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'request_pin_reset_otp',
              'verify_and_reset_pin',
              'change_user_pin',
              'set_user_pin',
              'verify_user_pin',
              'reset_user_pin',
              'request_name_change_otp',
              'verify_name_change_otp',
              'request_phone_change_otp',
              'verify_and_update_phone'
          )
    LOOP
        EXECUTE format(
            'ALTER FUNCTION %s SET search_path = public, extensions',
            fn.signature
        );
    END LOOP;
END;
$$;

-- Reset the PIN after the user has proven email ownership with a Supabase OTP.
CREATE OR REPLACE FUNCTION public.reset_user_pin(p_new_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_uid UUID := auth.uid();
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF p_new_pin IS NULL
       OR length(p_new_pin) <> 6
       OR p_new_pin !~ '^[0-9]{6}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'PIN must be exactly 6 digits'
        );
    END IF;

    UPDATE public.user_profiles
       SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
           pin_attempts = 0,
           pin_locked_until = NULL
     WHERE user_id = v_uid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Profile not found'
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'PIN reset');
END;
$$;

REVOKE ALL ON FUNCTION public.reset_user_pin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reset_user_pin(TEXT) TO authenticated;
