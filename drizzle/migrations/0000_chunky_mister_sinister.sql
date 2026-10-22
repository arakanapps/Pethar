CREATE TYPE "public"."account_type" AS ENUM('user', 'merchant', 'system_pool', 'fee');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"account_number" varchar(32) NOT NULL,
	"currency" varchar(8) DEFAULT 'AKD' NOT NULL,
	"balance" numeric(18, 4) DEFAULT '0.00' NOT NULL,
	"type" "account_type" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_account_id" uuid,
	"recipient_account_id" uuid,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(8) DEFAULT 'AKD' NOT NULL,
	"reference" text,
	"type" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) UNIQUE,
	"uid" varchar(64) UNIQUE,
	"wallet_address" varchar(64),
	"email" varchar(255) UNIQUE,
	"phone_number" varchar(30) UNIQUE,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"full_name" varchar(100),
	"nickname" varchar(50),
	"national_id_no" varchar(50),
	"dob" date,
	"address" text,
	"usd_account_wallet_address" varchar(64),
	"pin_hash" varchar(128),
	"avatar_url" text,
	"kyc_tier" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"username" varchar(50),
	"uid" varchar(64) NOT NULL,
	"wallet_address" varchar(64) NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"name" varchar(100),
	"nickname" varchar(50),
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"pin_hash" varchar(128),
	"national_id_no" varchar(50),
	"dob" date,
	"address" text,
	"usd_account_wallet_address" varchar(64),
	"balance" numeric(18, 4) DEFAULT '0.00' NOT NULL,
	"usd_account_balance" numeric(18, 4) DEFAULT '0.00' NOT NULL,
	"total_balance" numeric(18, 4) DEFAULT '0.00' NOT NULL,
	"currency" varchar(16) DEFAULT 'AKD' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_account_id_accounts_id_fk" FOREIGN KEY ("sender_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_account_id_accounts_id_fk" FOREIGN KEY ("recipient_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;