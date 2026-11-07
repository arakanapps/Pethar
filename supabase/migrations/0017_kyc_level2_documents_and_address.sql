-- ============================================================================
-- KYC Level 2 — NRIC front/back, live selfie and structured address
-- ----------------------------------------------------------------------------
-- Adds the storage paths for the three identity images, the full structured
-- address (house no → postal code), and an explicit review state machine.
-- Also creates the private `kyc-documents` storage bucket and RPCs used by the
-- mobile app. Idempotent: safe to re-run.
-- ============================================================================

-- 1. REVIEW STATE -----------------------------------------------------------
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS kyc_status          VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS kyc_submitted_at     TIMESTAMPTZ;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS kyc_reviewed_at      TIMESTAMPTZ;

-- Normalise any legacy lower-case review states before adding the constraint.
UPDATE public.user_profiles
   SET kyc_status = CASE LOWER(COALESCE(kyc_status, ''))
           WHEN 'verified' THEN 'VERIFIED'
           WHEN 'pending_review' THEN 'PENDING_REVIEW'
           WHEN 'pending' THEN 'PENDING_REVIEW'
           WHEN 'rejected' THEN 'REJECTED'
           WHEN 'unverified' THEN 'UNVERIFIED'
           WHEN 'email_verified' THEN 'UNVERIFIED'
           WHEN 'verified_lvl1' THEN 'UNVERIFIED'
           WHEN 'verified_lvl2' THEN 'VERIFIED'
           ELSE CASE
               WHEN kyc_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED')
                   THEN kyc_status
               ELSE 'UNVERIFIED'
           END
       END;

-- Backfill review state for rows created before this migration.
UPDATE public.user_profiles
   SET kyc_status = CASE
           WHEN kyc_status IS NOT NULL AND kyc_status <> 'UNVERIFIED' THEN kyc_status
           WHEN kyc_tier >= 2 THEN 'VERIFIED'
           WHEN NULLIF(TRIM(COALESCE(national_id_no, '')), '') IS NOT NULL THEN 'PENDING_REVIEW'
           ELSE 'UNVERIFIED'
       END;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conname = 'user_profiles_kyc_status_check'
    ) THEN
        ALTER TABLE public.user_profiles
            ADD CONSTRAINT user_profiles_kyc_status_check
            CHECK (kyc_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'));
    END IF;
END $$;

-- 2. DOCUMENT STORAGE PATHS -------------------------------------------------
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS nric_front_url TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS nric_back_url  TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS selfie_url     TEXT;

-- 3. STRUCTURED ADDRESS -----------------------------------------------------
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_house_no       TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_street         TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_ward           TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_sub_district   TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_district       TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_province       TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_country        TEXT;
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS address_postal_code    TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status
    ON public.user_profiles (kyc_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_submitted
    ON public.user_profiles (kyc_submitted_at DESC);

-- Keep the single-line `address` column in sync whenever an operator or the
-- KYC RPC edits the structured address fields. Free-text address edits that
-- only touch `address` are left untouched.
CREATE OR REPLACE FUNCTION public.sync_structured_kyc_address()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_changed BOOLEAN := false;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_changed := COALESCE(NEW.address_ward, NEW.address_district,
                              NEW.address_province, NEW.address_country) IS NOT NULL;
    ELSE
        v_changed := NEW.address_house_no IS DISTINCT FROM OLD.address_house_no
            OR NEW.address_street IS DISTINCT FROM OLD.address_street
            OR NEW.address_ward IS DISTINCT FROM OLD.address_ward
            OR NEW.address_sub_district IS DISTINCT FROM OLD.address_sub_district
            OR NEW.address_district IS DISTINCT FROM OLD.address_district
            OR NEW.address_province IS DISTINCT FROM OLD.address_province
            OR NEW.address_country IS DISTINCT FROM OLD.address_country
            OR NEW.address_postal_code IS DISTINCT FROM OLD.address_postal_code;
    END IF;

    IF v_changed THEN
        NEW.address := TRIM(BOTH ', ' FROM concat_ws(', ',
            NULLIF(TRIM(NEW.address_house_no), ''),
            NULLIF(TRIM(NEW.address_street), ''),
            NULLIF(TRIM(NEW.address_ward), ''),
            NULLIF(TRIM(NEW.address_sub_district), ''),
            NULLIF(TRIM(NEW.address_district), ''),
            NULLIF(TRIM(NEW.address_province), ''),
            NULLIF(TRIM(NEW.address_country), ''),
            NULLIF(TRIM(NEW.address_postal_code), '')
        ));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_structured_kyc_address ON public.user_profiles;
CREATE TRIGGER trg_sync_structured_kyc_address
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_structured_kyc_address();

-- 4. PRIVATE STORAGE BUCKET -------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kyc-documents',
    'kyc-documents',
    false,
    10485760, -- 10 MB per object
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
   SET public             = false,
       file_size_limit    = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Uploads live at kyc/<auth.uid()>/<document>.jpg, so each user can only write
-- inside their own folder. Reads are limited to the owner; operators read the
-- files through a service-role/signed-url flow.
DROP POLICY IF EXISTS "kyc_documents_owner_read"   ON storage.objects;
DROP POLICY IF EXISTS "kyc_documents_owner_write"  ON storage.objects;
DROP POLICY IF EXISTS "kyc_documents_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "kyc_documents_owner_delete" ON storage.objects;

CREATE POLICY "kyc_documents_owner_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = 'kyc'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

CREATE POLICY "kyc_documents_owner_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = 'kyc'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

CREATE POLICY "kyc_documents_owner_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = 'kyc'
        AND (storage.foldername(name))[2] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = 'kyc'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

CREATE POLICY "kyc_documents_owner_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = 'kyc'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- 5. SUBMIT KYC LEVEL 2 -----------------------------------------------------
-- Replaces the legacy 4-argument version with the document + structured address
-- version. The account stays at tier 1 until an administrator approves it.
DROP FUNCTION IF EXISTS public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.submit_kyc_level2(
    p_national_id       TEXT,
    p_dob               DATE,
    p_full_name         TEXT,
    p_address           TEXT,
    p_nric_front_url    TEXT DEFAULT NULL,
    p_nric_back_url     TEXT DEFAULT NULL,
    p_selfie_url        TEXT DEFAULT NULL,
    p_house_no          TEXT DEFAULT NULL,
    p_street            TEXT DEFAULT NULL,
    p_ward              TEXT DEFAULT NULL,
    p_sub_district      TEXT DEFAULT NULL,
    p_district          TEXT DEFAULT NULL,
    p_province          TEXT DEFAULT NULL,
    p_country           TEXT DEFAULT NULL,
    p_postal_code       TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid       UUID := auth.uid();
    v_parts     TEXT[];
    v_request   UUID;
    v_address   TEXT;
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
    IF NULLIF(TRIM(p_full_name), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Full legal name is required');
    END IF;
    IF NULLIF(TRIM(p_nric_front_url), '') IS NULL
       OR NULLIF(TRIM(p_nric_back_url), '') IS NULL
       OR NULLIF(TRIM(p_selfie_url), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'NRIC front, NRIC back and a live selfie are required');
    END IF;
    IF NULLIF(TRIM(p_country), '') IS NULL
       OR NULLIF(TRIM(p_province), '') IS NULL
       OR NULLIF(TRIM(p_district), '') IS NULL
       OR NULLIF(TRIM(p_ward), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ward, district, province and country are required');
    END IF;

    v_parts := regexp_split_to_array(TRIM(COALESCE(p_full_name, '')), '\s+');
    v_address := COALESCE(
        NULLIF(TRIM(p_address), ''),
        TRIM(BOTH ', ' FROM concat_ws(', ',
            NULLIF(TRIM(p_house_no), ''),
            NULLIF(TRIM(p_street), ''),
            NULLIF(TRIM(p_ward), ''),
            NULLIF(TRIM(p_sub_district), ''),
            NULLIF(TRIM(p_district), ''),
            NULLIF(TRIM(p_province), ''),
            NULLIF(TRIM(p_country), ''),
            NULLIF(TRIM(p_postal_code), '')
        ))
    );

    UPDATE public.user_profiles
       SET national_id_no      = TRIM(p_national_id),
           dob                 = p_dob,
           address             = v_address,
           first_name          = COALESCE(NULLIF(v_parts[1], ''), first_name),
           last_name           = CASE
               WHEN array_length(v_parts, 1) > 1 THEN array_to_string(v_parts[2:], ' ')
               ELSE last_name
           END,
           nric_front_url      = TRIM(p_nric_front_url),
           nric_back_url       = TRIM(p_nric_back_url),
           selfie_url          = TRIM(p_selfie_url),
           address_house_no    = NULLIF(TRIM(p_house_no), ''),
           address_street      = NULLIF(TRIM(p_street), ''),
           address_ward        = NULLIF(TRIM(p_ward), ''),
           address_sub_district= NULLIF(TRIM(p_sub_district), ''),
           address_district    = NULLIF(TRIM(p_district), ''),
           address_province    = NULLIF(TRIM(p_province), ''),
           address_country     = NULLIF(TRIM(p_country), ''),
           address_postal_code = NULLIF(TRIM(p_postal_code), ''),
           kyc_status          = 'PENDING_REVIEW',
           kyc_rejection_reason= NULL,
           kyc_submitted_at    = NOW(),
           kyc_reviewed_at     = NULL
     WHERE user_id = v_uid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Profile not found');
    END IF;

    -- Close any previous open KYC request and open a fresh one.
    UPDATE public.pending_approvals
       SET status = 'REJECTED',
           reviewed_at = NOW(),
           admin_notes = COALESCE(admin_notes, 'Superseded by a newer KYC submission')
     WHERE user_id = v_uid
       AND transaction_type = 'KYC_UPGRADE'
       AND status = 'PENDING';

    INSERT INTO public.pending_approvals (user_id, transaction_type, status, metadata)
    VALUES (
        v_uid,
        'KYC_UPGRADE',
        'PENDING',
        jsonb_build_object(
            'national_id_no', TRIM(p_national_id),
            'full_name', TRIM(p_full_name),
            'address', v_address,
            'nric_front_url', TRIM(p_nric_front_url),
            'nric_back_url', TRIM(p_nric_back_url),
            'selfie_url', TRIM(p_selfie_url),
            'submitted_at', NOW()
        )
    )
    RETURNING id INTO v_request;

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_request,
        'kyc_status', 'PENDING_REVIEW',
        'message', 'KYC Level 2 submitted for review'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_kyc_level2(TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- 6. UPDATE STRUCTURED ADDRESS (edit after submission) ----------------------
CREATE OR REPLACE FUNCTION public.update_kyc_address(
    p_house_no          TEXT,
    p_street            TEXT,
    p_ward              TEXT,
    p_sub_district      TEXT,
    p_district          TEXT,
    p_province          TEXT,
    p_country           TEXT,
    p_postal_code       TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid     UUID := auth.uid();
    v_address TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF NULLIF(TRIM(p_ward), '') IS NULL
       OR NULLIF(TRIM(p_district), '') IS NULL
       OR NULLIF(TRIM(p_province), '') IS NULL
       OR NULLIF(TRIM(p_country), '') IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ward, district, province and country are required');
    END IF;

    v_address := TRIM(BOTH ', ' FROM concat_ws(', ',
        NULLIF(TRIM(p_house_no), ''),
        NULLIF(TRIM(p_street), ''),
        NULLIF(TRIM(p_ward), ''),
        NULLIF(TRIM(p_sub_district), ''),
        NULLIF(TRIM(p_district), ''),
        NULLIF(TRIM(p_province), ''),
        NULLIF(TRIM(p_country), ''),
        NULLIF(TRIM(p_postal_code), '')
    ));

    UPDATE public.user_profiles
       SET address             = v_address,
           address_house_no    = NULLIF(TRIM(p_house_no), ''),
           address_street      = NULLIF(TRIM(p_street), ''),
           address_ward        = NULLIF(TRIM(p_ward), ''),
           address_sub_district= NULLIF(TRIM(p_sub_district), ''),
           address_district    = NULLIF(TRIM(p_district), ''),
           address_province    = NULLIF(TRIM(p_province), ''),
           address_country     = NULLIF(TRIM(p_country), ''),
           address_postal_code = NULLIF(TRIM(p_postal_code), '')
     WHERE user_id = v_uid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Profile not found');
    END IF;

    RETURN jsonb_build_object('success', true, 'address', v_address);
END;
$$;

REVOKE ALL ON FUNCTION public.update_kyc_address(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_kyc_address(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_kyc_address(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- 7. ADMIN REVIEW RPC (service role) ---------------------------------------
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

    UPDATE public.users
       SET kyc_tier = 2,
           updated_at = NOW()
     WHERE id = v_target_user_id;

    UPDATE public.user_profiles
       SET kyc_tier = 2,
           kyc_status = 'VERIFIED',
           kyc_rejection_reason = NULL,
           kyc_reviewed_at = NOW()
     WHERE user_id = v_target_user_id;

    UPDATE public.pending_approvals
       SET status = 'APPROVED',
           reviewed_at = NOW()
     WHERE user_id = v_target_user_id
       AND transaction_type = 'KYC_UPGRADE'
       AND status = 'PENDING';

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_target_user_id,
        'kyc_tier', 2,
        'status', 'VERIFIED'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_kyc_level2(
    p_target_uid_or_email TEXT,
    p_reason              TEXT DEFAULT 'Identity document could not be verified'
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

    UPDATE public.user_profiles
       SET kyc_tier = 1,
           kyc_status = 'REJECTED',
           kyc_rejection_reason = p_reason,
           kyc_reviewed_at = NOW()
     WHERE user_id = v_target_user_id;

    UPDATE public.pending_approvals
       SET status = 'REJECTED',
           reviewed_at = NOW(),
           admin_notes = p_reason
     WHERE user_id = v_target_user_id
       AND transaction_type = 'KYC_UPGRADE'
       AND status = 'PENDING';

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_target_user_id,
        'kyc_tier', 1,
        'status', 'REJECTED',
        'reason', p_reason
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_kyc_level2(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_kyc_level2(TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.admin_reject_kyc_level2(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_kyc_level2(TEXT, TEXT) TO service_role;

-- 8. EXPORT VIEW ------------------------------------------------------------
DROP VIEW IF EXISTS public.v_database_users_export;
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
    up.address_house_no,
    up.address_street,
    up.address_ward,
    up.address_sub_district,
    up.address_district,
    up.address_province,
    up.address_country,
    up.address_postal_code,
    up.nric_front_url,
    up.nric_back_url,
    up.selfie_url,
    up.kyc_status,
    up.kyc_rejection_reason,
    up.kyc_submitted_at,
    up.kyc_reviewed_at,
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
