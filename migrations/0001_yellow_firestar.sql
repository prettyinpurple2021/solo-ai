CREATE TABLE "briefcases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "briefcases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'active',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"user_id" integer NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"metrics" jsonb NOT NULL,
	"ai_recommendations" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_analytics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_analytics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "task_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#8B5CF6',
	"icon" varchar(50),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "template_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "focus_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_achievements" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "achievements" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_agents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "documents" CASCADE;--> statement-breakpoint
DROP TABLE "template_categories" CASCADE;--> statement-breakpoint
DROP TABLE "user_templates" CASCADE;--> statement-breakpoint
DROP TABLE "focus_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "user_achievements" CASCADE;--> statement-breakpoint
DROP TABLE "achievements" CASCADE;--> statement-breakpoint
DROP TABLE "ai_agents" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_key";--> statement-breakpoint
ALTER TABLE "templates" DROP CONSTRAINT "templates_slug_key";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "goals_priority_check";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "goals_status_check";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "goals_progress_check";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_priority_check";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_status_check";--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_goal_id_fkey";
--> statement-breakpoint
ALTER TABLE "templates" DROP CONSTRAINT "templates_category_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_goals_deadline";--> statement-breakpoint
DROP INDEX "idx_goals_user_id";--> statement-breakpoint
DROP INDEX "idx_tasks_due_date";--> statement-breakpoint
DROP INDEX "idx_tasks_goal_id";--> statement-breakpoint
DROP INDEX "idx_tasks_user_id";--> statement-breakpoint
DROP INDEX "idx_templates_slug";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "goals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "priority" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "priority" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "goal_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "completed_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_tier" varchar(50) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(50) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "briefcase_id" integer;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "briefcase_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "category" varchar(100);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "tags" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimated_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "actual_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "energy_level" varchar(20) DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_recurring" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_pattern" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "ai_suggestions" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "category" varchar(100);--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "briefcases" ADD CONSTRAINT "briefcases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productivity_insights" ADD CONSTRAINT "productivity_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_analytics" ADD CONSTRAINT "task_analytics_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_briefcase_id_briefcases_id_fk" FOREIGN KEY ("briefcase_id") REFERENCES "public"."briefcases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "company_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "industry";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "business_type";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "notification_preferences";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "onboarding_completed";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "progress";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "deadline";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "is_interactive";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "required_role";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");