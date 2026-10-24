import { pgTable, text, varchar, timestamp, numeric, uuid, pgEnum, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (Strictly Consumer Online Dual-Wallet & 1:1 Swaps)
// NOTE: Deleted and purged all dynamic fx_rates, conversion_spreads, source_currency,
// and legacy offline enum options:
// - 'agent_cashout' (PURGED: offline agent counter withdrawals retired)
// - 'counter_withdrawal' (PURGED: physical agent cashier endpoints retired)
// - dynamic fx / spread / oracle tables & enums (PURGED: replaced with 1:1 hard peg)
// ─────────────────────────────────────────────────────────────────────────────
export const userStatusEnum = pgEnum('user_status', ['pending_otp', 'active']);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'p2p_transfer',
  'deposit',
  'withdrawal',
  'swap_crypto_to_akd',
  'swap_akd_to_crypto',
  // DEPRECATED & PURGED ENUMS:
  // 'agent_cashout',
  // 'counter_withdrawal',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'completed',
  'failed',
]);

// ─────────────────────────────────────────────────────────────────────────────
// 1. USERS TABLE (Linked to Supabase Auth auth.users.id)
// NOTE: Deleted and commented out legacy merchant/agent relational columns:
// - merchant_id (PURGED: enterprise store profiles isolated)
// - agent_id (PURGED: agent hubs isolated)
// ─────────────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Linked 1:1 to Supabase Auth UUID
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique(),
  status: userStatusEnum('status').default('pending_otp').notNull(),
  pinHash: varchar('pin_hash', { length: 128 }),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  fullName: varchar('full_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  phoneNumber: varchar('phone_number', { length: 30 }).unique(),
  // DEPRECATED & PURGED RELATIONAL COLUMNS:
  // merchantId: uuid('merchant_id'),
  // agentId: uuid('agent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AKD WALLETS TABLE (Main Wallet: Local Internal Digital Ledger)
// 1:1 relation with users.id, AKD / ₳ currency, numeric(18,2), check balance >= 0
// Relational SQL ACID ledger with $0.00 gas fees
// NOTE: Deleted and commented out:
// - escrow_lock_balance (PURGED: offline multi-sig agent escrow locks retired)
// ─────────────────────────────────────────────────────────────────────────────
export const akdWallets = pgTable('akd_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  currency: varchar('currency', { length: 8 }).default('AKD').notNull(), // AKD / ₳
  balance: numeric('balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
  gasFeeRate: numeric('gas_fee_rate', { precision: 18, scale: 2 }).default('0.00').notNull(), // $0.00 gas fees
  // DEPRECATED & PURGED COLUMNS:
  // escrowLockBalance: numeric('escrow_lock_balance', { precision: 18, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('akd_balance_check', sql`${table.balance} >= 0`),
]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. CRYPTO WALLETS TABLE (USD Gateway: On-Chain Stablecoin Balances)
// 1:1 relation with users.id, USDT and USDC balances, generated public deposit address
// ─────────────────────────────────────────────────────────────────────────────
export const cryptoWallets = pgTable('crypto_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  depositAddress: varchar('deposit_address', { length: 128 }).notNull().unique(), // generated public blockchain deposit address
  usdtBalance: numeric('usdt_balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
  usdcBalance: numeric('usdc_balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('usdt_balance_check', sql`${table.usdtBalance} >= 0`),
  check('usdc_balance_check', sql`${table.usdcBalance} >= 0`),
]);

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRANSACTIONS TABLE
// Records P2P internal transfers, external deposits/withdrawals,
// and 1:1 in-app swap events (swap_crypto_to_akd or swap_akd_to_crypto)
// NOTE: Deleted and commented out legacy merchant/agent fields:
// - merchant_id
// - agent_id
// ─────────────────────────────────────────────────────────────────────────────
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  senderUserId: uuid('sender_user_id').references(() => users.id),
  recipientUserId: uuid('recipient_user_id').references(() => users.id),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 16 }).default('AKD').notNull(),
  fee: numeric('fee', { precision: 18, scale: 2 }).default('0.00').notNull(), // $0.00 for AKD internal transfers
  status: transactionStatusEnum('status').default('completed').notNull(),
  reference: text('reference'),
  blockchainTxHash: varchar('blockchain_tx_hash', { length: 128 }),
  // DEPRECATED & PURGED COLUMNS:
  // merchantId: uuid('merchant_id'),
  // agentId: uuid('agent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  akdWallet: one(akdWallets, {
    fields: [users.id],
    references: [akdWallets.userId],
  }),
  cryptoWallet: one(cryptoWallets, {
    fields: [users.id],
    references: [cryptoWallets.userId],
  }),
  transactions: many(transactions),
}));

export const akdWalletsRelations = relations(akdWallets, ({ one }) => ({
  user: one(users, {
    fields: [akdWallets.userId],
    references: [users.id],
  }),
}));

export const cryptoWalletsRelations = relations(cryptoWallets, ({ one }) => ({
  user: one(users, {
    fields: [cryptoWallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  sender: one(users, {
    fields: [transactions.senderUserId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [transactions.recipientUserId],
    references: [users.id],
  }),
}));

// Export Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AkdWallet = typeof akdWallets.$inferSelect;
export type NewAkdWallet = typeof akdWallets.$inferInsert;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type NewCryptoWallet = typeof cryptoWallets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
