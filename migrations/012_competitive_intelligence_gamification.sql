-- Competitive Intelligence Gamification Tables

-- User Competitive Stats table
CREATE TABLE IF NOT EXISTS user_competitive_stats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competitors_monitored INTEGER DEFAULT 0,
  intelligence_gathered INTEGER DEFAULT 0,
  alerts_processed INTEGER DEFAULT 0,
  opportunities_identified INTEGER DEFAULT 0,
  competitive_tasks_completed INTEGER DEFAULT 0,
  market_victories INTEGER DEFAULT 0,
  threat_responses INTEGER DEFAULT 0,
  intelligence_streaks INTEGER DEFAULT 0,
  competitive_advantage_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Achievements table (if not exists)
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(255) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- User Competitive Badges table
CREATE TABLE IF NOT EXISTS user_competitive_badges (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(255) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Competitive Victories table
CREATE TABLE IF NOT EXISTS competitive_victories (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  competitor_name VARCHAR(255) NOT NULL,
  victory_type VARCHAR(50) NOT NULL CHECK (victory_type IN ('market_share_gain', 'pricing_advantage', 'product_superiority', 'talent_acquisition', 'crisis_response')),
  impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('minor', 'moderate', 'major', 'game_changing')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  evidence JSONB DEFAULT '[]',
  achieved_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Competitive Intelligence Challenges table
CREATE TABLE IF NOT EXISTS competitive_challenges (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  objectives JSONB NOT NULL DEFAULT '[]',
  total_points INTEGER NOT NULL DEFAULT 0,
  completed_objectives INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Competitive Intelligence Leaderboard table
CREATE TABLE IF NOT EXISTS competitive_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competitive_advantage_points INTEGER NOT NULL DEFAULT 0,
  market_victories INTEGER NOT NULL DEFAULT 0,
  intelligence_gathered INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  percentile DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_competitive_stats_user_id ON user_competitive_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competitive_stats_points ON user_competitive_stats(competitive_advantage_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competitive_badges_user_id ON user_competitive_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_competitive_victories_user_id ON competitive_victories(user_id);
CREATE INDEX IF NOT EXISTS idx_competitive_victories_achieved_at ON competitive_victories(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitive_challenges_user_id ON competitive_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_competitive_challenges_status ON competitive_challenges(status);
CREATE INDEX IF NOT EXISTS idx_competitive_leaderboard_rank ON competitive_leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_competitive_leaderboard_points ON competitive_leaderboard(competitive_advantage_points DESC);

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
    ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_points') THEN
    ALTER TABLE users ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_streak') THEN
    ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
    ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tasks_completed') THEN
    ALTER TABLE users ADD COLUMN tasks_completed INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'goals_achieved') THEN
    ALTER TABLE users ADD COLUMN goals_achieved INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'focus_minutes') THEN
    ALTER TABLE users ADD COLUMN focus_minutes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wellness_score') THEN
    ALTER TABLE users ADD COLUMN wellness_score INTEGER DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'collaboration_sessions') THEN
    ALTER TABLE users ADD COLUMN collaboration_sessions INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add ai_suggestions column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'ai_suggestions') THEN
    ALTER TABLE goals ADD COLUMN ai_suggestions JSONB DEFAULT '{}';
  END IF;
END $$;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_competitive_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert leaderboard entry
  INSERT INTO competitive_leaderboard (
    user_id, 
    competitive_advantage_points, 
    market_victories, 
    intelligence_gathered,
    last_updated
  )
  VALUES (
    NEW.user_id,
    NEW.competitive_advantage_points,
    NEW.market_victories,
    NEW.intelligence_gathered,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    competitive_advantage_points = NEW.competitive_advantage_points,
    market_victories = NEW.market_victories,
    intelligence_gathered = NEW.intelligence_gathered,
    last_updated = NOW();
  
  -- Update rankings for all users
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY competitive_advantage_points DESC, market_victories DESC) as new_rank,
      PERCENT_RANK() OVER (ORDER BY competitive_advantage_points DESC) * 100 as new_percentile
    FROM competitive_leaderboard
  )
  UPDATE competitive_leaderboard cl
  SET 
    rank_position = ru.new_rank,
    percentile = ROUND(ru.new_percentile::numeric, 2)
  FROM ranked_users ru
  WHERE cl.user_id = ru.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard when competitive stats change
DROP TRIGGER IF EXISTS trigger_update_competitive_leaderboard ON user_competitive_stats;
CREATE TRIGGER trigger_update_competitive_leaderboard
  AFTER INSERT OR UPDATE ON user_competitive_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_competitive_leaderboard();

-- Function to automatically create competitive stats for new users
CREATE OR REPLACE FUNCTION create_user_competitive_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_competitive_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create competitive stats for new users
DROP TRIGGER IF EXISTS trigger_create_user_competitive_stats ON users;
CREATE TRIGGER trigger_create_user_competitive_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_competitive_stats();

-- Insert initial competitive stats for existing users
INSERT INTO user_competitive_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;