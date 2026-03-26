-- Baseline tables for API routes (MED-002). Safe to re-run (IF NOT EXISTS / IF NOT EXISTS columns).
--
-- EASIEST (from your laptop, same folder as the app):
--   npm run db:apply-api-baseline
--   Uses DATABASE_URL from .env.local or .env — no Neon copy/paste needed.
--
-- ALTERNATIVE — Neon SQL Editor:
-- 1. Open Neon dashboard → your project → SQL Editor.
-- 2. Paste this ENTIRE file and click Run once.
--    If Neon shows "can't compose", use plain SQL mode or run blocks one at a time.
--
-- If you get errors about "users" table missing, run your full app migrations first
-- (migrations/0000_*.sql through 0002_*.sql) or `npm run db:push` with DATABASE_URL set.

-- 1) push_subscriptions: create if missing (your DB had no table yet, so ALTER alone failed).
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()::text),
	"user_id" text NOT NULL,
	"endpoint" varchar(1000) NOT NULL,
	"p256dh_key" varchar(500) NOT NULL,
	"auth_key" varchar(500) NOT NULL,
	"device_info" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 2) Older DBs that already had push_subscriptions without last_used_at:
ALTER TABLE "push_subscriptions" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp;

-- 3) Optional: link to users when that table exists (skips if already added).
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'users'
	) AND NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'push_subscriptions_user_id_users_id_fk'
	) THEN
		ALTER TABLE "push_subscriptions"
			ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
	END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_unique" ON "push_subscriptions" ("endpoint");

CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"sent_by" varchar(255),
	"title" text,
	"body" text,
	"target_count" integer,
	"success_count" integer,
	"error_count" integer,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "exit_intent_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"role" varchar(120),
	"goal" text,
	"blocker" text,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_survey_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"survey_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_survey_status_user_id_survey_type_key" ON "user_survey_status" ("user_id", "survey_type");

-- 4) user_preferences: required by /api/preferences (production-safe; no runtime DDL).
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" text PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()::text),
	"user_id" text NOT NULL,
	"preference_key" text NOT NULL,
	"preference_value" jsonb NOT NULL DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Optional: link to users when that table exists (skips if already added).
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'users'
	) AND NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_user_id_users_id_fk'
	) THEN
		ALTER TABLE "user_preferences"
			ADD CONSTRAINT "user_preferences_user_id_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
	END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_user_id_preference_key_key"
	ON "user_preferences" ("user_id", "preference_key");

-- 5) traffic_logs: required by TrafficService analytics logging middleware.
CREATE TABLE IF NOT EXISTS "traffic_logs" (
	"id" text PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()::text),
	"session_id" text NOT NULL,
	"user_id" text,
	"url" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);

-- Optional: link to users when that table exists (skips if already added).
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'users'
	) AND NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'traffic_logs_user_id_users_id_fk'
	) THEN
		ALTER TABLE "traffic_logs"
			ADD CONSTRAINT "traffic_logs_user_id_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS "traffic_logs_session_id_idx" ON "traffic_logs" USING btree ("session_id");
CREATE INDEX IF NOT EXISTS "traffic_logs_user_id_idx" ON "traffic_logs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "traffic_logs_timestamp_idx" ON "traffic_logs" USING btree ("timestamp");
