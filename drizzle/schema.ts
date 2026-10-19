import { pgTable, serial, text, varchar, timestamp, numeric, uuid, pgEnum, date } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).unique(),
  uid: varchar('uid', { length: 64 }).unique(),
  walletAddress: varchar('wallet_address', { length: 64 }),
  email: varchar('email', { length: 255 }).unique(),
  phoneNumber: varchar('phone_number', { length: 30 }).unique(),
  firstName: varchar('first_name', { length: 50 }).notNull().default('User'),
  lastName: varchar('last_name', { length: 50 }).notNull().default(''),
  fullName: varchar('full_name', { length: 100 }).notNull().default('User'),
  nickname: varchar('nickname', { length: 50 }).default(''),
  nationalIdNo: varchar('national_id_no', { length: 50 }).default(''),
  dob: date('dob'),
  address: text('address'),
  usdAccountWalletAddress: varchar('usd_account_wallet_address', { length: 64 }).notNull().default('0x36a8F492C109bE742819aBcD8391048291045f19'),
  pinHash: varchar('pin_hash', { length: 128 }).default(''),
  avatarUrl: text('avatar_url').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  username: varchar('username', { length: 50 }).notNull().default('@user'),
  uid: varchar('uid', { length: 64 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 64 }).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull().default(''),
  lastName: varchar('last_name', { length: 50 }).notNull().default(''),
  name: varchar('name', { length: 100 }).notNull().default('User'),
  nickname: varchar('nickname', { length: 50 }).default(''),
  email: varchar('email', { length: 255 }).notNull().default(''),
  phone: varchar('phone', { length: 30 }).notNull().default(''),
  pinHash: varchar('pin_hash', { length: 128 }).default(''),
  nationalIdNo: varchar('national_id_no', { length: 50 }).notNull().default(''),
  dob: date('dob'),
  address: text('address').notNull().default(''),
  usdAccountWalletAddress: varchar('usd_account_wallet_address', { length: 64 }).notNull().default('0x36a8F492C109bE742819aBcD8391048291045f19'),
  akId: varchar('ak_id', { length: 64 }),
  balance: numeric('balance', { precision: 18, scale: 4 }).default('0.00').notNull(),
  akdWalletBalance: numeric('akd_wallet_balance', { precision: 18, scale: 4 }).default('0.00').notNull(),
  usdAccountBalance: numeric('usd_account_balance', { precision: 18, scale: 4 }).default('0.00').notNull(),
  totalBalance: numeric('total_balance', { precision: 18, scale: 4 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 16 }).default('AKD').notNull(),
  avatarUrl: text('avatar_url').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// PeThar Core Ledger & Super App Tables
export const accountTypeEnum = pgEnum('account_type', ['user', 'merchant', 'system_pool', 'fee']);

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  accountNumber: varchar('account_number', { length: 32 }).notNull().unique(),
  currency: varchar('currency', { length: 8 }).default('AKD').notNull(),
  balance: numeric('balance', { precision: 18, scale: 4 }).default('0.00').notNull(),
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

