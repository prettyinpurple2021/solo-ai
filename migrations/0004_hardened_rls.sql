
-- Enable RLS on core tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "briefcases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user ID from the session/JWT
-- Note: In a production environment with Neon/Postgres, we typically set this 
-- via `SET LOCAL auth.user_id = '...'` in the transaction.
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
  SELECT current_setting('auth.user_id', true);
$$ LANGUAGE sql STABLE;

-- Users Policies
-- Users can only see and update their own profile
CREATE POLICY users_isolation_policy ON "users"
  FOR ALL
  USING (id = current_user_id())
  WITH CHECK (id = current_user_id());

-- Briefcases Policies
-- Users can only manage their own briefcases
CREATE POLICY briefcases_isolation_policy ON "briefcases"
  FOR ALL
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- Tasks Policies
-- Users can only manage their own tasks
CREATE POLICY tasks_isolation_policy ON "tasks"
  FOR ALL
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- Add physical CHECK constraints for data integrity
ALTER TABLE "users" ADD CONSTRAINT users_level_check CHECK (level > 0);
ALTER TABLE "users" ADD CONSTRAINT users_xp_check CHECK (xp >= 0);
ALTER TABLE "tasks" ADD CONSTRAINT tasks_estimated_minutes_check CHECK (estimated_minutes >= 0);
