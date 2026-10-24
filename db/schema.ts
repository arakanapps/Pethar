import { pgTable, text, varchar, timestamp, numeric, uuid, pgEnum, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/**
 * ============================================================================
 * Péthar (ဖေ့သာ) — Dual-Wallet Database Schema (PostgreSQL / Drizzle ORM)
 * Hard Peg: 1.00 AKD = 1.00 USD (1.00 ₳ = $1.00)
 * Precision: NUMERIC(18, 2)
 *
 * Architecture:
 * 1. users: Primary authentication identity linked to Supabase Auth UUID.
 * 2. akd_wallets (Main Wallet): Arakan Dollar (AKD / ₳) ACID digital ledger.
 *    Enforces $0.00 gas fees and check constraint (balance >= 0.00).
 * 3. crypto_wallets (USD Crypto Gateway): Inbound on-chain stablecoins (USDT & USDC)
 *    with 1:1 in-app swaps to/from AKD using FOR UPDATE row-level locking.
 * 4. transactions: Append-only audit ledger recording P2P transfers, deposits,
 *    withdrawals, and 1:1 in-app swap events.
 * ============================================================================
 */

// ── Enums ──
export const userStatusEnum = pgEnum('user_status', ['pending_otp', 'active']);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'p2p_transfer',
  'deposit',
  'withdrawal',
  'swap_crypto_to_akd',
  'swap_akd_to_crypto',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'completed',
  'failed',
]);

// ── 1. Users Table ──
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // 1:1 link to Supabase Auth auth.users.id
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique(),
  status: userStatusEnum('status').default('pending_otp').notNull(),
  pinHash: varchar('pin_hash', { length: 128 }),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  fullName: varchar('full_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  phoneNumber: varchar('phone_number', { length: 30 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 2. AKD Wallets Table (Main Wallet: 1.00 AKD = 1.00 USD Hard Peg) ──
// Instant P2P transfers with $0.00 gas fees via SQL ACID transactions
export const akdWallets = pgTable(
  'akd_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 8 }).default('AKD').notNull(), // AKD / ₳
    balance: numeric('balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
    gasFeeRate: numeric('gas_fee_rate', { precision: 18, scale: 2 }).default('0.00').notNull(), // $0.00 gas fees
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('akd_balance_check', sql`${table.balance} >= 0.00`),
  ]
);

// ── 3. Crypto Wallets Table (USD Crypto Gateway: 1:1 Hard Peg) ──
// On-chain USDT/USDC stablecoin gateway with 1:1 in-app swaps via FOR UPDATE row locks
export const cryptoWallets = pgTable(
  'crypto_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    depositAddress: varchar('deposit_address', { length: 128 }).notNull().unique(), // generated EVM/Solana deposit address
    usdtBalance: numeric('usdt_balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
    usdcBalance: numeric('usdc_balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('usdt_balance_check', sql`${table.usdtBalance} >= 0.00`),
    check('usdc_balance_check', sql`${table.usdcBalance} >= 0.00`),
  ]
);

// ── 4. Transactions Table (Auditable Financial Ledger) ──
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  senderUserId: uuid('sender_user_id').references(() => users.id, { onDelete: 'set null' }),
  recipientUserId: uuid('recipient_user_id').references(() => users.id, { onDelete: 'set null' }),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 16 }).default('AKD').notNull(),
  fee: numeric('fee', { precision: 18, scale: 2 }).default('0.00').notNull(), // $0.00 for AKD internal transfers
  status: transactionStatusEnum('status').default('completed').notNull(),
  reference: text('reference'),
  blockchainTxHash: varchar('blockchain_tx_hash', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ──
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

// ── Inferred TypeScript Types ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AkdWallet = typeof akdWallets.$inferSelect;
export type NewAkdWallet = typeof akdWallets.$inferInsert;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type NewCryptoWallet = typeof cryptoWallets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
