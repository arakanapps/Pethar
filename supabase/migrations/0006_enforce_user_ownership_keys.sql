-- Add explicit ownership relationships for user-scoped financial reads.
-- Existing user_id references public.users(id), whose UUID is currently not
-- guaranteed to equal auth.uid(); the public read policies remain deny-all until
-- identity mapping/backfill is verified and policies are deliberately enabled.
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS owner_auth_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS sender_auth_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS recipient_auth_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_accounts_owner_auth_user
  ON public.accounts(owner_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_auth_user
  ON public.transactions(sender_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_auth_user
  ON public.transactions(recipient_auth_user_id);

-- Backfill must be performed only after validating the identity mapping between
-- public.users and auth.users in the actual project. No automatic ID assumptions.
