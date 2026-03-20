-- Baseline tables previously created at request-time (MED-002).
-- Apply with your normal migration process (`npm run db:push` / drizzle migrate / manual SQL).

ALTER TABLE "push_subscriptions" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp;

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
