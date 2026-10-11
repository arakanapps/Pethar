import { pgTable, serial, text, varchar, timestamp, numeric, uuid, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

// PeThar Core Ledger & Super App Tables
export const accountTypeEnum = pgEnum('account_type', ['user', 'merchant', 'system_pool', 'fee']);

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  accountNumber: varchar('account_number', { length: 32 }).notNull().unique(),
  currency: varchar('currency', { length: 8 }).default('AKD').notNull(),
  balance: numeric('balance', { precision: 18, scale: 4 }).default('0.0000').notNull(),
  type: accountTypeEnum('type').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderAccountId: uuid('sender_account_id').references(() => accounts.id),
  recipientAccountId: uuid('recipient_account_id').references(() => accounts.id),
  amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 8 }).default('AKD').notNull(),
  reference: text('reference'),
  type: varchar('type', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
