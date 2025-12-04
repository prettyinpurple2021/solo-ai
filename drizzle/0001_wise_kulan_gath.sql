CREATE TABLE "session_checkpoints" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"state" jsonb NOT NULL,
	"message_history" jsonb DEFAULT '[]',
	"agent_states" jsonb DEFAULT '{}',
	"user_context" jsonb DEFAULT '{}',
	"description" text
);
--> statement-breakpoint
ALTER TABLE "session_checkpoints" ADD CONSTRAINT "session_checkpoints_session_id_collaboration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."collaboration_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_checkpoints_session_id_idx" ON "session_checkpoints" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_checkpoints_timestamp_idx" ON "session_checkpoints" USING btree ("timestamp");