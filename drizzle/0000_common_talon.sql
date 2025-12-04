CREATE TABLE "achievements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "achievements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"points" integer DEFAULT 0,
	"category" varchar(100),
	"requirements" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analytics_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255),
	"event" varchar(100) NOT NULL,
	"properties" jsonb DEFAULT '{}',
	"timestamp" timestamp DEFAULT now(),
	"session_id" varchar(255),
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "briefcases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "briefcases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
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
	"user_id" varchar(255) NOT NULL,
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
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"last_message" text,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"conversation_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"goal" text NOT NULL,
	"status" varchar(50) DEFAULT 'initializing' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now(),
	"participant_count" integer DEFAULT 0,
	"message_count" integer DEFAULT 0,
	"completed_tasks" jsonb DEFAULT '[]',
	"pending_tasks" jsonb DEFAULT '[]',
	"session_metrics" jsonb DEFAULT '{}',
	"configuration" jsonb DEFAULT '{}',
	"participating_agents" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "competitive_opportunities" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"competitor_id" integer NOT NULL,
	"intelligence_id" integer,
	"opportunity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"impact" varchar(20) NOT NULL,
	"effort" varchar(20) NOT NULL,
	"timing" varchar(20) NOT NULL,
	"priority_score" numeric(5, 2) NOT NULL,
	"evidence" jsonb DEFAULT '[]',
	"recommendations" jsonb DEFAULT '[]',
	"status" varchar(50) DEFAULT 'identified',
	"assigned_to" varchar(255),
	"implementation_notes" text,
	"roi_estimate" numeric(10, 2),
	"actual_roi" numeric(10, 2),
	"success_metrics" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"is_archived" boolean DEFAULT false,
	"detected_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_url" varchar(1000),
	"source_type" varchar(50) NOT NULL,
	"importance" varchar(20) DEFAULT 'medium' NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.00',
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"detected_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_alerts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_alerts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"intelligence_id" integer,
	"alert_type" varchar(100) NOT NULL,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_data" jsonb DEFAULT '{}',
	"action_items" jsonb DEFAULT '[]',
	"recommended_actions" jsonb DEFAULT '[]',
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_profiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
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
	"social_media_handles" jsonb DEFAULT '{}',
	"key_personnel" jsonb DEFAULT '[]',
	"products" jsonb DEFAULT '[]',
	"market_position" jsonb DEFAULT '{}',
	"competitive_advantages" jsonb DEFAULT '[]',
	"vulnerabilities" jsonb DEFAULT '[]',
	"monitoring_config" jsonb DEFAULT '{}',
	"last_analyzed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"website" varchar(500),
	"description" text,
	"strengths" jsonb DEFAULT '[]',
	"weaknesses" jsonb DEFAULT '[]',
	"opportunities" jsonb DEFAULT '[]',
	"threats" jsonb DEFAULT '[]',
	"market_position" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_approvals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_approvals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
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
CREATE TABLE "document_activity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "document_activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"document_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb DEFAULT '{}',
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_folders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "document_folders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"parent_id" integer,
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
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "document_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"document_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"email" varchar(255),
	"role" varchar(20) DEFAULT 'viewer' NOT NULL,
	"granted_by" varchar(255) NOT NULL,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "document_share_links" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
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
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "document_versions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"document_id" varchar(255) NOT NULL,
	"version_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"file_data" text NOT NULL,
	"change_summary" text,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"folder_id" integer,
	"name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"file_url" varchar(1000),
	"category" varchar(100) DEFAULT 'uncategorized',
	"description" text,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"ai_insights" jsonb DEFAULT '{}',
	"is_favorite" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fine_tuning_jobs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"agent_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"training_data_size" integer DEFAULT 0,
	"validation_data_size" integer DEFAULT 0,
	"parameters" jsonb DEFAULT '{}',
	"results" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "focus_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"duration_minutes" integer,
	"task_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "goals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"briefcase_id" integer,
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
CREATE TABLE "intelligence_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "intelligence_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_url" varchar(1000),
	"data_type" varchar(100) NOT NULL,
	"raw_content" jsonb,
	"extracted_data" jsonb DEFAULT '{}',
	"analysis_results" jsonb DEFAULT '[]',
	"confidence" numeric(3, 2) DEFAULT '0.00',
	"importance" varchar(20) DEFAULT 'medium' NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"collected_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_modules" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text,
	"duration_minutes" integer NOT NULL,
	"difficulty" varchar(20) DEFAULT 'beginner' NOT NULL,
	"category" varchar(100) NOT NULL,
	"skills_covered" jsonb DEFAULT '[]',
	"prerequisites" jsonb DEFAULT '[]',
	"is_published" boolean DEFAULT false,
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
	"user_ids" jsonb DEFAULT '[]',
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
CREATE TABLE "opportunity_actions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "opportunity_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"opportunity_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
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
CREATE TABLE "opportunity_metrics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "opportunity_metrics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"opportunity_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
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
	"user_id" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"content" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productivity_insights" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "productivity_insights_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"metrics" jsonb NOT NULL,
	"ai_recommendations" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"endpoint" varchar(1000) NOT NULL,
	"p256dh_key" varchar(500) NOT NULL,
	"auth_key" varchar(500) NOT NULL,
	"device_info" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"module_id" varchar(255),
	"score" integer NOT NULL,
	"max_score" integer DEFAULT 100,
	"passed" boolean DEFAULT false,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "session_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"from_agent" varchar(255) NOT NULL,
	"to_agent" varchar(255),
	"message_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"priority" varchar(20) DEFAULT 'medium',
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "skill_assessments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skill_assessments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"skill_name" varchar(255) NOT NULL,
	"category" varchar(100),
	"current_level" integer DEFAULT 1,
	"target_level" integer DEFAULT 5,
	"gap_score" integer DEFAULT 0,
	"assessed_at" timestamp DEFAULT now(),
	"next_assessment_due" timestamp
);
--> statement-breakpoint
CREATE TABLE "task_analytics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_analytics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"task_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "task_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#8B5CF6',
	"icon" varchar(50),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"goal_id" integer,
	"briefcase_id" integer,
	"parent_task_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"category" varchar(100),
	"tags" jsonb DEFAULT '[]',
	"due_date" timestamp,
	"estimated_minutes" integer,
	"actual_minutes" integer,
	"energy_level" varchar(20) DEFAULT 'medium',
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" jsonb,
	"ai_suggestions" jsonb DEFAULT '{}',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_downloads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "template_downloads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"template_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"downloaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar(100),
	"tier" varchar(20) DEFAULT 'Free',
	"estimated_minutes" integer,
	"difficulty" varchar(20) DEFAULT 'Beginner',
	"tags" jsonb DEFAULT '[]',
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"is_premium" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_achievements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"achievement_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_api_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"service" varchar(50) NOT NULL,
	"key_value" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_brand_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_brand_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"tagline" varchar(500),
	"description" text,
	"industry" varchar(100),
	"target_audience" text,
	"brand_personality" jsonb DEFAULT '[]',
	"color_palette" jsonb DEFAULT '{}',
	"typography" jsonb DEFAULT '{}',
	"logo_url" varchar(1000),
	"logo_prompt" text,
	"moodboard" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_brand_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_competitive_stats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_competitive_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
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
	"user_id" varchar(255) NOT NULL,
	"totp_secret" varchar(255),
	"totp_enabled" boolean DEFAULT false,
	"totp_backup_codes" jsonb DEFAULT '[]',
	"webauthn_enabled" boolean DEFAULT false,
	"webauthn_credentials" jsonb DEFAULT '[]',
	"recovery_codes" jsonb DEFAULT '[]',
	"mfa_required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_mfa_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"module_id" varchar(255) NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"last_accessed" timestamp DEFAULT now(),
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"status" varchar(20) DEFAULT 'not_started',
	"data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
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
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"username" varchar(100),
	"date_of_birth" timestamp,
	"avatar_url" varchar(500),
	"subscription_tier" varchar(50) DEFAULT 'free',
	"subscription_status" varchar(50) DEFAULT 'active',
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	"onboarding_completed_at" timestamp,
	"onboarding_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflow_executions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workflow_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'running',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration" integer,
	"input" jsonb DEFAULT '{}',
	"output" jsonb DEFAULT '{}',
	"variables" jsonb DEFAULT '{}',
	"options" jsonb DEFAULT '{}',
	"error" jsonb,
	"logs" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflow_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) DEFAULT 'general',
	"tags" jsonb DEFAULT '[]',
	"workflow_data" jsonb NOT NULL,
	"is_public" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"created_by" varchar(255),
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workflows_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(50) DEFAULT '1.0.0',
	"status" varchar(50) DEFAULT 'draft',
	"trigger_type" varchar(100) NOT NULL,
	"trigger_config" jsonb DEFAULT '{}',
	"nodes" jsonb DEFAULT '[]',
	"edges" jsonb DEFAULT '[]',
	"variables" jsonb DEFAULT '{}',
	"settings" jsonb DEFAULT '{}',
	"category" varchar(100) DEFAULT 'general',
	"tags" jsonb DEFAULT '[]',
	"template_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefcases" ADD CONSTRAINT "briefcases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_intelligence_id_intelligence_data_id_fk" FOREIGN KEY ("intelligence_id") REFERENCES "public"."intelligence_data"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ADD CONSTRAINT "competitive_opportunities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_activities" ADD CONSTRAINT "competitor_activities_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_activities" ADD CONSTRAINT "competitor_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_intelligence_id_intelligence_data_id_fk" FOREIGN KEY ("intelligence_id") REFERENCES "public"."intelligence_data"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ADD CONSTRAINT "competitor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_approvals" ADD CONSTRAINT "device_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_approvals" ADD CONSTRAINT "device_approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_activity" ADD CONSTRAINT "document_activity_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_activity" ADD CONSTRAINT "document_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_parent_id_document_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_share_links" ADD CONSTRAINT "document_share_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_share_links" ADD CONSTRAINT "document_share_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_document_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fine_tuning_jobs" ADD CONSTRAINT "fine_tuning_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ADD CONSTRAINT "opportunity_actions_opportunity_id_competitive_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."competitive_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ADD CONSTRAINT "opportunity_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ADD CONSTRAINT "opportunity_metrics_opportunity_id_competitive_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."competitive_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ADD CONSTRAINT "opportunity_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productivity_insights" ADD CONSTRAINT "productivity_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_scores" ADD CONSTRAINT "quiz_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_scores" ADD CONSTRAINT "quiz_scores_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_job_results" ADD CONSTRAINT "scraping_job_results_job_id_scraping_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scraping_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_template_id_workflow_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_downloads" ADD CONSTRAINT "template_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ADD CONSTRAINT "user_brand_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ADD CONSTRAINT "user_competitive_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_settings" ADD CONSTRAINT "user_mfa_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analytics_events_event_idx" ON "analytics_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "calendar_connections_user_id_idx" ON "calendar_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendar_connections_provider_idx" ON "calendar_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "chat_conversations_user_id_idx" ON "chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_conversations_agent_id_idx" ON "chat_conversations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "chat_conversations_last_message_at_idx" ON "chat_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "chat_conversations_is_archived_idx" ON "chat_conversations" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_messages_role_idx" ON "chat_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "collaboration_sessions_user_id_idx" ON "collaboration_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collaboration_sessions_status_idx" ON "collaboration_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_user_id_idx" ON "competitive_opportunities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_competitor_id_idx" ON "competitive_opportunities" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_type_idx" ON "competitive_opportunities" USING btree ("opportunity_type");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_impact_idx" ON "competitive_opportunities" USING btree ("impact");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_status_idx" ON "competitive_opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_priority_score_idx" ON "competitive_opportunities" USING btree ("priority_score");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_detected_at_idx" ON "competitive_opportunities" USING btree ("detected_at");--> statement-breakpoint
CREATE INDEX "competitive_opportunities_is_archived_idx" ON "competitive_opportunities" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "competitor_activities_competitor_id_idx" ON "competitor_activities" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "competitor_activities_user_id_idx" ON "competitor_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitor_activities_activity_type_idx" ON "competitor_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "competitor_activities_importance_idx" ON "competitor_activities" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "competitor_activities_detected_at_idx" ON "competitor_activities" USING btree ("detected_at");--> statement-breakpoint
CREATE INDEX "competitor_alerts_competitor_id_idx" ON "competitor_alerts" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "competitor_alerts_user_id_idx" ON "competitor_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitor_alerts_alert_type_idx" ON "competitor_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "competitor_alerts_severity_idx" ON "competitor_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "competitor_alerts_is_read_idx" ON "competitor_alerts" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "competitor_alerts_is_archived_idx" ON "competitor_alerts" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "competitor_alerts_created_at_idx" ON "competitor_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "competitor_profiles_user_id_idx" ON "competitor_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitor_profiles_threat_level_idx" ON "competitor_profiles" USING btree ("threat_level");--> statement-breakpoint
CREATE INDEX "competitor_profiles_monitoring_status_idx" ON "competitor_profiles" USING btree ("monitoring_status");--> statement-breakpoint
CREATE INDEX "competitor_profiles_domain_idx" ON "competitor_profiles" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "competitor_profiles_industry_idx" ON "competitor_profiles" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "device_approvals_user_id_idx" ON "device_approvals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_approvals_device_fingerprint_idx" ON "device_approvals" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "device_approvals_is_approved_idx" ON "device_approvals" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "device_approvals_expires_at_idx" ON "device_approvals" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "document_activity_document_id_idx" ON "document_activity" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_activity_user_id_idx" ON "document_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_activity_action_idx" ON "document_activity" USING btree ("action");--> statement-breakpoint
CREATE INDEX "document_activity_created_at_idx" ON "document_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "document_folders_user_id_idx" ON "document_folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_folders_parent_id_idx" ON "document_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "document_folders_name_idx" ON "document_folders" USING btree ("name");--> statement-breakpoint
CREATE INDEX "document_permissions_document_id_idx" ON "document_permissions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_permissions_user_id_idx" ON "document_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_permissions_email_idx" ON "document_permissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "document_permissions_role_idx" ON "document_permissions" USING btree ("role");--> statement-breakpoint
CREATE INDEX "document_share_links_document_id_idx" ON "document_share_links" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_share_links_created_by_idx" ON "document_share_links" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "document_share_links_is_active_idx" ON "document_share_links" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "document_share_links_expires_at_idx" ON "document_share_links" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "document_versions_document_id_idx" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_versions_version_number_idx" ON "document_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "document_versions_created_by_idx" ON "document_versions" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_folder_id_idx" ON "documents" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "documents_file_type_idx" ON "documents" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "documents_is_favorite_idx" ON "documents" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_name_idx" ON "documents" USING btree ("name");--> statement-breakpoint
CREATE INDEX "fine_tuning_jobs_user_id_idx" ON "fine_tuning_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fine_tuning_jobs_agent_id_idx" ON "fine_tuning_jobs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "fine_tuning_jobs_status_idx" ON "fine_tuning_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "intelligence_data_competitor_id_idx" ON "intelligence_data" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "intelligence_data_user_id_idx" ON "intelligence_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "intelligence_data_source_type_idx" ON "intelligence_data" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "intelligence_data_data_type_idx" ON "intelligence_data" USING btree ("data_type");--> statement-breakpoint
CREATE INDEX "intelligence_data_importance_idx" ON "intelligence_data" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "intelligence_data_collected_at_idx" ON "intelligence_data" USING btree ("collected_at");--> statement-breakpoint
CREATE INDEX "intelligence_data_expires_at_idx" ON "intelligence_data" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "learning_modules_category_idx" ON "learning_modules" USING btree ("category");--> statement-breakpoint
CREATE INDEX "learning_modules_difficulty_idx" ON "learning_modules" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "opportunity_actions_opportunity_id_idx" ON "opportunity_actions" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunity_actions_user_id_idx" ON "opportunity_actions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunity_actions_status_idx" ON "opportunity_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opportunity_actions_priority_idx" ON "opportunity_actions" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "opportunity_actions_due_date_idx" ON "opportunity_actions" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "opportunity_metrics_opportunity_id_idx" ON "opportunity_metrics" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunity_metrics_user_id_idx" ON "opportunity_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunity_metrics_metric_name_idx" ON "opportunity_metrics" USING btree ("metric_name");--> statement-breakpoint
CREATE INDEX "opportunity_metrics_measurement_date_idx" ON "opportunity_metrics" USING btree ("measurement_date");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_used_at_idx" ON "password_reset_tokens" USING btree ("used_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_is_active_idx" ON "push_subscriptions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "quiz_scores_user_id_idx" ON "quiz_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_scores_module_id_idx" ON "quiz_scores" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "scraping_job_results_job_id_idx" ON "scraping_job_results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "scraping_job_results_success_idx" ON "scraping_job_results" USING btree ("success");--> statement-breakpoint
CREATE INDEX "scraping_job_results_completed_at_idx" ON "scraping_job_results" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "scraping_jobs_competitor_id_idx" ON "scraping_jobs" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "scraping_jobs_user_id_idx" ON "scraping_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scraping_jobs_status_idx" ON "scraping_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scraping_jobs_priority_idx" ON "scraping_jobs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "scraping_jobs_next_run_at_idx" ON "scraping_jobs" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "scraping_jobs_job_type_idx" ON "scraping_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "session_messages_session_id_idx" ON "session_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_messages_timestamp_idx" ON "session_messages" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "skill_assessments_user_id_idx" ON "skill_assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skill_assessments_skill_name_idx" ON "skill_assessments" USING btree ("skill_name");--> statement-breakpoint
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_api_keys_service_idx" ON "user_api_keys" USING btree ("service");--> statement-breakpoint
CREATE INDEX "user_brand_settings_user_id_idx" ON "user_brand_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_brand_settings_industry_idx" ON "user_brand_settings" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_user_id_idx" ON "user_mfa_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_totp_enabled_idx" ON "user_mfa_settings" USING btree ("totp_enabled");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_webauthn_enabled_idx" ON "user_mfa_settings" USING btree ("webauthn_enabled");--> statement-breakpoint
CREATE INDEX "user_progress_user_id_idx" ON "user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_progress_module_id_idx" ON "user_progress" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "user_progress_status_idx" ON "user_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_refresh_token_idx" ON "user_sessions" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX "user_sessions_device_fingerprint_idx" ON "user_sessions" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_last_activity_idx" ON "user_sessions" USING btree ("last_activity");