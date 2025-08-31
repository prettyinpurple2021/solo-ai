CREATE TABLE "competitor_alerts" (
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
--> statement-breakpoint
CREATE TABLE "competitor_profiles" (
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
--> statement-breakpoint
CREATE TABLE "intelligence_data" (
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
--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_intelligence_id_intelligence_data_id_fk" FOREIGN KEY ("intelligence_id") REFERENCES "public"."intelligence_data"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_profiles" ADD CONSTRAINT "competitor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_competitor_id_competitor_profiles_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_data" ADD CONSTRAINT "intelligence_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "intelligence_data_competitor_id_idx" ON "intelligence_data" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "intelligence_data_user_id_idx" ON "intelligence_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "intelligence_data_source_type_idx" ON "intelligence_data" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "intelligence_data_data_type_idx" ON "intelligence_data" USING btree ("data_type");--> statement-breakpoint
CREATE INDEX "intelligence_data_importance_idx" ON "intelligence_data" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "intelligence_data_collected_at_idx" ON "intelligence_data" USING btree ("collected_at");--> statement-breakpoint
CREATE INDEX "intelligence_data_expires_at_idx" ON "intelligence_data" USING btree ("expires_at");