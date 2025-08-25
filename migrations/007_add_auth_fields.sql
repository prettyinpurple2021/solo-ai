-- Add authentication fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create briefcases table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS briefcases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add briefcase_id to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS briefcase_id UUID REFERENCES briefcases(id) ON DELETE CASCADE;

-- Add briefcase_id to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS briefcase_id UUID REFERENCES briefcases(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_briefcases_user_id ON briefcases(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_briefcase_id ON goals(briefcase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_briefcase_id ON tasks(briefcase_id);
