CREATE TABLE "scraping_job_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scraping_job_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" varchar(255) NOT NULL,
	"success" boolean NOT NULL,
	"data" jsonb,
	"error" text,
	"execution_time" integer NOT NULL,
	"changes_detected" boolean DEFAULT false NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scraping_jobs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"competitor_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"frequency_type" varchar(20) DEFAULT 'interval' NOT NULL,
	"frequency_value" varchar(100) NOT NULL,
	"frequency_timezone" varchar(50),
	"next_run_at" timestamp NOT NULL,
	"last_run_at" timestamp,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "competitor_alerts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "competitor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "intelligence_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "competitor_profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "intelligence_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "competitor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "productivity_insights" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "task_analytics" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "task_categories" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "scraping_job_results" ADD CONSTRAINT "scraping_job_results_job_id_scraping_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scraping_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scraping_job_results_job_id_idx" ON "scraping_job_results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "scraping_job_results_success_idx" ON "scraping_job_results" USING btree ("success");--> statement-breakpoint
CREATE INDEX "scraping_job_results_completed_at_idx" ON "scraping_job_results" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "scraping_jobs_competitor_id_idx" ON "scraping_jobs" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "scraping_jobs_user_id_idx" ON "scraping_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scraping_jobs_status_idx" ON "scraping_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scraping_jobs_priority_idx" ON "scraping_jobs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "scraping_jobs_next_run_at_idx" ON "scraping_jobs" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "scraping_jobs_job_type_idx" ON "scraping_jobs" USING btree ("job_type");