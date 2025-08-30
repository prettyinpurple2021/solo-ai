-- Enhanced To-Do List Indexes and Constraints
-- Migration: 0002_enhanced_todo_indexes.sql

-- Task table indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_priority ON tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_category ON tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_energy_level ON tasks(energy_level);
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring);

-- Task categories indexes
CREATE INDEX IF NOT EXISTS idx_task_categories_user_id ON task_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_task_categories_name ON task_categories(name);
CREATE INDEX IF NOT EXISTS idx_task_categories_is_default ON task_categories(is_default);

-- Task analytics indexes
CREATE INDEX IF NOT EXISTS idx_task_analytics_user_id ON task_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_task_id ON task_analytics(task_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_action ON task_analytics(action);
CREATE INDEX IF NOT EXISTS idx_task_analytics_timestamp ON task_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_task_analytics_user_action_timestamp ON task_analytics(user_id, action, timestamp);

-- Productivity insights indexes
CREATE INDEX IF NOT EXISTS idx_productivity_insights_user_id ON productivity_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_type_date ON productivity_insights(insight_type, date);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_user_type_date ON productivity_insights(user_id, insight_type, date);

-- GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_tasks_tags_gin ON tasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tasks_ai_suggestions_gin ON tasks USING GIN (ai_suggestions);
CREATE INDEX IF NOT EXISTS idx_task_analytics_metadata_gin ON task_analytics USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_metrics_gin ON productivity_insights USING GIN (metrics);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_ai_recommendations_gin ON productivity_insights USING GIN (ai_recommendations);

-- Add unique constraints
ALTER TABLE task_categories ADD CONSTRAINT IF NOT EXISTS unique_user_category_name UNIQUE(user_id, name);
ALTER TABLE productivity_insights ADD CONSTRAINT IF NOT EXISTS unique_user_insight_type_date UNIQUE(user_id, insight_type, date);

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to task_categories table
DROP TRIGGER IF EXISTS update_task_categories_updated_at ON task_categories;
CREATE TRIGGER update_task_categories_updated_at
    BEFORE UPDATE ON task_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tasks table (if not already exists)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();