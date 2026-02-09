ALTER TABLE "contracts" ADD COLUMN "is_verified" text DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "verified_at" timestamp;