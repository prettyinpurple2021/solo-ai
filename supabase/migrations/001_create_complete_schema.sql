-- =============================================
-- SoloBoss AI Complete Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER TABLES
-- =============================================

-- Profiles table (already exists, but updating with additional fields)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wellness_score INTEGER DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS focus_minutes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_ai_agent TEXT DEFAULT 'roxy';

-- =============================================
-- SLAYLIST (GOALS & TASKS) TABLES
-- =============================================

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- AI Agents configuration
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    title TEXT,
    context JSONB DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BRIEFCASE (DOCUMENT MANAGEMENT)
-- =============================================

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    folder TEXT DEFAULT 'general',
    tags TEXT[],
    is_ai_processed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    ai_insights JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT FALSE,
    template_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document versions (for version control)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT,
    file_url TEXT,
    changes_summary TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BRANDSTYLE (BRAND MANAGEMENT)
-- =============================================

-- Brand profiles
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    industry TEXT,
    target_audience TEXT,
    brand_voice TEXT,
    color_palette JSONB DEFAULT '[]',
    fonts JSONB DEFAULT '{}',
    logo_url TEXT,
    style_guide JSONB DEFAULT '{}',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand assets
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('logo', 'image', 'template', 'copy', 'video', 'other')),
    file_url TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BURNOUT SHIELD & FOCUS TRACKING
-- =============================================

-- Focus sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    planned_minutes INTEGER NOT NULL,
    actual_minutes INTEGER DEFAULT 0,
    mode TEXT DEFAULT 'focus' CHECK (mode IN ('focus', 'break', 'deep_work', 'planning')),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness tracking
CREATE TABLE IF NOT EXISTS wellness_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 5),
    sleep_hours DECIMAL(3,1),
    exercise_minutes INTEGER DEFAULT 0,
    meditation_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================
-- COLLABORATION & TEAM FEATURES
-- =============================================

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- =============================================
-- GAMIFICATION & ACHIEVEMENTS
-- =============================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- ANALYTICS & INSIGHTS
-- =============================================

-- Daily stats
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_completed INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    ai_interactions INTEGER DEFAULT 0,
    documents_created INTEGER DEFAULT 0,
    goals_achieved INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    wellness_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- AI conversations indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_id ON ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Focus sessions indexes
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);

-- Daily stats indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id_date ON daily_stats(user_id, date);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-owned data
CREATE POLICY "Users can view their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON ai_messages
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM ai_conversations WHERE id = conversation_id
        )
    );

CREATE POLICY "Users can view their own documents" ON documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own document versions" ON document_versions
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own brand profiles" ON brand_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own brand assets" ON brand_assets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own focus sessions" ON focus_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wellness entries" ON wellness_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily stats" ON daily_stats
    FOR ALL USING (auth.uid() = user_id);

-- Team policies
CREATE POLICY "Team members can view team data" ON teams
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (SELECT user_id FROM team_members WHERE team_id = id)
    );

CREATE POLICY "Team owners can manage teams" ON teams
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view membership" ON team_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT owner_id FROM teams WHERE id = team_id)
    );

-- AI Agents are public (read-only)
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active AI agents" ON ai_agents
    FOR SELECT USING (is_active = true);

-- Achievements are public (read-only)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active achievements" ON achievements
    FOR SELECT USING (is_active = true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
    BEFORE UPDATE ON brand_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at
    BEFORE UPDATE ON brand_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_sessions_updated_at
    BEFORE UPDATE ON focus_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_entries_updated_at
    BEFORE UPDATE ON wellness_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA: AI AGENTS
-- =============================================

INSERT INTO ai_agents (name, display_name, description, personality, capabilities, accent_color, system_prompt) VALUES
(
    'roxy',
    'Roxy',
    'Your executive assistant who handles scheduling, organization, and business operations',
    'Professional, organized, proactive, and detail-oriented. Speaks like a competent executive assistant.',
    ARRAY['scheduling', 'organization', 'email_management', 'task_coordination', 'meeting_planning'],
    '#6366F1',
    'You are Roxy, a highly competent executive assistant AI. You help users manage their schedules, organize tasks, coordinate meetings, and handle business operations. You are professional, proactive, and incredibly detail-oriented. You anticipate needs and provide comprehensive solutions.'
),
(
    'blaze',
    'Blaze',
    'Your growth strategist focused on scaling businesses and explosive growth tactics',
    'Energetic, ambitious, data-driven, and results-focused. Uses dynamic language and growth terminology.',
    ARRAY['growth_strategy', 'marketing_funnels', 'data_analysis', 'scaling_tactics', 'conversion_optimization'],
    '#F59E0B',
    'You are Blaze, a high-energy growth strategist AI. You focus on explosive business growth, scaling strategies, and data-driven tactics. You speak with enthusiasm about growth opportunities and always push for ambitious goals. You love metrics, conversion rates, and scaling strategies.'
),
(
    'echo',
    'Echo',
    'Your marketing maven who creates compelling content and manages brand presence',
    'Creative, trendy, brand-conscious, and audience-focused. Speaks in marketing terminology with creative flair.',
    ARRAY['content_creation', 'social_media', 'brand_strategy', 'copywriting', 'campaign_management'],
    '#EC4899',
    'You are Echo, a creative marketing maven AI. You excel at content creation, social media strategy, and brand development. You speak with creative flair and understand current trends. You help create compelling copy, manage brand presence, and develop engaging campaigns.'
),
(
    'lumi',
    'Lumi',
    'Your legal and documentation specialist ensuring compliance and professional standards',
    'Precise, thorough, compliance-focused, and protective. Uses formal language and legal terminology.',
    ARRAY['legal_documents', 'compliance', 'contract_review', 'risk_assessment', 'documentation'],
    '#3B82F6',
    'You are Lumi, a legal and documentation specialist AI. You ensure compliance, review contracts, assess risks, and maintain professional standards. You speak formally and precisely, always considering legal implications and protective measures.'
),
(
    'vex',
    'Vex',
    'Your technical architect handling systems, automation, and technical solutions',
    'Logical, systematic, solution-oriented, and technically precise. Uses technical terminology and systematic approaches.',
    ARRAY['system_architecture', 'automation', 'technical_analysis', 'integration', 'optimization'],
    '#10B981',
    'You are Vex, a technical architect AI. You handle system design, automation, technical analysis, and integration solutions. You think systematically and speak in technical terms. You focus on efficiency, scalability, and technical optimization.'
),
(
    'lexi',
    'Lexi',
    'Your strategy analyst providing insights, research, and data-driven recommendations',
    'Analytical, insightful, research-focused, and strategic. Uses data-driven language and strategic terminology.',
    ARRAY['market_research', 'data_analysis', 'strategic_planning', 'competitive_analysis', 'insights'],
    '#8B5CF6',
    'You are Lexi, a strategy analyst AI. You provide deep insights, conduct research, and offer data-driven recommendations. You speak analytically and strategically, always backing recommendations with data and research.'
),
(
    'nova',
    'Nova',
    'Your product designer creating user experiences and innovative design solutions',
    'Innovative, user-focused, aesthetically minded, and iterative. Uses design terminology and user-centric language.',
    ARRAY['ui_design', 'ux_research', 'prototyping', 'user_testing', 'design_systems'],
    '#06B6D4',
    'You are Nova, a product designer AI. You focus on user experience, innovative design, and creating intuitive interfaces. You speak about design principles, user needs, and iterative improvement. You balance aesthetics with functionality.'
),
(
    'glitch',
    'Glitch',
    'Your QA and debugging specialist finding issues and ensuring quality standards',
    'Detail-oriented, systematic, quality-focused, and thorough. Uses testing terminology and quality assurance language.',
    ARRAY['quality_assurance', 'bug_detection', 'testing', 'validation', 'error_analysis'],
    '#EF4444',
    'You are Glitch, a QA and debugging specialist AI. You find issues, ensure quality standards, and systematically test solutions. You speak precisely about quality metrics, testing procedures, and error prevention. You are thorough and detail-oriented.'
);

-- =============================================
-- INITIAL DATA: ACHIEVEMENTS
-- =============================================

INSERT INTO achievements (name, title, description, icon, category, points, criteria) VALUES
('first_goal', 'Goal Setter', 'Created your first goal', '🎯', 'goals', 50, '{"goals_created": 1}'),
('task_master', 'Task Master', 'Completed 10 tasks', '✅', 'productivity', 100, '{"tasks_completed": 10}'),
('focus_warrior', 'Focus Warrior', 'Completed 5 focus sessions', '🧘', 'focus', 150, '{"focus_sessions": 5}'),
('ai_collaborator', 'AI Collaborator', 'Had 25 conversations with AI agents', '🤖', 'ai', 200, '{"ai_interactions": 25}'),
('document_organizer', 'Document Organizer', 'Uploaded 10 documents', '📁', 'organization', 100, '{"documents_uploaded": 10}'),
('streak_starter', 'Streak Starter', 'Maintained a 7-day streak', '🔥', 'consistency', 300, '{"daily_streak": 7}'),
('wellness_champion', 'Wellness Champion', 'Logged wellness data for 14 days', '💚', 'wellness', 250, '{"wellness_days": 14}'),
('brand_builder', 'Brand Builder', 'Created your first brand profile', '🎨', 'branding', 150, '{"brand_profiles": 1}');

-- =============================================
-- FUNCTIONS FOR ANALYTICS & AUTOMATION
-- =============================================

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(
    p_user_id UUID,
    p_stat_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_stats (user_id, date, tasks_completed, focus_minutes, ai_interactions, documents_created, goals_achieved)
    VALUES (p_user_id, CURRENT_DATE, 
        CASE WHEN p_stat_type = 'tasks_completed' THEN p_increment ELSE 0 END,
        CASE WHEN p_stat_type = 'focus_minutes' THEN p_increment ELSE 0 END,
        CASE WHEN p_stat_type = 'ai_interactions' THEN p_increment ELSE 0 END,
        CASE WHEN p_stat_type = 'documents_created' THEN p_increment ELSE 0 END,
        CASE WHEN p_stat_type = 'goals_achieved' THEN p_increment ELSE 0 END
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        tasks_completed = daily_stats.tasks_completed + 
            CASE WHEN p_stat_type = 'tasks_completed' THEN p_increment ELSE 0 END,
        focus_minutes = daily_stats.focus_minutes + 
            CASE WHEN p_stat_type = 'focus_minutes' THEN p_increment ELSE 0 END,
        ai_interactions = daily_stats.ai_interactions + 
            CASE WHEN p_stat_type = 'ai_interactions' THEN p_increment ELSE 0 END,
        documents_created = daily_stats.documents_created + 
            CASE WHEN p_stat_type = 'documents_created' THEN p_increment ELSE 0 END,
        goals_achieved = daily_stats.goals_achieved + 
            CASE WHEN p_stat_type = 'goals_achieved' THEN p_increment ELSE 0 END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_name TEXT, title TEXT, points INTEGER) AS $$
BEGIN
    -- This would contain logic to check various achievement criteria
    -- and award achievements to users based on their activity
    -- For now, return empty result
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user level and points
CREATE OR REPLACE FUNCTION update_user_gamification(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    total_tasks INTEGER;
    total_focus INTEGER;
    total_goals INTEGER;
    new_points INTEGER;
    new_level INTEGER;
BEGIN
    -- Calculate total achievements
    SELECT 
        COALESCE(SUM(tasks_completed), 0),
        COALESCE(SUM(focus_minutes), 0),
        COALESCE(SUM(goals_achieved), 0)
    INTO total_tasks, total_focus, total_goals
    FROM daily_stats
    WHERE user_id = p_user_id;
    
    -- Calculate points (simplified formula)
    new_points := (total_tasks * 10) + (total_focus / 5) + (total_goals * 50);
    
    -- Calculate level (every 500 points = 1 level)
    new_level := GREATEST(1, new_points / 500);
    
    -- Update profile
    UPDATE profiles 
    SET 
        total_points = new_points,
        level = new_level,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql; 