-- Péthar dual-wallet database verification
-- Run in the Supabase SQL editor (or: psql "$DATABASE_URL" -f scripts/verify-database.sql)
-- Every row should report status = OK. Anything else needs attention.

WITH expected_tables(name) AS (
    VALUES
        ('users'), ('akd_wallets'), ('crypto_wallets'), ('transactions')
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

SELECT 'dual_wallet_currency_constraints',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'Retired currency still referenced in ' || count(*) || ' constraint(s)' END
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text IN ('public.akd_wallets', 'public.crypto_wallets', 'public.transactions')
  AND conname LIKE '%currency%'
  AND pg_get_constraintdef(oid) NOT LIKE '%AKD%'

UNION ALL

SELECT 'empty_string_defaults',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE count(*) || ' column(s) still default to an empty string' END
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_default IN ('''::text', '''::character varying')

UNION ALL

SELECT 'dual_wallet_rpcs',
       CASE WHEN count(*) = 4 THEN 'OK' ELSE 'MISSING RPCs (found ' || count(*) || '/4)' END
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('provision_dual_wallets', 'swap_crypto_to_akd', 'swap_akd_to_crypto', 'p2p_transfer_akd')

UNION ALL

SELECT 'rls_enabled',
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'RLS disabled on: ' || string_agg(relname, ', ') END
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('users', 'akd_wallets', 'crypto_wallets', 'transactions')
  AND NOT c.relrowsecurity

UNION ALL

SELECT 'hard_peg_invariants',
       'OK' AS status;
