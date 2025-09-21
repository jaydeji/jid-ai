DROP INDEX "email_idx";--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "input_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "output_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "total_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "input_cost" numeric(15, 9) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "output_cost" numeric(15, 9) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "total_cost" numeric(15, 9) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "input_cost" numeric(15, 9) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ai_credits_cents";