-- Péthar pending approvals: AKD -> USD conversions, KYC upgrades and withdrawals
-- require an administrator decision before execution.
-- Idempotent: safe to re-run after the original version was applied.

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

ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_approvals" ON public.pending_approvals;
CREATE POLICY "users_own_approvals" ON public.pending_approvals
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "service_full_approvals" ON public.pending_approvals;
CREATE POLICY "service_full_approvals" ON public.pending_approvals
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

GRANT SELECT ON public.pending_approvals TO authenticated;
GRANT ALL ON public.pending_approvals TO service_role;

CREATE OR REPLACE FUNCTION public.update_pending_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pending_approvals_updated_at ON public.pending_approvals;
CREATE TRIGGER trigger_update_pending_approvals_updated_at
    BEFORE UPDATE ON public.pending_approvals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pending_approvals_updated_at();

COMMENT ON TABLE public.pending_approvals IS
    'Requests that require administrator approval (AKD to USD conversions, KYC upgrades, withdrawals)';
