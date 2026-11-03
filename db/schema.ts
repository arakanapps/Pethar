import {
  pgTable,
  text,
  varchar,
  timestamp,
  numeric,
  uuid,
  bigint,
  jsonb,
  integer,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/**
 * ============================================================================
 * Péthar (ဖေ့သာ) — Unified Production Database Schema (PostgreSQL / Drizzle ORM)
 * Hard Peg: 1.00 AKD = 1.00 USD (1.00 ₳ = $1.00)
 * Precision: NUMERIC(28, 8) double-entry ledger & NUMERIC(18, 2) consumer views
 * ============================================================================
 */

// ── 1. Users Table (auth.users linkage) ──
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique(),
  status: varchar('status', { length: 30 }).default('ACTIVE').notNull(),
  pinHash: varchar('pin_hash', { length: 128 }),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  fullName: varchar('full_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  phoneNumber: varchar('phone_number', { length: 30 }).unique(),
  uid: varchar('uid', { length: 32 }).unique(),
  kycTier: integer('kyc_tier').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 2. User Profiles Table ──
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 50 }).unique().notNull(),
  uid: varchar('uid', { length: 32 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 30 }),
  nationalIdNo: varchar('national_id_no', { length: 64 }),
  address: text('address'),
  usdAccountWalletAddress: varchar('usd_account_wallet_address', { length: 128 }),
  pinHash: varchar('pin_hash', { length: 128 }),
  balance: numeric('balance', { precision: 28, scale: 8 }).default('0').notNull(),
  usdAccountBalance: numeric('usd_account_balance', { precision: 28, scale: 8 }).default('0').notNull(),
  kycTier: integer('kyc_tier').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 3. Accounts Table (Double-Entry Ledger Chart of Accounts) ──
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  accountType: varchar('account_type', { length: 30 }).notNull(), // USER_WALLET, RESERVE_VAULT, FEE_POOL, etc.
  currency: varchar('currency', { length: 16 }).notNull(), // AKD, USD, USDC, USDT
  status: varchar('status', { length: 20 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 4. Ledger Entries Table (Strict Double-Entry Append-Only Journal) ──
export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  amount: numeric('amount', { precision: 28, scale: 8 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 28, scale: 8 }).notNull(),
  seq: bigint('seq', { mode: 'number' }).notNull(),
  txId: varchar('tx_id', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 5. Transactions Table ──
export const transactions = pgTable('transactions', {
  id: varchar('id', { length: 64 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  referenceId: varchar('reference_id', { length: 64 }),
  refId: varchar('ref_id', { length: 64 }),
  transactionType: varchar('transaction_type', { length: 32 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  senderUserId: uuid('sender_user_id').references(() => users.id, { onDelete: 'set null' }),
  recipientUserId: uuid('recipient_user_id').references(() => users.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 32 }),
  amount: numeric('amount', { precision: 28, scale: 8 }),
  currency: varchar('currency', { length: 16 }).default('AKD'),
  fee: numeric('fee', { precision: 18, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 30 }).default('completed').notNull(),
  reference: text('reference'),
  blockchainTxHash: varchar('blockchain_tx_hash', { length: 128 }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 6. Transfer Idempotency Table ──
export const transferIdempotency = pgTable('transfer_idempotency', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  idempotencyKey: varchar('idempotency_key', { length: 64 }).unique().notNull(),
  requestHash: varchar('request_hash', { length: 64 }).notNull(),
  responsePayload: jsonb('response_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── 7. Pending Approvals Table (KYC Upgrades & Administrative Actions) ──
export const pendingApprovals = pgTable('pending_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 64 }).notNull(), // KYC_UPGRADE, etc.
  payload: jsonb('payload').default({}).notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

// ── 8. Dual-Wallet Extensions (Compatible Views) ──
export const akdWallets = pgTable(
  'akd_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 8 }).default('AKD').notNull(),
    balance: numeric('balance', { precision: 18, scale: 2 }).default('0.00').notNull(),
    gasFeeRate: numeric('gas_fee_rate', { precision: 18, scale: 2 }).default('0.00').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('akd_balance_check', sql`${table.balance} >= 0.00`),
  ]
);

export const cryptoWallets = pgTable(
  'crypto_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    depositAddress: varchar('deposit_address', { length: 128 }).unique(),
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

// ── Relations ──
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  akdWallet: one(akdWallets, {
    fields: [users.id],
    references: [akdWallets.userId],
  }),
  cryptoWallet: one(cryptoWallets, {
    fields: [users.id],
    references: [cryptoWallets.userId],
  }),
  accounts: many(accounts),
  idempotencyRecords: many(transferIdempotency),
  pendingApprovals: many(pendingApprovals),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  ledgerEntries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  account: one(accounts, {
    fields: [ledgerEntries.accountId],
    references: [accounts.id],
  }),
}));

// ── Inferred TypeScript Types ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransferIdempotency = typeof transferIdempotency.$inferSelect;
export type NewTransferIdempotency = typeof transferIdempotency.$inferInsert;
export type PendingApproval = typeof pendingApprovals.$inferSelect;
export type NewPendingApproval = typeof pendingApprovals.$inferInsert;
export type AkdWallet = typeof akdWallets.$inferSelect;
export type NewAkdWallet = typeof akdWallets.$inferInsert;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type NewCryptoWallet = typeof cryptoWallets.$inferInsert;
