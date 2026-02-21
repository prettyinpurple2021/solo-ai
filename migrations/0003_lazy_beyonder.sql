ALTER TYPE "public"."feedback_type" ADD VALUE 'post_report';--> statement-breakpoint
CREATE TABLE "admin_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_user_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" boolean DEFAULT true,
	"push" boolean DEFAULT true,
	"push_in_app" boolean DEFAULT true,
	"categories" jsonb DEFAULT '{"alerts":true,"reminders":true,"achievements":true,"marketing":false}'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"sent_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "code_snippets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"language" varchar(50) NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pitch_decks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"theme" varchar(50) DEFAULT 'modern' NOT NULL,
	"thumbnail" varchar(1000),
	"is_public" boolean DEFAULT false NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slide_components" (
	"id" text PRIMARY KEY NOT NULL,
	"slide_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" jsonb NOT NULL,
	"position" jsonb NOT NULL,
	"style" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"animation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"order" integer NOT NULL,
	"layout" varchar(50) DEFAULT 'blank' NOT NULL,
	"title" varchar(255),
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefcase_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"briefcase_id" text,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" jsonb DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_guides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"role" varchar(100),
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_descriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"role" varchar(100),
	"department" varchar(100),
	"content" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"phases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_docs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"version" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sops" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"department" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature" varchar(50) NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"limit" integer,
	"reset_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_context" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"context_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_news_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"competitor_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"content" text,
	"sentiment" numeric(3, 2),
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"competitor_name" text NOT NULL,
	"threat_level" text,
	"mission_brief" text,
	"intel" jsonb DEFAULT '[]' NOT NULL,
	"vulnerabilities" jsonb DEFAULT '[]' NOT NULL,
	"strengths" jsonb DEFAULT '[]' NOT NULL,
	"metrics" jsonb DEFAULT '{}' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_social_mentions" (
	"id" text PRIMARY KEY NOT NULL,
	"competitor_id" text NOT NULL,
	"platform" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"author" varchar(100),
	"engagement" integer DEFAULT 0 NOT NULL,
	"mention_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"company" text,
	"role" text,
	"notes" text,
	"linkedin_url" text,
	"tags" text[],
	"last_contact" timestamp,
	"relationship" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_intelligence" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"summary" text NOT NULL,
	"highlights" jsonb DEFAULT '[]' NOT NULL,
	"priority_actions" jsonb DEFAULT '[]' NOT NULL,
	"alerts" jsonb DEFAULT '[]' NOT NULL,
	"motivational_message" text,
	"risk_level" varchar(20) DEFAULT 'low' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_intelligence_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"results" jsonb NOT NULL,
	"source" varchar(50) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pivot_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"gaps" jsonb DEFAULT '[]' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_index" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "search_index_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" varchar(255) NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"tokens" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'processed' NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text,
	"url" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_instructions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"agent_role" varchar(50),
	"instruction" text NOT NULL,
	"version" varchar(20) DEFAULT '1.0.0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_memory" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"memory" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_interaction" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ceo_score" integer,
	"consensus" text,
	"executive_summary" text,
	"grades" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boardroom_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boardroom_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"goal" text NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tribe_blueprints" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"members" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "war_room_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"consensus" text,
	"action_plan" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dialogue" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"budget" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" text,
	"title" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" varchar(1000),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "xp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "total_actions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "suspended" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "cancel_at_period_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_activity" ALTER COLUMN "details" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_activity" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "is_default" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "file_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "total_size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_folders" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_permissions" ALTER COLUMN "granted_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_permissions" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_share_links" ALTER COLUMN "access_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_share_links" ALTER COLUMN "download_enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_share_links" ALTER COLUMN "require_auth" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_share_links" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_share_links" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_versions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "file_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "ai_insights" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "is_favorite" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "download_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "view_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "type" SET DATA TYPE "public"."feedback_type" USING "type"::"public"."feedback_type";--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."feedback_status";--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "status" SET DATA TYPE "public"."feedback_status" USING "status"::"public"."feedback_status";--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "module_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "duration_minutes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ALTER COLUMN "last_accessed_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "properties" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "metadata" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_reports" ALTER COLUMN "is_favorite" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_reports" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_reports" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "duration_minutes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "xp_earned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "productivity_insights" ALTER COLUMN "ai_recommendations" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "productivity_insights" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_analytics" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_analytics" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_categories" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_categories" ALTER COLUMN "is_default" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_categories" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_categories" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "energy_level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "is_recurring" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "ai_suggestions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "tier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "usage_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "rating" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "is_premium" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "brand_personality" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "color_palette" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "typography" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "moodboard" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_brand_settings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "settings" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "evidence" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "recommendations" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "success_metrics" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "is_archived" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "detected_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitive_opportunities" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "confidence" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "detected_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_activities" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "source_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "action_items" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "recommended_actions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "is_read" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "is_archived" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "social_media_handles" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "key_personnel" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "products" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "market_position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "competitive_advantages" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "vulnerabilities" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "monitoring_config" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "strengths" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "weaknesses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "opportunities" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "threats" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "extracted_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "analysis_results" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "confidence" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "collected_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_actions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ALTER COLUMN "measurement_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_metrics" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scraping_job_results" ALTER COLUMN "completed_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scraping_job_results" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_connections" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_connections" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_connections" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_provider_connections" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comments" ALTER COLUMN "likes_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comments" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_reactions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "likes_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "comments_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "shares_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "achievement_context" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "achievement_context" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "device_info" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "social_media_connections" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "social_media_connections" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "social_media_connections" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "message_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "is_archived" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_checkpoints" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_checkpoints" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ALTER COLUMN "message_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ALTER COLUMN "joined_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ALTER COLUMN "configuration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "require_interaction" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "silent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "vibrate" SET DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "vibrate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "user_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "all_users" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "scheduled_time" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "attempts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "max_attempts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_jobs" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "template_downloads" ALTER COLUMN "downloaded_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "started_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "input" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "output" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "variables" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "options" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "logs" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_executions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "featured" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "usage_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "version" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "trigger_config" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "nodes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "edges" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "variables" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "settings" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "points" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "requirements" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "progress" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "joined_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "emoji" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "participants_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "reward_points" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "earned_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "competitors_monitored" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "intelligence_gathered" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "alerts_processed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "opportunities_identified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "competitive_tasks_completed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "market_victories" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "threat_responses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "intelligence_streaks" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "competitive_advantage_points" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_competitive_stats" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mood_entries" ALTER COLUMN "mood_label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_likes" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "is_solution" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "like_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "is_pinned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "view_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "like_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "comment_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_topics" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_topics" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "community_topics" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stack_user_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_pin_hash" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "difficulty" varchar(50) DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "skills_covered" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "prerequisites" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD COLUMN "last_position" integer;--> statement-breakpoint
ALTER TABLE "briefcases" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "image" varchar(1000);--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "tags" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "metadata" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "shares_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snippets" ADD CONSTRAINT "code_snippets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_decks" ADD CONSTRAINT "pitch_decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_components" ADD CONSTRAINT "slide_components_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_deck_id_pitch_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."pitch_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_history" ADD CONSTRAINT "training_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefcase_items" ADD CONSTRAINT "briefcase_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefcase_items" ADD CONSTRAINT "briefcase_items_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_guides" ADD CONSTRAINT "interview_guides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_strategies" ADD CONSTRAINT "launch_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_docs" ADD CONSTRAINT "legal_docs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sops" ADD CONSTRAINT "sops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_context" ADD CONSTRAINT "business_context_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_reports" ADD CONSTRAINT "competitor_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_intelligence" ADD CONSTRAINT "daily_intelligence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pivot_analyses" ADD CONSTRAINT "pivot_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_index" ADD CONSTRAINT "search_index_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_logs" ADD CONSTRAINT "traffic_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_instructions" ADD CONSTRAINT "agent_instructions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_reports" ADD CONSTRAINT "board_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardroom_messages" ADD CONSTRAINT "boardroom_messages_session_id_boardroom_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."boardroom_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardroom_sessions" ADD CONSTRAINT "boardroom_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tribe_blueprints" ADD CONSTRAINT "tribe_blueprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "war_room_sessions" ADD CONSTRAINT "war_room_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_assets" ADD CONSTRAINT "creative_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_assets" ADD CONSTRAINT "creative_assets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_actions_admin_id_idx" ON "admin_actions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "notification_prefs_user_id_idx" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_prefs_user_unique_idx" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "code_snippets_user_id_idx" ON "code_snippets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "code_snippets_language_idx" ON "code_snippets" USING btree ("language");--> statement-breakpoint
CREATE INDEX "pitch_decks_user_id_idx" ON "pitch_decks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pitch_decks_status_idx" ON "pitch_decks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "slide_components_slide_id_idx" ON "slide_components" USING btree ("slide_id");--> statement-breakpoint
CREATE INDEX "slides_deck_id_idx" ON "slides" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "slides_deck_order_idx" ON "slides" USING btree ("deck_id","order");--> statement-breakpoint
CREATE INDEX "training_history_user_id_idx" ON "training_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "training_history_module_id_idx" ON "training_history" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "briefcase_items_user_id_idx" ON "briefcase_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "briefcase_items_briefcase_id_idx" ON "briefcase_items" USING btree ("briefcase_id");--> statement-breakpoint
CREATE INDEX "interview_guides_user_id_idx" ON "interview_guides" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_descriptions_user_id_idx" ON "job_descriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "launch_strategies_user_id_idx" ON "launch_strategies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "legal_docs_user_id_idx" ON "legal_docs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_specs_user_id_idx" ON "product_specs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sops_user_id_idx" ON "sops" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_sub_id_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "usage_tracking_user_id_idx" ON "usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_tracking_feature_idx" ON "usage_tracking" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "business_context_user_id_idx" ON "business_context" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "business_context_type_idx" ON "business_context" USING btree ("context_type");--> statement-breakpoint
CREATE INDEX "competitor_news_comp_id_idx" ON "competitor_news_articles" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "competitor_reports_user_id_idx" ON "competitor_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitor_social_comp_id_idx" ON "competitor_social_mentions" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "contacts_user_id_idx" ON "contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_intel_user_id_idx" ON "daily_intelligence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_intel_date_idx" ON "daily_intelligence" USING btree ("date");--> statement-breakpoint
CREATE INDEX "market_intel_query_idx" ON "market_intelligence_cache" USING btree ("query");--> statement-breakpoint
CREATE INDEX "pivot_analyses_user_id_idx" ON "pivot_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_index_user_id_idx" ON "search_index" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_index_entity_type_idx" ON "search_index" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "search_index_entity_id_idx" ON "search_index" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "chat_history_user_id_idx" ON "chat_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_history_conv_id_idx" ON "chat_history" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "webhook_events_type_idx" ON "webhook_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "webhook_events_status_idx" ON "webhook_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "traffic_logs_session_id_idx" ON "traffic_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "traffic_logs_user_id_idx" ON "traffic_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "traffic_logs_timestamp_idx" ON "traffic_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "agent_inst_user_id_idx" ON "agent_instructions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agent_inst_agent_id_idx" ON "agent_instructions" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_memory_user_agent_idx" ON "agent_memory" USING btree ("user_id","agent_id");--> statement-breakpoint
CREATE INDEX "board_reports_user_id_idx" ON "board_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boardroom_messages_session_id_idx" ON "boardroom_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "boardroom_messages_agent_id_idx" ON "boardroom_messages" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "boardroom_sessions_user_id_idx" ON "boardroom_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tribe_blueprints_user_id_idx" ON "tribe_blueprints" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "war_room_sessions_user_id_idx" ON "war_room_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_user_id_idx" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creative_assets_user_id_idx" ON "creative_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creative_assets_campaign_id_idx" ON "creative_assets" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_stack_user_id_idx" ON "users" USING btree ("stack_user_id");--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "learning_modules_path_id_idx" ON "learning_modules" USING btree ("path_id");--> statement-breakpoint
CREATE INDEX "learning_paths_category_idx" ON "learning_paths" USING btree ("category");--> statement-breakpoint
CREATE INDEX "learning_paths_difficulty_idx" ON "learning_paths" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "user_learning_progress_user_id_idx" ON "user_learning_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_learning_progress_module_id_idx" ON "user_learning_progress" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_learning_progress_user_module_idx" ON "user_learning_progress" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE INDEX "briefcases_user_id_idx" ON "briefcases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "focus_sessions_user_id_idx" ON "focus_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_briefcase_id_idx" ON "goals" USING btree ("briefcase_id");--> statement-breakpoint
CREATE INDEX "productivity_insights_user_id_idx" ON "productivity_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_analytics_user_id_idx" ON "task_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_analytics_task_id_idx" ON "task_analytics" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_categories_user_id_idx" ON "task_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_goal_id_idx" ON "tasks" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "tasks_briefcase_id_idx" ON "tasks" USING btree ("briefcase_id");--> statement-breakpoint
CREATE INDEX "templates_user_id_idx" ON "templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "templates_tier_idx" ON "templates" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "competitors_user_id_idx" ON "competitors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_down_template_id_idx" ON "template_downloads" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_down_user_id_idx" ON "template_downloads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_exec_workflow_id_idx" ON "workflow_executions" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_exec_user_id_idx" ON "workflow_executions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_temp_category_idx" ON "workflow_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "workflows_user_id_idx" ON "workflows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_competitive_stats_user_id_idx" ON "user_competitive_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mood_entries_user_id_idx" ON "mood_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mood_entries_created_at_idx" ON "mood_entries" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stack_user_id_unique" UNIQUE("stack_user_id");