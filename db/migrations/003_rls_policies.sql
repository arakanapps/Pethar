-- ============================================================================
-- PeThar (ဖေ့သာ) — Row Level Security (RLS) Migration
-- Revision: 003_rls_policies.sql
-- Target: PostgreSQL 14+ / Supabase
--
-- Security Guarantees:
--   1. RLS enabled on all application tables.
--   2. Users can only view and mutate their own profile and accounts.
--   3. Transactions and ledger entries visible strictly to participating account owners.
--   4. System accounts (Reserve, Fee, Suspense) readable by authenticated users for auditing.
--   5. Public FX rates readable by all authenticated/anonymous users.
--   6. Atomic ledger posting function secured with SECURITY DEFINER.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rate_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_signed_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cyber_defense_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. USERS POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "users_select_own"
    ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can insert their own profile on registration
CREATE POLICY "users_insert_own"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
    ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- 3. AGENTS POLICIES
-- ============================================================================

-- Active agents are discoverable by authenticated users for cash-in/cash-out
CREATE POLICY "agents_select_active"
    ON agents
    FOR SELECT
    TO authenticated
    USING (status = 'ACTIVE' OR user_id = auth.uid());

-- Agents can manage their own profile
CREATE POLICY "agents_insert_own"
    ON agents
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "agents_update_own"
    ON agents
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. ACCOUNTS POLICIES
-- ============================================================================

-- Users can view their own accounts
CREATE POLICY "accounts_select_own"
    ON accounts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- System accounts (user_id IS NULL) are readable by authenticated users
CREATE POLICY "accounts_select_system"
    ON accounts
    FOR SELECT
    TO authenticated
    USING (user_id IS NULL);

-- Users can create accounts for themselves
CREATE POLICY "accounts_insert_own"
    ON accounts
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own accounts
CREATE POLICY "accounts_update_own"
    ON accounts
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 5. TRANSACTIONS POLICIES
-- ============================================================================

-- Transactions are visible only to participants (users holding participating accounts)
CREATE POLICY "transactions_select_participants"
    ON transactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM ledger_entries le
            JOIN accounts a ON a.id = le.account_id
            WHERE le.transaction_id = transactions.id
              AND a.user_id = auth.uid()
        )
    );

-- Authenticated users can insert transactions (settled via post_transaction RPC)
CREATE POLICY "transactions_insert_authenticated"
    ON transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 6. LEDGER ENTRIES POLICIES
-- ============================================================================

-- Ledger entries are readable if the user owns the underlying account
CREATE POLICY "ledger_entries_select_own_account"
    ON ledger_entries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM accounts a
            WHERE a.id = ledger_entries.account_id
              AND a.user_id = auth.uid()
        )
    );

-- System account ledger entries readable by authenticated users for audit transparency
CREATE POLICY "ledger_entries_select_system_account"
    ON ledger_entries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM accounts a
            WHERE a.id = ledger_entries.account_id
              AND a.user_id IS NULL
        )
    );

-- Direct ledger inserts/updates are forbidden for client roles;
-- insertions must proceed exclusively through post_transaction() RPC.

-- ============================================================================
-- 7. OTP CHALLENGES POLICIES
-- ============================================================================

CREATE POLICY "otp_challenges_select_own"
    ON otp_challenges
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "otp_challenges_insert_own"
    ON otp_challenges
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "otp_challenges_update_own"
    ON otp_challenges
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 8. OFFLINE VOUCHERS POLICIES
-- ============================================================================

-- Vouchers visible to issuing account owner or redeeming agent
CREATE POLICY "offline_vouchers_select"
    ON offline_vouchers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM accounts a
            WHERE a.id = offline_vouchers.owner_account_id
              AND a.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM agents ag
            WHERE ag.id = offline_vouchers.agent_id
              AND ag.user_id = auth.uid()
        )
    );

CREATE POLICY "offline_vouchers_insert_owner"
    ON offline_vouchers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM accounts a
            WHERE a.id = offline_vouchers.owner_account_id
              AND a.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. POS TERMINALS POLICIES
-- ============================================================================

-- Merchants can view and manage their own terminals
CREATE POLICY "pos_terminals_merchant_manage"
    ON pos_terminals
    FOR ALL
    TO authenticated
    USING (merchant_user_id = auth.uid())
    WITH CHECK (merchant_user_id = auth.uid());

-- Active POS terminals can be looked up by customers at checkout
CREATE POLICY "pos_terminals_select_active"
    ON pos_terminals
    FOR SELECT
    TO authenticated
    USING (status = 'ACTIVE');

-- ============================================================================
-- 10. FX RATES POLICIES
-- ============================================================================

-- Exchange rates are public read-only for all clients
CREATE POLICY "fx_rates_select_all"
    ON fx_rates
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "fx_rate_board_select_all"
    ON fx_rate_board
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================================================
-- 11. OFFLINE SIGNED VOUCHERS POLICIES
-- ============================================================================

CREATE POLICY "offline_signed_vouchers_select"
    ON offline_signed_vouchers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM accounts a
            WHERE a.id = offline_signed_vouchers.issuer_account_id
              AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "offline_signed_vouchers_insert"
    ON offline_signed_vouchers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM accounts a
            WHERE a.id = offline_signed_vouchers.issuer_account_id
              AND a.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 12. CYBER DEFENSE EVENTS POLICIES
-- ============================================================================

-- Authenticated clients and services can report threat defense events
CREATE POLICY "cyber_defense_insert"
    ON cyber_defense_events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 13. POST TRANSACTION RPC SECURITY CONFIGURATION
-- ============================================================================

-- Make post_transaction run as SECURITY DEFINER to bypass table RLS during atomic posting
ALTER FUNCTION post_transaction(VARCHAR, VARCHAR, JSONB, JSONB) SECURITY DEFINER;
ALTER FUNCTION post_transaction(VARCHAR, VARCHAR, JSONB, JSONB) SET search_path = public;

GRANT EXECUTE ON FUNCTION post_transaction(VARCHAR, VARCHAR, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION post_transaction(VARCHAR, VARCHAR, JSONB, JSONB) TO service_role;

COMMIT;
