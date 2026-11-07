-- ============================================================================
-- Migration: 0019_transfer_recipient_lookup.sql
-- Description:
--   Server-side recipient resolution for the transfer / pay flow.
--
--   The client must confirm that a recipient account exists before showing the
--   confirmation screen. That lookup is done here so the client never queries
--   user_profiles directly and never needs to expose usernames or nicknames.
--   Only the display name, wallet address and a boolean "found" flag are
--   returned. Verified state is included for internal checks but is not shown
--   in the UI.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.lookup_transfer_recipient(
    p_identifier TEXT
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_query TEXT := TRIM(COALESCE(p_identifier, ''));
    v_row   RECORD;
    v_name  TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF v_query = '' THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    -- Resolve by wallet address / 12-digit UID or username. The caller may
    -- enter a username to find the account, but the response only contains
    -- the account holder's name and wallet address.
    SELECT user_id, uid, wallet_address, first_name, last_name, name, kyc_tier
      INTO v_row
      FROM public.user_profiles
     WHERE uid = v_query
        OR wallet_address = v_query
        OR LOWER(username) = LOWER(TRIM(BOTH '@' FROM v_query))
     LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    v_name := COALESCE(
        NULLIF(TRIM(v_row.name), ''),
        NULLIF(TRIM(COALESCE(v_row.first_name, '') || ' ' || COALESCE(v_row.last_name, '')), '')
    );

    RETURN jsonb_build_object(
        'found', true,
        'name', COALESCE(v_name, 'Péthar User'),
        'wallet_address', COALESCE(NULLIF(v_row.wallet_address, ''), v_row.uid),
        'is_self', v_row.user_id = auth.uid(),
        'verified', COALESCE(v_row.kyc_tier, 1) >= 2
    );
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_transfer_recipient(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_transfer_recipient(TEXT) TO authenticated;
