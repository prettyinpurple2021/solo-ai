-- =============================================
-- FIX: Add auto-updating updated_at triggers
-- =============================================

-- Function to handle auto-updating 'updated_at' columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;

-- Triggers to auto-update 'updated_at' on table updates
CREATE TRIGGER on_ai_agents_update
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_ai_conversations_update
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_update
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();