-- Péthar database verification
-- Run in the Supabase SQL editor (or: psql "$DATABASE_URL" -f scripts/verify-database.sql)
-- Every row should report status = OK. Anything else needs attention.

WITH expected_tables(name) AS (
    VALUES
        ('users'), ('user_profiles'), ('accounts'), ('transactions'), ('ledger_entries'),
        ('agents'), ('otp_challenges'), ('favorite_contacts'), ('bill_providers'),
        ('topup_packages'), ('fx_rates'), ('fx_rate_board'), ('pos_terminals'),
        ('announcements'), ('pending_approvals')
),
missing_tables AS (
    SELECT name FROM expected_tables
    EXCEPT
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
)
SELECT 'tables' AS check_name,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'MISSING: ' || string_agg(name, ', ') END AS status
FROM missing_tables

UNION ALL

SELECT 'unsupported_currency_constraints',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'MMK/retired currency still referenced in ' || count(*) || ' constraint(s)' END
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text LIKE 'public.%'
  AND pg_get_constraintdef(oid) LIKE '%MMK%'

UNION ALL

SELECT 'empty_string_defaults',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE count(*) || ' column(s) still default to an empty string' END
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_default IN ('''::text', '''::character varying')

UNION ALL

SELECT 'transfer_functions',
       CASE WHEN count(*) = 5 THEN 'OK' ELSE 'MISSING RPCs (found ' || count(*) || '/5)' END
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('ensure_user_profile', 'verify_user_pin', 'transfer_funds', 'request_akd_to_usd', 'convert_usd_to_akd')

UNION ALL

SELECT 'rls_enabled',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'RLS disabled on: ' || string_agg(relname, ', ') END
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('users', 'user_profiles', 'accounts', 'transactions', 'ledger_entries',
                    'favorite_contacts', 'announcements', 'pending_approvals')
  AND NOT c.relrowsecurity

UNION ALL

SELECT 'client_write_lockdown',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'authenticated still has write grants on: ' || string_agg(table_name, ', ') END
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'authenticated'
  AND table_name IN ('accounts', 'transactions', 'ledger_entries')
  AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE')

UNION ALL

SELECT 'mmk_rows',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE count(*) || ' row(s) still use a retired currency' END
FROM (
    SELECT currency FROM public.accounts WHERE currency NOT IN ('AKD', 'USD', 'USDC', 'USDT')
    UNION ALL
    SELECT currency FROM public.ledger_entries WHERE currency NOT IN ('AKD', 'USD', 'USDC', 'USDT')
    UNION ALL
    SELECT currency FROM public.user_profiles WHERE currency NOT IN ('AKD', 'USD', 'USDC', 'USDT')
) retired;
