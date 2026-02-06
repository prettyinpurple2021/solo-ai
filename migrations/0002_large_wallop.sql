CREATE TABLE "learning_paths" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"created_by" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "custom_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"schedule" jsonb,
	"is_favorite" boolean DEFAULT false,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
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
CREATE TABLE "post_reactions" (
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(20) DEFAULT 'like' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_reactions_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
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
	"metadata" jsonb DEFAULT '{}',
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
CREATE TABLE "collaboration_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"goal" text NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"configuration" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
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
CREATE TABLE "mood_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"energy_level" integer NOT NULL,
	"mood_label" varchar(50),
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "energy_check" CHECK ("mood_entries"."energy_level" >= 1 AND "mood_entries"."energy_level" <= 5)
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "comment_likes_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
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
CREATE TABLE "post_likes" (
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "quiz_scores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "skill_assessments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "quiz_scores" CASCADE;--> statement-breakpoint
DROP TABLE "skill_assessments" CASCADE;--> statement-breakpoint
DROP TABLE "user_progress" CASCADE;--> statement-breakpoint
ALTER TABLE "focus_sessions" DROP CONSTRAINT "focus_sessions_task_id_tasks_id_fk";
--> statement-breakpoint
DROP INDEX "document_activity_action_idx";--> statement-breakpoint
DROP INDEX "document_activity_created_at_idx";--> statement-breakpoint
DROP INDEX "feedback_user_id_idx";--> statement-breakpoint
DROP INDEX "feedback_type_idx";--> statement-breakpoint
DROP INDEX "feedback_status_idx";--> statement-breakpoint
DROP INDEX "learning_modules_category_idx";--> statement-breakpoint
DROP INDEX "learning_modules_difficulty_idx";--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "priority" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "started_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "started_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "focus_sessions" ALTER COLUMN "duration_minutes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "duration_minutes" SET DEFAULT 15;--> statement-breakpoint
ALTER TABLE "learning_modules" ALTER COLUMN "duration_minutes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_tier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "onboarding_completed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_activity" ADD COLUMN "timestamp" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "file_url" varchar(2048) NOT NULL;--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "storage_provider" varchar(50);--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "checksum" varchar(128);--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD COLUMN "status" varchar(50) DEFAULT 'completed';--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD COLUMN "xp_earned" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "path_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "module_type" varchar(50) DEFAULT 'article';--> statement-breakpoint
ALTER TABLE "learning_modules" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "image" varchar(1000);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "comments_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "shares_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "tags" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "achievement_context" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "template_slug" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_checkpoints" ADD CONSTRAINT "collaboration_checkpoints_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_topic_id_community_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."community_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_reports_user_id_idx" ON "custom_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_comments_author_id_idx" ON "post_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "post_reactions_post_id_idx" ON "post_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_reactions_user_id_idx" ON "post_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collaboration_checkpoints_session_id_idx" ON "collaboration_checkpoints" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "collaboration_messages_session_id_idx" ON "collaboration_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "collaboration_messages_created_at_idx" ON "collaboration_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "collaboration_participants_session_id_idx" ON "collaboration_participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "collaboration_participants_agent_id_idx" ON "collaboration_participants" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "collaboration_sessions_user_id_idx" ON "collaboration_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challenge_participants_challenge_id_idx" ON "challenge_participants" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "challenge_participants_user_id_idx" ON "challenge_participants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_participants_unique_idx" ON "challenge_participants" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "challenges_is_active_idx" ON "challenges" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "challenges_deadline_idx" ON "challenges" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "challenges_category_idx" ON "challenges" USING btree ("category");--> statement-breakpoint
CREATE INDEX "comment_likes_comment_id_idx" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_likes_user_id_idx" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_comments_post_id_idx" ON "community_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "community_comments_user_id_idx" ON "community_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_comments_parent_id_idx" ON "community_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "community_posts_user_id_idx" ON "community_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_posts_topic_id_idx" ON "community_posts" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "community_posts_created_at_idx" ON "community_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_likes_post_id_idx" ON "post_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_likes_user_id_idx" ON "post_likes" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_unique_idx" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
ALTER TABLE "document_activity" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "document_activity" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "document_activity" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "document_versions" DROP COLUMN "file_data";--> statement-breakpoint
ALTER TABLE "focus_sessions" DROP COLUMN "ended_at";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "difficulty";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "skills_covered";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "prerequisites";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "is_published";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "learning_modules" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
DROP TYPE "public"."feedback_priority";