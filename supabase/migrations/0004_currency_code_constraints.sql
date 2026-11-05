-- Permit only the currently supported wallet currencies. Existing unsupported
-- currency rows must be reconciled before applying this migration.
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_currency_supported;
ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_currency_supported
  CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));

-- Blank avatar values mean "not supplied"; represent that as NULL instead.
ALTER TABLE public.user_profiles
  ALTER COLUMN avatar_url DROP DEFAULT;

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_currency_supported;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_currency_supported
  CHECK (currency IN ('AKD', 'USD', 'USDC', 'USDT'));
