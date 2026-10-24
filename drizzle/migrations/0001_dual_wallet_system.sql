CREATE TYPE "public"."user_status" AS ENUM('pending_otp', 'active');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('p2p_transfer', 'deposit', 'withdrawal', 'swap_crypto_to_akd', 'swap_akd_to_crypto');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "akd_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency" varchar(8) DEFAULT 'AKD' NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0.00' NOT NULL,
	"gas_fee_rate" numeric(18, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "akd_wallets_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "akd_balance_check" CHECK ("akd_wallets"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crypto_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"deposit_address" varchar(128) NOT NULL,
	"usdt_balance" numeric(18, 2) DEFAULT '0.00' NOT NULL,
	"usdc_balance" numeric(18, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crypto_wallets_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "crypto_wallets_deposit_address_unique" UNIQUE("deposit_address"),
	CONSTRAINT "usdt_balance_check" CHECK ("crypto_wallets"."usdt_balance" >= 0),
	CONSTRAINT "usdc_balance_check" CHECK ("crypto_wallets"."usdc_balance" >= 0)
);
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_sender_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_recipient_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "sender_user_id" uuid;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "recipient_user_id" uuid;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "fee" numeric(18, 2) DEFAULT '0.00' NOT NULL;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "blockchain_tx_hash" varchar(128);
--> statement-breakpoint
ALTER TABLE "akd_wallets" ADD CONSTRAINT "akd_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
