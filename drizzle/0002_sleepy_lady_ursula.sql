CREATE TABLE "custom_workflows" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"steps" jsonb DEFAULT '[]',
	"status" varchar(50) DEFAULT 'pending',
	"results" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"metadata" jsonb DEFAULT '{}',
	"status" varchar(20) DEFAULT 'sent',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_favorites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "template_favorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"template_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_learning_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_learning_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"module_id" varchar(255) NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'started',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "custom_workflows" ADD CONSTRAINT "custom_workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_workflows_user_id_idx" ON "custom_workflows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_workflows_status_idx" ON "custom_workflows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "template_favorites_user_id_idx" ON "template_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_favorites_template_id_idx" ON "template_favorites" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "user_learning_progress_user_id_idx" ON "user_learning_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_learning_progress_module_id_idx" ON "user_learning_progress" USING btree ("module_id");