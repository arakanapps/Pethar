CREATE TYPE "public"."account_type" AS ENUM('user', 'merchant', 'system_pool', 'fee');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"account_number" varchar(32) NOT NULL,
	"currency" varchar(8) DEFAULT 'AKD' NOT NULL,
	"balance" numeric(18, 4) DEFAULT '0.0000' NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"phone" varchar(256)
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_account_id_accounts_id_fk" FOREIGN KEY ("sender_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_account_id_accounts_id_fk" FOREIGN KEY ("recipient_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;