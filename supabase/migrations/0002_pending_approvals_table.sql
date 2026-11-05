-- Péthar Pending Approvals Table for AKD → USD Conversions
-- Admin must approve these before execution

CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('AKD_TO_USD', 'KYC_UPGRADE', 'WITHDRAWAL')),
    amount NUMERIC(18, 4),
    currency VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pending_approvals_user ON public.pending_approvals(user_id);
CREATE INDEX idx_pending_approvals_status ON public.pending_approvals(status);
CREATE INDEX idx_pending_approvals_type ON public.pending_approvals(transaction_type);

-- Enable RLS
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY "users_own_approvals" ON public.pending_approvals
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Service role can do everything (for admin dashboard)
CREATE POLICY "service_full_approvals" ON public.pending_approvals
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.pending_approvals TO authenticated;
GRANT ALL ON public.pending_approvals TO service_role;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pending_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pending_approvals_updated_at
    BEFORE UPDATE ON public.pending_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_approvals_updated_at();

COMMENT ON TABLE public.pending_approvals IS 'Stores requests that require admin approval (AKD to USD conversions, KYC upgrades, withdrawals)';
