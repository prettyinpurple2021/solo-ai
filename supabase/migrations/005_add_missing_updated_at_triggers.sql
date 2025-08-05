-- =============================================
-- Fix Missing updated_at Triggers
-- =============================================
-- This migration adds the missing trigger for ai_agents table
-- to ensure updated_at timestamps are automatically updated

-- Add missing trigger for ai_agents table
-- Note: The update_updated_at_column() function already exists from migration 001
CREATE TRIGGER update_ai_agents_updated_at
    BEFORE UPDATE ON ai_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();