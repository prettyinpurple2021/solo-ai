-- Migration: Add Competitor Intelligence Tables
-- Created: 2025-08-30
-- Description: Creates tables for competitor profiles, intelligence data, and alerts

-- Create competitor_profiles table
CREATE TABLE IF NOT EXISTS "competitor_profiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
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

-- Create intelligence_data table
CREATE TABLE IF NOT EXISTS "intelligence_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "intelligence_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"user_id" integer NOT NULL,
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

-- Create competitor_alerts table
CREATE TABLE IF NOT EXISTS "competitor_alerts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_alerts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"user_id" integer NOT NULL,
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

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "competitor_profiles" ADD CONSTRAINT "competitor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_intelligence_id_intelligence_data_id_fk" FOREIGN KEY ("intelligence_id") REFERENCES "intelligence_data"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS "competitor_profiles_user_id_idx" ON "competitor_profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "competitor_profiles_threat_level_idx" ON "competitor_profiles" ("threat_level");
CREATE INDEX IF NOT EXISTS "competitor_profiles_monitoring_status_idx" ON "competitor_profiles" ("monitoring_status");
CREATE INDEX IF NOT EXISTS "competitor_profiles_domain_idx" ON "competitor_profiles" ("domain");
CREATE INDEX IF NOT EXISTS "competitor_profiles_industry_idx" ON "competitor_profiles" ("industry");

CREATE INDEX IF NOT EXISTS "intelligence_data_competitor_id_idx" ON "intelligence_data" ("competitor_id");
CREATE INDEX IF NOT EXISTS "intelligence_data_user_id_idx" ON "intelligence_data" ("user_id");
CREATE INDEX IF NOT EXISTS "intelligence_data_source_type_idx" ON "intelligence_data" ("source_type");
CREATE INDEX IF NOT EXISTS "intelligence_data_data_type_idx" ON "intelligence_data" ("data_type");
CREATE INDEX IF NOT EXISTS "intelligence_data_importance_idx" ON "intelligence_data" ("importance");
CREATE INDEX IF NOT EXISTS "intelligence_data_collected_at_idx" ON "intelligence_data" ("collected_at");
CREATE INDEX IF NOT EXISTS "intelligence_data_expires_at_idx" ON "intelligence_data" ("expires_at");

CREATE INDEX IF NOT EXISTS "competitor_alerts_competitor_id_idx" ON "competitor_alerts" ("competitor_id");
CREATE INDEX IF NOT EXISTS "competitor_alerts_user_id_idx" ON "competitor_alerts" ("user_id");
CREATE INDEX IF NOT EXISTS "competitor_alerts_alert_type_idx" ON "competitor_alerts" ("alert_type");
CREATE INDEX IF NOT EXISTS "competitor_alerts_severity_idx" ON "competitor_alerts" ("severity");
CREATE INDEX IF NOT EXISTS "competitor_alerts_is_read_idx" ON "competitor_alerts" ("is_read");
CREATE INDEX IF NOT EXISTS "competitor_alerts_is_archived_idx" ON "competitor_alerts" ("is_archived");
CREATE INDEX IF NOT EXISTS "competitor_alerts_created_at_idx" ON "competitor_alerts" ("created_at");

-- Create database triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_competitor_profiles_updated_at 
    BEFORE UPDATE ON competitor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intelligence_data_updated_at 
    BEFORE UPDATE ON intelligence_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_alerts_updated_at 
    BEFORE UPDATE ON competitor_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE competitor_profiles IS 'Stores competitor company profiles with threat levels and monitoring configuration';
COMMENT ON TABLE intelligence_data IS 'Stores collected competitor intelligence data from various sources';
COMMENT ON TABLE competitor_alerts IS 'Stores real-time alerts and notifications about competitor activities';

COMMENT ON COLUMN competitor_profiles.threat_level IS 'Threat level: low, medium, high, critical';
COMMENT ON COLUMN competitor_profiles.monitoring_status IS 'Monitoring status: active, paused, archived';
COMMENT ON COLUMN intelligence_data.source_type IS 'Source type: website, social_media, news, job_posting, app_store, manual';
COMMENT ON COLUMN intelligence_data.importance IS 'Importance level: low, medium, high, critical';
COMMENT ON COLUMN competitor_alerts.severity IS 'Alert severity: info, warning, urgent, critical';