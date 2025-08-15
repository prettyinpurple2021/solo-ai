-- Create the table to store user integration details
CREATE TABLE "user_integrations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "profiles" ("id") ON DELETE CASCADE,
    "provider" text NOT NULL,
    "access_token" text NOT NULL,
    "refresh_token" text,
    "expires_at" timestamptz,
    "scopes" text[],
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Add a unique constraint to prevent multiple integrations of the same type for a single user
ALTER TABLE "user_integrations"
ADD CONSTRAINT "user_integrations_user_id_provider_key"
UNIQUE ("user_id", "provider");

-- Add an index on user_id for faster lookups
CREATE INDEX "user_integrations_user_id_idx" ON "user_integrations" ("user_id");

-- Add comments to the table and columns for clarity
COMMENT ON TABLE "user_integrations" IS 'Stores OAuth credentials and details for third-party integrations for each user.';
COMMENT ON COLUMN "user_integrations"."user_id" IS 'The ID of the user who owns this integration.';
COMMENT ON COLUMN "user_integrations"."provider" IS 'The name of the third-party provider (e.g., google, slack).';
COMMENT ON COLUMN "user_integrations"."access_token" IS 'The encrypted OAuth access token.';
COMMENT ON COLUMN "user_integrations"."refresh_token" IS 'The encrypted OAuth refresh token.';
COMMENT ON COLUMN "user_integrations"."expires_at" IS 'The timestamp when the access token expires.';
COMMENT ON COLUMN "user_integrations"."scopes" IS 'The OAuth scopes granted by the user.';

-- Assuming the handle_updated_at function from migration 005 exists
-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER "on_user_integrations_updated"
BEFORE UPDATE ON "user_integrations"
FOR EACH ROW
EXECUTE FUNCTION "public"."handle_updated_at"();
