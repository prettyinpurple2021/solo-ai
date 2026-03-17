CREATE TABLE "data_subject_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text NOT NULL,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_consent" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text NOT NULL,
	"consent_type" text NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_approvals" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "device_approvals" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_api_keys" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_api_keys" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_mfa_settings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_mfa_settings" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ALTER COLUMN "assessment_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assessments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assessments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "competitor_reports" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "competitor_reports" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pivot_analyses" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pivot_analyses" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "search_index" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "search_index" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "calendar_connections" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "calendar_connections" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "social_media_connections" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "social_media_connections" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template_downloads" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "template_downloads" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template_downloads" ALTER COLUMN "template_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "workflow_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "template_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "achievement_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "traffic_logs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "traffic_logs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "traffic_logs" ALTER COLUMN "session_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consent" ADD CONSTRAINT "user_consent_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dsr_user_id_idx" ON "data_subject_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dsr_status_idx" ON "data_subject_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_consent_user_id_idx" ON "user_consent" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_consent_type_idx" ON "user_consent" USING btree ("consent_type");