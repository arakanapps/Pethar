-- Identity-bound access for financial data.
--
-- The original draft disabled every client read ("fail closed") because the
-- relationship between public.users and auth.users had not been validated.
-- The production model is now explicit: public.users.id = auth.uid(),
-- public.user_profiles.user_id = auth.uid(), and every wallet account belongs
-- to public.users.id. Reads are therefore bound to auth.uid() below.
--
-- Writes to balances, transactions and ledger rows remain server-side only.

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accounts_no_client_reads_until_owner_keys" ON public.accounts;
DROP POLICY IF EXISTS "accounts_own_data" ON public.accounts;
CREATE POLICY "accounts_own_data" ON public.accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "txn_no_client_reads_until_owner_keys" ON public.transactions;
DROP POLICY IF EXISTS "txn_own_data" ON public.transactions;
CREATE POLICY "txn_own_data" ON public.transactions
  FOR SELECT TO authenticated
  USING (
    metadata->>'user_id' = auth.uid()::text
    OR metadata->>'recipient_user_id' = auth.uid()::text
  );

DROP POLICY IF EXISTS "ledger_no_client_reads_until_owner_keys" ON public.ledger_entries;
DROP POLICY IF EXISTS "ledger_own_data" ON public.ledger_entries;
CREATE POLICY "ledger_own_data" ON public.ledger_entries
  FOR SELECT TO authenticated
  USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

-- Balances and ledger rows are posted only through SECURITY DEFINER RPCs.
REVOKE INSERT, UPDATE, DELETE ON public.accounts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.ledger_entries FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.post_transaction(VARCHAR, VARCHAR, JSONB, JSONB)
  FROM PUBLIC, anon, authenticated;
