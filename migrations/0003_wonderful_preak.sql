ALTER TABLE "competitor_alerts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "competitor_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ALTER COLUMN "intelligence_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "competitor_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "intelligence_data" ALTER COLUMN "user_id" SET DATA TYPE uuid;