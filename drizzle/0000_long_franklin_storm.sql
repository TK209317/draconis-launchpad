CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"transaction_hash" text NOT NULL,
	"contract_name" text NOT NULL,
	"type" text NOT NULL,
	"chain_id" integer NOT NULL,
	"network_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"owner_address" text NOT NULL,
	CONSTRAINT "contracts_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"nonce" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_owner_address_users_wallet_address_fk" FOREIGN KEY ("owner_address") REFERENCES "public"."users"("wallet_address") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_idx" ON "users" USING btree ("wallet_address");