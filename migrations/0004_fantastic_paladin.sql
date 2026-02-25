CREATE TABLE "assessment_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers_data" jsonb DEFAULT '{}' NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"questions_data" jsonb DEFAULT '[]' NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"is_adaptive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"skill_name" varchar(255) NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"current_xp" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_submissions_user_id_idx" ON "assessment_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assessment_submissions_assessment_id_idx" ON "assessment_submissions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "assessments_module_id_idx" ON "assessments" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "user_skills_user_id_idx" ON "user_skills" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_skills_user_skill_idx" ON "user_skills" USING btree ("user_id","skill_name");