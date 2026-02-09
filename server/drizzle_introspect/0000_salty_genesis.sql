-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."feedback_status" AS ENUM('pending', 'in_progress', 'resolved', 'closed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('bug', 'feature_request', 'comment', 'error', 'other');--> statement-breakpoint
CREATE SEQUENCE "public"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "scraping_job_results" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
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
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"title" text,
	"message" text NOT NULL,
	"browser_info" jsonb,
	"screenshot_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"schedule" jsonb,
	"is_favorite" boolean DEFAULT false,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"emoji" varchar(10) DEFAULT '🏆',
	"participants_count" integer DEFAULT 0,
	"deadline" timestamp,
	"reward_points" integer DEFAULT 0,
	"reward_badge" varchar(100),
	"difficulty" varchar(20) DEFAULT 'medium',
	"category" varchar(50) DEFAULT 'general',
	"created_by" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'joined',
	"progress" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "achievements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"points" integer DEFAULT 0,
	"category" varchar(100),
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analytics_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"event" varchar(100) NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now(),
	"session_id" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "briefcases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'active',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_connections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "calendar_connections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"provider" varchar(50) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"email" varchar(255),
	"name" varchar(255),
	"is_active" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"last_message" text,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"conversation_id" varchar(255) NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitive_opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"competitor_id" text NOT NULL,
	"intelligence_id" text,
	"opportunity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"impact" varchar(20) NOT NULL,
	"effort" varchar(20) NOT NULL,
	"timing" varchar(20) NOT NULL,
	"priority_score" numeric(5, 2) NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'identified',
	"assigned_to" text,
	"implementation_notes" text,
	"roi_estimate" numeric(10, 2),
	"actual_roi" numeric(10, 2),
	"success_metrics" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_archived" boolean DEFAULT false,
	"detected_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"website" varchar(500),
	"description" text,
	"strengths" jsonb DEFAULT '[]'::jsonb,
	"weaknesses" jsonb DEFAULT '[]'::jsonb,
	"opportunities" jsonb DEFAULT '[]'::jsonb,
	"threats" jsonb DEFAULT '[]'::jsonb,
	"market_position" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_approvals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_approvals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"device_fingerprint" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"device_type" varchar(50),
	"ip_address" varchar(45),
	"user_agent" text,
	"is_approved" boolean DEFAULT false,
	"approved_at" timestamp,
	"approved_by" varchar(255),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"file_url" varchar(1000),
	"category" varchar(100) DEFAULT 'uncategorized',
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ai_insights" jsonb DEFAULT '{}'::jsonb,
	"is_favorite" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#8B5CF6',
	"icon" varchar(50),
	"is_default" boolean DEFAULT false,
	"file_count" integer DEFAULT 0,
	"total_size" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"user_id" text,
	"email" varchar(255),
	"role" varchar(20) DEFAULT 'viewer' NOT NULL,
	"granted_by" text NOT NULL,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "document_share_links" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"created_by" text NOT NULL,
	"url" varchar(1000) NOT NULL,
	"password_hash" varchar(255),
	"permissions" varchar(20) DEFAULT 'view' NOT NULL,
	"expires_at" timestamp,
	"max_access_count" integer,
	"access_count" integer DEFAULT 0,
	"download_enabled" boolean DEFAULT true,
	"require_auth" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"change_summary" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"file_url" varchar(2048) NOT NULL,
	"storage_provider" varchar(50),
	"checksum" varchar(128)
);
--> statement-breakpoint
CREATE TABLE "competitor_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"description" text,
	"industry" varchar(100),
	"headquarters" varchar(255),
	"founded_year" integer,
	"employee_count" integer,
	"funding_amount" numeric(15, 2),
	"funding_stage" varchar(50),
	"threat_level" varchar(20) DEFAULT 'medium' NOT NULL,
	"monitoring_status" varchar(20) DEFAULT 'active' NOT NULL,
	"social_media_handles" jsonb DEFAULT '{}'::jsonb,
	"key_personnel" jsonb DEFAULT '[]'::jsonb,
	"products" jsonb DEFAULT '[]'::jsonb,
	"market_position" jsonb DEFAULT '{}'::jsonb,
	"competitive_advantages" jsonb DEFAULT '[]'::jsonb,
	"vulnerabilities" jsonb DEFAULT '[]'::jsonb,
	"monitoring_config" jsonb DEFAULT '{}'::jsonb,
	"last_analyzed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_url" varchar(1000),
	"source_type" varchar(50) NOT NULL,
	"importance" varchar(20) DEFAULT 'medium' NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.00',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"detected_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"competitor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"intelligence_id" text,
	"alert_type" varchar(100) NOT NULL,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_data" jsonb DEFAULT '{}'::jsonb,
	"action_items" jsonb DEFAULT '[]'::jsonb,
	"recommended_actions" jsonb DEFAULT '[]'::jsonb,
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"duration_minutes" integer DEFAULT 15,
	"path_id" text NOT NULL,
	"module_type" varchar(50) DEFAULT 'article',
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'medium',
	"estimated_effort_hours" integer,
	"actual_effort_hours" integer,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"expected_outcome" text,
	"actual_outcome" text,
	"status" varchar(50) DEFAULT 'pending',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notification_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"icon" varchar(500),
	"badge" varchar(500),
	"image" varchar(500),
	"tag" varchar(100),
	"require_interaction" boolean DEFAULT false,
	"silent" boolean DEFAULT false,
	"vibrate" jsonb,
	"user_ids" jsonb DEFAULT '[]'::jsonb,
	"all_users" boolean DEFAULT false,
	"scheduled_time" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(255),
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"status" varchar(50) DEFAULT 'pending',
	"error" text,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "opportunity_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"baseline_value" numeric(15, 4),
	"target_value" numeric(15, 4),
	"current_value" numeric(15, 4),
	"unit" varchar(50),
	"measurement_date" timestamp DEFAULT now(),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "password_reset_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payment_provider_connections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_provider_connections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"provider" varchar(50) NOT NULL,
	"account_id" varchar(255),
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"account_email" varchar(255),
	"account_name" varchar(255),
	"webhook_secret" text,
	"is_active" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"image" varchar(1000),
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"shares_count" integer DEFAULT 0,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"achievement_context" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "intelligence_data" (
	"id" text PRIMARY KEY NOT NULL,
	"competitor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_url" varchar(1000),
	"data_type" varchar(100) NOT NULL,
	"raw_content" jsonb,
	"extracted_data" jsonb DEFAULT '{}'::jsonb,
	"analysis_results" jsonb DEFAULT '[]'::jsonb,
	"confidence" numeric(3, 2) DEFAULT '0.00',
	"importance" varchar(20) DEFAULT 'medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"collected_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"briefcase_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 0,
	"task_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"end_time" timestamp,
	"status" varchar(50) DEFAULT 'completed',
	"xp_earned" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"endpoint" varchar(1000) NOT NULL,
	"p256dh_key" varchar(500) NOT NULL,
	"auth_key" varchar(500) NOT NULL,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scraping_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"competitor_id" text NOT NULL,
	"user_id" text NOT NULL,
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
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_media_connections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "social_media_connections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"platform" varchar(50) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"token_secret" text,
	"account_id" varchar(255),
	"account_handle" varchar(255),
	"account_email" varchar(255),
	"account_name" varchar(255),
	"scopes" text,
	"is_active" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "task_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#8B5CF6',
	"icon" varchar(50),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "productivity_insights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"metrics" jsonb NOT NULL,
	"ai_recommendations" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_downloads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "template_downloads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"template_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"downloaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_achievements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"achievement_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_api_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"service" varchar(100) NOT NULL,
	"key_value" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_brand_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_brand_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"company_name" varchar(255),
	"tagline" varchar(500),
	"description" text,
	"industry" varchar(100),
	"target_audience" text,
	"brand_personality" jsonb DEFAULT '[]'::jsonb,
	"color_palette" jsonb DEFAULT '{}'::jsonb,
	"typography" jsonb DEFAULT '{}'::jsonb,
	"logo_url" varchar(1000),
	"logo_prompt" text,
	"moodboard" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_brand_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_competitive_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"competitors_monitored" integer DEFAULT 0,
	"intelligence_gathered" integer DEFAULT 0,
	"alerts_processed" integer DEFAULT 0,
	"opportunities_identified" integer DEFAULT 0,
	"competitive_tasks_completed" integer DEFAULT 0,
	"market_victories" integer DEFAULT 0,
	"threat_responses" integer DEFAULT 0,
	"intelligence_streaks" integer DEFAULT 0,
	"competitive_advantage_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_mfa_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_mfa_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"totp_secret" varchar(255),
	"totp_enabled" boolean DEFAULT false,
	"totp_backup_codes" jsonb DEFAULT '[]'::jsonb,
	"webauthn_enabled" boolean DEFAULT false,
	"webauthn_credentials" jsonb DEFAULT '[]'::jsonb,
	"recovery_codes" jsonb DEFAULT '[]'::jsonb,
	"mfa_required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_mfa_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar(100),
	"tier" varchar(20) DEFAULT 'Free',
	"estimated_minutes" integer,
	"difficulty" varchar(20) DEFAULT 'Beginner',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"is_premium" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"template_slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"goal_id" text,
	"briefcase_id" text,
	"parent_task_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"category" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"due_date" timestamp,
	"estimated_minutes" integer,
	"actual_minutes" integer,
	"energy_level" varchar(20) DEFAULT 'medium',
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" jsonb,
	"ai_suggestions" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflow_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) DEFAULT 'general',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"workflow_data" jsonb NOT NULL,
	"is_public" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"created_by" varchar(255),
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"username" text,
	"full_name" text,
	"role" text DEFAULT 'user' NOT NULL,
	"xp" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"total_actions" integer DEFAULT 0,
	"suspended" boolean DEFAULT false,
	"suspended_at" timestamp,
	"suspended_reason" text,
	"stripe_customer_id" text,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"subscription_status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"stripe_subscription_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"date_of_birth" timestamp,
	"is_verified" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"bio" text,
	"admin_pin_hash" text,
	"stack_user_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"refresh_token" varchar(500) NOT NULL,
	"device_fingerprint" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"device_type" varchar(50),
	"ip_address" varchar(45),
	"user_agent" text,
	"is_remember_me" boolean DEFAULT false,
	"remember_me_expires_at" timestamp,
	"last_activity" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflows_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(50) DEFAULT '1.0.0',
	"status" varchar(50) DEFAULT 'draft',
	"trigger_type" varchar(100) NOT NULL,
	"trigger_config" jsonb DEFAULT '{}'::jsonb,
	"nodes" jsonb DEFAULT '[]'::jsonb,
	"edges" jsonb DEFAULT '[]'::jsonb,
	"variables" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"category" varchar(100) DEFAULT 'general',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"template_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflow_executions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workflow_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(50) DEFAULT 'running',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration" integer,
	"input" jsonb DEFAULT '{}'::jsonb,
	"output" jsonb DEFAULT '{}'::jsonb,
	"variables" jsonb DEFAULT '{}'::jsonb,
	"options" jsonb DEFAULT '{}'::jsonb,
	"error" jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_by" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"goal" text NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"configuration" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_checkpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"state" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"from_agent_id" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar(50) DEFAULT 'text',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_learning_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"status" varchar(50) DEFAULT 'not_started',
	"completed_at" timestamp,
	"last_accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mood_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"energy_level" integer NOT NULL,
	"mood_label" varchar(50),
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "energy_check" CHECK ((energy_level >= 1) AND (energy_level <= 5))
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"is_solution" boolean DEFAULT false,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "community_topics_name_unique" UNIQUE("name"),
	CONSTRAINT "community_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_survey_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"survey_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_survey_status_user_id_survey_type_key" UNIQUE("user_id","survey_type")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "comment_likes_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(20) DEFAULT 'like' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_reactions_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("credentialID","userId"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
ALTER TABLE "scraping_job_results" ADD CONSTRAINT "scraping_job_results_job_id_scraping_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scraping_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefcases" ADD CONSTRAINT "briefcases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_approvals" ADD CONSTRAINT "device_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_approvals" ADD CONSTRAINT "device_approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_document_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_parent_id_document_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_share_links" ADD CONSTRAINT "document_share_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_share_links" ADD CONSTRAINT "document_share_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ADD CONSTRAINT "competitor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_activities" ADD CONSTRAINT "competitor_activities_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_activities" ADD CONSTRAINT "competitor_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_intelligence_id_intelligence_data_id_fk" FOREIGN KEY ("intelligence_id") REFERENCES "public"."intelligence_data"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ADD CONSTRAINT "opportunity_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ADD CONSTRAINT "opportunity_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ADD CONSTRAINT "payment_provider_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_connections" ADD CONSTRAINT "social_media_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productivity_insights" ADD CONSTRAINT "productivity_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_template_id_workflow_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ADD CONSTRAINT "user_brand_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ADD CONSTRAINT "user_competitive_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_settings" ADD CONSTRAINT "user_mfa_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_checkpoints" ADD CONSTRAINT "collaboration_checkpoints_session_id_collaboration_sessions_id_" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_session_id_collaboration_sessions_id" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_activity" ADD CONSTRAINT "document_activity_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_activity" ADD CONSTRAINT "document_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_topic_id_community_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."community_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scraping_job_results_completed_at_idx" ON "scraping_job_results" USING btree ("completed_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "scraping_job_results_job_id_idx" ON "scraping_job_results" USING btree ("job_id" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_job_results_success_idx" ON "scraping_job_results" USING btree ("success" bool_ops);--> statement-breakpoint
CREATE INDEX "custom_reports_user_id_idx" ON "custom_reports" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_comments_author_id_idx" ON "post_comments" USING btree ("author_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "challenges_category_idx" ON "challenges" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "challenges_deadline_idx" ON "challenges" USING btree ("deadline" timestamp_ops);--> statement-breakpoint
CREATE INDEX "challenges_is_active_idx" ON "challenges" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "challenge_participants_challenge_id_idx" ON "challenge_participants" USING btree ("challenge_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_participants_unique_idx" ON "challenge_participants" USING btree ("challenge_id" text_ops,"user_id" text_ops);--> statement-breakpoint
CREATE INDEX "challenge_participants_user_id_idx" ON "challenge_participants" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_event_idx" ON "analytics_events" USING btree ("event" text_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "calendar_connections_provider_idx" ON "calendar_connections" USING btree ("provider" text_ops);--> statement-breakpoint
CREATE INDEX "calendar_connections_user_id_idx" ON "calendar_connections" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "chat_conversations_agent_id_idx" ON "chat_conversations" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "chat_conversations_is_archived_idx" ON "chat_conversations" USING btree ("is_archived" bool_ops);--> statement-breakpoint
CREATE INDEX "chat_conversations_last_message_at_idx" ON "chat_conversations" USING btree ("last_message_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "chat_conversations_user_id_idx" ON "chat_conversations" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages" USING btree ("conversation_id" text_ops);--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "chat_messages_role_idx" ON "chat_messages" USING btree ("role" text_ops);--> statement-breakpoint
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_competitor_id_idx" ON "competitive_opportunities" USING btree ("competitor_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_detected_at_idx" ON "competitive_opportunities" USING btree ("detected_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_impact_idx" ON "competitive_opportunities" USING btree ("impact" text_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_is_archived_idx" ON "competitive_opportunities" USING btree ("is_archived" bool_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_priority_score_idx" ON "competitive_opportunities" USING btree ("priority_score" numeric_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_status_idx" ON "competitive_opportunities" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_type_idx" ON "competitive_opportunities" USING btree ("opportunity_type" text_ops);--> statement-breakpoint
CREATE INDEX "competitive_opportunities_user_id_idx" ON "competitive_opportunities" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "device_approvals_device_fingerprint_idx" ON "device_approvals" USING btree ("device_fingerprint" text_ops);--> statement-breakpoint
CREATE INDEX "device_approvals_expires_at_idx" ON "device_approvals" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "device_approvals_is_approved_idx" ON "device_approvals" USING btree ("is_approved" bool_ops);--> statement-breakpoint
CREATE INDEX "device_approvals_user_id_idx" ON "device_approvals" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "documents_file_type_idx" ON "documents" USING btree ("file_type" text_ops);--> statement-breakpoint
CREATE INDEX "documents_folder_id_idx" ON "documents" USING btree ("folder_id" text_ops);--> statement-breakpoint
CREATE INDEX "documents_is_favorite_idx" ON "documents" USING btree ("is_favorite" bool_ops);--> statement-breakpoint
CREATE INDEX "documents_name_idx" ON "documents" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_folders_name_idx" ON "document_folders" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "document_folders_parent_id_idx" ON "document_folders" USING btree ("parent_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_folders_user_id_idx" ON "document_folders" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_permissions_document_id_idx" ON "document_permissions" USING btree ("document_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_permissions_email_idx" ON "document_permissions" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "document_permissions_role_idx" ON "document_permissions" USING btree ("role" text_ops);--> statement-breakpoint
CREATE INDEX "document_permissions_user_id_idx" ON "document_permissions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_share_links_created_by_idx" ON "document_share_links" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "document_share_links_document_id_idx" ON "document_share_links" USING btree ("document_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_share_links_expires_at_idx" ON "document_share_links" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "document_share_links_is_active_idx" ON "document_share_links" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "document_versions_created_by_idx" ON "document_versions" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "document_versions_document_id_idx" ON "document_versions" USING btree ("document_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_versions_version_number_idx" ON "document_versions" USING btree ("version_number" int4_ops);--> statement-breakpoint
CREATE INDEX "competitor_profiles_domain_idx" ON "competitor_profiles" USING btree ("domain" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_profiles_industry_idx" ON "competitor_profiles" USING btree ("industry" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_profiles_monitoring_status_idx" ON "competitor_profiles" USING btree ("monitoring_status" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_profiles_threat_level_idx" ON "competitor_profiles" USING btree ("threat_level" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_profiles_user_id_idx" ON "competitor_profiles" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_activities_activity_type_idx" ON "competitor_activities" USING btree ("activity_type" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_activities_competitor_id_idx" ON "competitor_activities" USING btree ("competitor_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_activities_detected_at_idx" ON "competitor_activities" USING btree ("detected_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "competitor_activities_importance_idx" ON "competitor_activities" USING btree ("importance" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_activities_user_id_idx" ON "competitor_activities" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_alert_type_idx" ON "competitor_alerts" USING btree ("alert_type" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_competitor_id_idx" ON "competitor_alerts" USING btree ("competitor_id" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_created_at_idx" ON "competitor_alerts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_is_archived_idx" ON "competitor_alerts" USING btree ("is_archived" bool_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_is_read_idx" ON "competitor_alerts" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_severity_idx" ON "competitor_alerts" USING btree ("severity" text_ops);--> statement-breakpoint
CREATE INDEX "competitor_alerts_user_id_idx" ON "competitor_alerts" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_actions_due_date_idx" ON "opportunity_actions" USING btree ("due_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "opportunity_actions_opportunity_id_idx" ON "opportunity_actions" USING btree ("opportunity_id" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_actions_priority_idx" ON "opportunity_actions" USING btree ("priority" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_actions_status_idx" ON "opportunity_actions" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_actions_user_id_idx" ON "opportunity_actions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_metrics_measurement_date_idx" ON "opportunity_metrics" USING btree ("measurement_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "opportunity_metrics_metric_name_idx" ON "opportunity_metrics" USING btree ("metric_name" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_metrics_opportunity_id_idx" ON "opportunity_metrics" USING btree ("opportunity_id" text_ops);--> statement-breakpoint
CREATE INDEX "opportunity_metrics_user_id_idx" ON "opportunity_metrics" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_used_at_idx" ON "password_reset_tokens" USING btree ("used_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "payment_provider_connections_provider_idx" ON "payment_provider_connections" USING btree ("provider" text_ops);--> statement-breakpoint
CREATE INDEX "payment_provider_connections_user_id_idx" ON "payment_provider_connections" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "payment_provider_connections_user_provider_idx" ON "payment_provider_connections" USING btree ("user_id" text_ops,"provider" text_ops);--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id" text_ops);--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_collected_at_idx" ON "intelligence_data" USING btree ("collected_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_competitor_id_idx" ON "intelligence_data" USING btree ("competitor_id" text_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_data_type_idx" ON "intelligence_data" USING btree ("data_type" text_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_expires_at_idx" ON "intelligence_data" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_importance_idx" ON "intelligence_data" USING btree ("importance" text_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_source_type_idx" ON "intelligence_data" USING btree ("source_type" text_ops);--> statement-breakpoint
CREATE INDEX "intelligence_data_user_id_idx" ON "intelligence_data" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint" text_ops);--> statement-breakpoint
CREATE INDEX "push_subscriptions_is_active_idx" ON "push_subscriptions" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_competitor_id_idx" ON "scraping_jobs" USING btree ("competitor_id" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_job_type_idx" ON "scraping_jobs" USING btree ("job_type" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_next_run_at_idx" ON "scraping_jobs" USING btree ("next_run_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_priority_idx" ON "scraping_jobs" USING btree ("priority" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_status_idx" ON "scraping_jobs" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "scraping_jobs_user_id_idx" ON "scraping_jobs" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "social_media_connections_platform_idx" ON "social_media_connections" USING btree ("platform" text_ops);--> statement-breakpoint
CREATE INDEX "social_media_connections_user_id_idx" ON "social_media_connections" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "social_media_connections_user_platform_idx" ON "social_media_connections" USING btree ("user_id" text_ops,"platform" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_unique_idx" ON "user_achievements" USING btree ("user_id" int4_ops,"achievement_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_api_keys_service_idx" ON "user_api_keys" USING btree ("service" text_ops);--> statement-breakpoint
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "user_api_keys_user_service_idx" ON "user_api_keys" USING btree ("user_id" text_ops,"service" text_ops);--> statement-breakpoint
CREATE INDEX "user_brand_settings_industry_idx" ON "user_brand_settings" USING btree ("industry" text_ops);--> statement-breakpoint
CREATE INDEX "user_brand_settings_user_id_idx" ON "user_brand_settings" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "user_mfa_settings_totp_enabled_idx" ON "user_mfa_settings" USING btree ("totp_enabled" bool_ops);--> statement-breakpoint
CREATE INDEX "user_mfa_settings_user_id_idx" ON "user_mfa_settings" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "user_mfa_settings_webauthn_enabled_idx" ON "user_mfa_settings" USING btree ("webauthn_enabled" bool_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_device_fingerprint_idx" ON "user_sessions" USING btree ("device_fingerprint" text_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_last_activity_idx" ON "user_sessions" USING btree ("last_activity" timestamp_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_refresh_token_idx" ON "user_sessions" USING btree ("refresh_token" text_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "user_settings_category_idx" ON "user_settings" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "user_settings_user_category_idx" ON "user_settings" USING btree ("user_id" text_ops,"category" text_ops);--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "collaboration_sessions_user_id_idx" ON "collaboration_sessions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "collaboration_checkpoints_session_id_idx" ON "collaboration_checkpoints" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "collaboration_messages_created_at_idx" ON "collaboration_messages" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "collaboration_messages_session_id_idx" ON "collaboration_messages" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "collaboration_participants_agent_id_idx" ON "collaboration_participants" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "collaboration_participants_session_id_idx" ON "collaboration_participants" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_activity_document_id_idx" ON "document_activity" USING btree ("document_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_activity_user_id_idx" ON "document_activity" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "community_comments_parent_id_idx" ON "community_comments" USING btree ("parent_id" text_ops);--> statement-breakpoint
CREATE INDEX "community_comments_post_id_idx" ON "community_comments" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "community_comments_user_id_idx" ON "community_comments" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "community_posts_created_at_idx" ON "community_posts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "community_posts_topic_id_idx" ON "community_posts" USING btree ("topic_id" text_ops);--> statement-breakpoint
CREATE INDEX "community_posts_user_id_idx" ON "community_posts" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id" text_ops);--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id" text_ops);--> statement-breakpoint
CREATE INDEX "comment_likes_comment_id_idx" ON "comment_likes" USING btree ("comment_id" text_ops);--> statement-breakpoint
CREATE INDEX "comment_likes_user_id_idx" ON "comment_likes" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_likes_post_id_idx" ON "post_likes" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_likes_user_id_idx" ON "post_likes" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_reactions_post_id_idx" ON "post_reactions" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "post_reactions_user_id_idx" ON "post_reactions" USING btree ("user_id" text_ops);
*/