-- Enhanced To-Do List Schema Extensions
-- Migration: 008_enhanced_todo_schema.sql

-- Extend existing tasks table with new columns for enhanced functionality
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
ADD COLUMN IF NOT EXISTS actual_minutes INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS energy_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
ADD COLUMN IF NOT EXISTS parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;

-- Create task categories table
CREATE TABLE IF NOT EXISTS task_categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#8B5CF6',
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create task analytics table for tracking user interactions
CREATE TABLE IF NOT EXISTS task_analytics (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'started', 'completed', 'postponed', 'deleted'
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create productivity insights table for AI-generated insights
CREATE TABLE IF NOT EXISTS productivity_insights (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    date DATE NOT NULL,
    metrics JSONB NOT NULL,
    ai_recommendations JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, insight_type, date)
);

-- Add database indexes for optimal query performance

-- Task table indexes
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

-- Insert default task categories for new users
INSERT INTO task_categories (user_id, name, color, icon, is_default)
SELECT 
    u.id,
    category.name,
    category.color,
    category.icon,
    true
FROM users u
CROSS JOIN (
    VALUES 
        ('Work', '#8B5CF6', 'briefcase'),
        ('Personal', '#EC4899', 'user'),
        ('Health', '#10B981', 'heart'),
        ('Learning', '#F59E0B', 'book'),
        ('Finance', '#EF4444', 'dollar-sign'),
        ('Home', '#6366F1', 'home'),
        ('Social', '#8B5A2B', 'users'),
        ('Creative', '#F97316', 'palette')
) AS category(name, color, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM task_categories tc 
    WHERE tc.user_id = u.id AND tc.name = category.name
);

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