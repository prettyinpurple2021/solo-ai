-- Add missing index on user_templates for user_id + created_at
-- This improves performance for queries that sort templates by creation date

-- Create the index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_templates_user_created ON user_templates(user_id, created_at);

-- Verify updated_at triggers on all tables
-- This ensures all tables have proper updated_at functionality

-- Create standardized function for handling updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace triggers for user_templates
DROP TRIGGER IF EXISTS update_user_templates_updated_at ON user_templates;
CREATE TRIGGER update_user_templates_updated_at 
  BEFORE UPDATE ON user_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Create idempotency_keys table for API request idempotency
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  data JSONB
);

-- Create index for idempotency_keys expiration
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);
