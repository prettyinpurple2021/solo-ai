-- Complete Neon Database Schema Migration
-- This migration ensures all necessary tables exist for the SoloBoss AI platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER TABLES
-- =============================================

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  wellness_score INTEGER DEFAULT 50,
  focus_minutes INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferred_ai_agent TEXT DEFAULT 'roxy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GOALS & TASKS TABLES
-- =============================================

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    target_date DATE,
    completion_date TIMESTAMP WITH TIME ZONE,
    ai_suggestions JSONB DEFAULT '[]',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_suggestions JSONB DEFAULT '[]',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AI AGENTS & CONVERSATIONS
-- =============================================

-- AI Agents table
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    personality TEXT NOT NULL,
    capabilities TEXT[],
    accent_color TEXT NOT NULL,
    avatar_url TEXT,
    system_prompt TEXT NOT NULL,
    model_preference TEXT DEFAULT 'gpt-4',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (for chat API)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENTS & FILES
-- =============================================

-- Documents table (for upload API)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    content TEXT NOT NULL, -- Base64 encoded file data
    category VARCHAR(100) DEFAULT 'general',
    folder VARCHAR(255) DEFAULT '/',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TEMPLATES
-- =============================================

-- Template categories table
CREATE TABLE IF NOT EXISTS template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
    is_interactive BOOLEAN DEFAULT false,
    required_role VARCHAR(50),
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User templates table
CREATE TABLE IF NOT EXISTS user_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'custom',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FOCUS SESSIONS & WELLNESS
-- =============================================

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
    interruptions INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ACHIEVEMENTS & GAMIFICATION
-- =============================================

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    category VARCHAR(50),
    points INTEGER DEFAULT 0,
    criteria JSONB, -- JSON object for achievement criteria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Templates indexes
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_category_id ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);

-- Focus sessions indexes
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_templates_updated_at BEFORE UPDATE ON user_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_focus_sessions_updated_at BEFORE UPDATE ON focus_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA FOR AI AGENTS
-- =============================================

-- Insert default AI agents if they don't exist
INSERT INTO ai_agents (name, display_name, description, personality, capabilities, accent_color, system_prompt) VALUES
('roxy', 'Roxy', 'Strategic Business Advisor', 'You are Roxy, a strategic business advisor who uses the SPADE framework for decision-making.', ARRAY['strategy', 'decision-making', 'business-planning'], '#8B5CF6', 'You are Roxy, a strategic business advisor. Use the SPADE framework for decision-making.'),
('blaze', 'Blaze', 'Growth & Marketing Expert', 'You are Blaze, a growth and marketing expert who uses cost-benefit analysis for recommendations.', ARRAY['marketing', 'growth', 'analytics'], '#EF4444', 'You are Blaze, a growth and marketing expert. Use cost-benefit analysis for recommendations.'),
('glitch', 'Glitch', 'Problem-Solving Specialist', 'You are Glitch, a problem-solving specialist who uses the Five Whys framework.', ARRAY['problem-solving', 'debugging', 'optimization'], '#10B981', 'You are Glitch, a problem-solving specialist. Use the Five Whys framework.'),
('lumi', 'Lumi', 'Compliance & Legal Expert', 'You are Lumi, a compliance and legal expert focused on GDPR, CCPA, and business compliance.', ARRAY['compliance', 'legal', 'regulations'], '#3B82F6', 'You are Lumi, a compliance and legal expert. Focus on GDPR, CCPA, and business compliance.'),
('nova', 'Nova', 'Productivity Coach', 'You are Nova, a productivity and time management coach.', ARRAY['productivity', 'time-management', 'organization'], '#F59E0B', 'You are Nova, a productivity and time management coach.'),
('echo', 'Echo', 'Communication Specialist', 'You are Echo, a communication and networking specialist.', ARRAY['communication', 'networking', 'relationships'], '#EC4899', 'You are Echo, a communication and networking specialist.'),
('vex', 'Vex', 'Technical Systems Expert', 'You are Vex, a technical and systems optimization expert.', ARRAY['technical', 'systems', 'optimization'], '#6366F1', 'You are Vex, a technical and systems optimization expert.'),
('lexi', 'Lexi', 'Creative Brand Strategist', 'You are Lexi, a creative and branding strategist.', ARRAY['creativity', 'branding', 'design'], '#06B6D4', 'You are Lexi, a creative and branding strategist.')
ON CONFLICT (name) DO NOTHING;
