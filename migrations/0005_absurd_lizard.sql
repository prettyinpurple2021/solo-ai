DROP INDEX "assessment_submissions_user_id_idx";--> statement-breakpoint
ALTER TABLE "assessment_submissions" ALTER COLUMN "answers_data" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "assessments" ALTER COLUMN "questions_data" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "briefcase_items" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefcases" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "achievement_context" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "assessment_submissions_user_assessment_idx" ON "assessment_submissions" USING btree ("user_id","assessment_id");--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "chk_learning_score_range" CHECK ("assessment_submissions"."score" BETWEEN 0 AND 100);--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "chk_learning_passing_score_range" CHECK ("assessments"."passing_score" BETWEEN 0 AND 100);--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "chk_user_skills_level" CHECK ("user_skills"."current_level" >= 1);--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "chk_user_skills_xp" CHECK ("user_skills"."current_xp" >= 0);