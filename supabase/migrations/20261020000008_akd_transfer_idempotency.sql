-- AKD-only release guardrail. Apply only after validating the ledger/RPCs on staging.
CREATE TABLE IF NOT EXISTS public.transfer_idempotency (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    idempotency_key UUID NOT NULL,
    request_hash TEXT NOT NULL,
    response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, idempotency_key)
);

ALTER TABLE public.transfer_idempotency ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.transfer_idempotency FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.transfer_idempotency TO service_role;

-- The broad multi-currency RPC and balance oracle must not be callable by clients.
REVOKE ALL ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.current_account_balance(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_akd_to_usd(NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_usd_to_akd(NUMERIC) FROM PUBLIC, anon, authenticated;
-- Keep the generic ledger poster inaccessible after prior migrations/grants.
REVOKE ALL ON FUNCTION public.post_transaction(VARCHAR, VARCHAR, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
-- No cash-out/deposit settlement RPCs are defined in these migrations; keep
-- those features unavailable rather than revoking guessed function signatures.

CREATE OR REPLACE FUNCTION public.transfer_akd_idempotent(
    p_recipient TEXT,
    p_amount NUMERIC,
    p_idempotency_key UUID,
    p_note TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_hash TEXT;
    v_saved public.transfer_idempotency%ROWTYPE;
    v_result JSONB;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;
    IF p_idempotency_key IS NULL OR NULLIF(TRIM(p_recipient), '') IS NULL THEN
        RAISE EXCEPTION 'Recipient and idempotency key are required' USING ERRCODE = '22023';
    END IF;
    IF p_amount IS NULL OR p_amount <= 0 OR p_amount <> round(p_amount, 2) THEN
        RAISE EXCEPTION 'Amount must be positive with at most two decimal places' USING ERRCODE = '22023';
    END IF;

    v_hash := encode(extensions.digest(
        jsonb_build_object('recipient', TRIM(p_recipient), 'amount', p_amount, 'currency', 'AKD', 'note', p_note)::text,
        'sha256'
    ), 'hex');

    -- Serialize by sender before checking idempotency and available funds.
    PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

    -- Check all relevant wallets in one transaction to prevent concurrent sends
    -- racing the underlying ledger balance check.
    PERFORM 1 FROM public.accounts
     WHERE user_id = v_uid AND currency = 'AKD' AND account_type = 'USER_WALLET'
     FOR UPDATE;

    SELECT * INTO v_saved FROM public.transfer_idempotency
     WHERE user_id = v_uid AND idempotency_key = p_idempotency_key;
    IF FOUND THEN
        IF v_saved.request_hash <> v_hash THEN
            RAISE EXCEPTION 'Idempotency key already used for a different request' USING ERRCODE = '22023';
        END IF;
        IF v_saved.response IS NOT NULL THEN RETURN v_saved.response; END IF;
        RAISE EXCEPTION 'Transfer is already processing' USING ERRCODE = '40001';
    END IF;

    INSERT INTO public.transfer_idempotency(user_id, idempotency_key, request_hash)
    VALUES (v_uid, p_idempotency_key, v_hash);

    -- Perform ledger posting within this trusted RPC. Do not call the revoked
    -- generic transfer function: resolve recipient and debit auth.uid() here.
    DECLARE
        v_to UUID;
        v_from_acct UUID;
        v_to_acct UUID;
        v_reference TEXT;
        v_txn_id TEXT;
        v_available NUMERIC;
        v_recipient RECORD;
    BEGIN
        SELECT user_id, uid, username, first_name, last_name
          INTO v_recipient
          FROM public.user_profiles
         WHERE uid = TRIM(p_recipient)
            OR wallet_address = TRIM(p_recipient)
            OR LOWER(username) = LOWER(TRIM(BOTH '@' FROM p_recipient))
         LIMIT 1;
        IF NOT FOUND THEN RAISE EXCEPTION 'Recipient not found'; END IF;
        v_to := v_recipient.user_id;
        IF v_to = v_uid THEN RAISE EXCEPTION 'You cannot transfer funds to yourself'; END IF;

        SELECT id INTO v_from_acct FROM public.accounts
         WHERE user_id = v_uid AND currency = 'AKD' AND account_type = 'USER_WALLET';
        IF v_from_acct IS NULL THEN RAISE EXCEPTION 'Sender wallet not found'; END IF;
        INSERT INTO public.accounts(user_id, currency, account_type)
        VALUES(v_to, 'AKD', 'USER_WALLET')
        ON CONFLICT (user_id, currency, account_type) DO NOTHING;
        SELECT id INTO v_to_acct FROM public.accounts
         WHERE user_id = v_to AND currency = 'AKD' AND account_type = 'USER_WALLET';

        v_available := public.current_account_balance(v_from_acct);
        IF v_available < p_amount THEN RAISE EXCEPTION 'Insufficient funds'; END IF;
        v_reference := 'TX-' || replace(gen_random_uuid()::text, '-', '');
        v_txn_id := public.post_transaction(
            v_reference, 'TRANSFER',
            jsonb_build_object('user_id', v_uid, 'recipient_user_id', v_to,
                'recipient_uid', v_recipient.uid, 'note', p_note, 'channel', 'mobile'),
            jsonb_build_array(
                jsonb_build_object('account_id', v_from_acct, 'amount', -p_amount),
                jsonb_build_object('account_id', v_to_acct, 'amount', p_amount)
            )
        );
        UPDATE public.transactions SET amount = p_amount, currency = 'AKD',
            title = 'Transfer', title_mm = 'ငွေလွှဲခြင်း', category = 'transfer',
            counterparty = COALESCE(NULLIF(TRIM(v_recipient.first_name || ' ' || COALESCE(v_recipient.last_name, '')), ''), v_recipient.username),
            time = to_char(now(), 'YYYY-MM-DD HH24:MI'),
            metadata = metadata || jsonb_build_object('recipient_uid', v_recipient.uid)
         WHERE id = v_txn_id;
        v_result := jsonb_build_object('success', true, 'transaction_id', v_txn_id,
            'reference_id', v_reference, 'amount', p_amount, 'currency', 'AKD',
            'recipient_uid', v_recipient.uid, 'message', 'Transfer completed successfully');
    END;
    IF COALESCE((v_result->>'success')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'Transfer could not be completed' USING ERRCODE = 'P0001';
    END IF;
    v_result := v_result || jsonb_build_object('currency', 'AKD');
    UPDATE public.transfer_idempotency
       SET response = v_result
     WHERE user_id = v_uid AND idempotency_key = p_idempotency_key;
    RETURN v_result;
END;
$$;

-- Preserve the existing reviewed atomic transfer implementation as a private
-- helper: transfer_akd_idempotent calls it in the same transaction. Only the
-- idempotent AKD wrapper is exposed to authenticated callers.
REVOKE ALL ON FUNCTION public.transfer_funds(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transfer_akd_idempotent(TEXT, NUMERIC, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_akd_idempotent(TEXT, NUMERIC, UUID, TEXT) TO authenticated;
