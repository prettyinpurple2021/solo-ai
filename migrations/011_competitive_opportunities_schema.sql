-- Create competitive opportunities table
CREATE TABLE IF NOT EXISTS competitive_opportunities (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competitor_id UUID NOT NULL REFERENCES competitor_profiles(id) ON DELETE CASCADE,
    intelligence_id UUID REFERENCES intelligence_data(id) ON DELETE SET NULL,
    opportunity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    impact VARCHAR(20) NOT NULL,
    effort VARCHAR(20) NOT NULL,
    timing VARCHAR(20) NOT NULL,
    priority_score DECIMAL(5,2) NOT NULL,
    evidence JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'identified',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    implementation_notes TEXT,
    roi_estimate DECIMAL(10,2),
    actual_roi DECIMAL(10,2),
    success_metrics JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    is_archived BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create opportunity actions table
CREATE TABLE IF NOT EXISTS opportunity_actions (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255) NOT NULL REFERENCES competitive_opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_effort_hours INTEGER,
    actual_effort_hours INTEGER,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    expected_outcome TEXT,
    actual_outcome TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create opportunity metrics table
CREATE TABLE IF NOT EXISTS opportunity_metrics (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255) NOT NULL REFERENCES competitive_opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    baseline_value DECIMAL(15,4),
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4),
    unit VARCHAR(50),
    measurement_date TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for competitive opportunities
CREATE INDEX IF NOT EXISTS competitive_opportunities_user_id_idx ON competitive_opportunities(user_id);
CREATE INDEX IF NOT EXISTS competitive_opportunities_competitor_id_idx ON competitive_opportunities(competitor_id);
CREATE INDEX IF NOT EXISTS competitive_opportunities_type_idx ON competitive_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS competitive_opportunities_impact_idx ON competitive_opportunities(impact);
CREATE INDEX IF NOT EXISTS competitive_opportunities_status_idx ON competitive_opportunities(status);
CREATE INDEX IF NOT EXISTS competitive_opportunities_priority_score_idx ON competitive_opportunities(priority_score);
CREATE INDEX IF NOT EXISTS competitive_opportunities_detected_at_idx ON competitive_opportunities(detected_at);
CREATE INDEX IF NOT EXISTS competitive_opportunities_is_archived_idx ON competitive_opportunities(is_archived);

-- Create indexes for opportunity actions
CREATE INDEX IF NOT EXISTS opportunity_actions_opportunity_id_idx ON opportunity_actions(opportunity_id);
CREATE INDEX IF NOT EXISTS opportunity_actions_user_id_idx ON opportunity_actions(user_id);
CREATE INDEX IF NOT EXISTS opportunity_actions_status_idx ON opportunity_actions(status);
CREATE INDEX IF NOT EXISTS opportunity_actions_priority_idx ON opportunity_actions(priority);
CREATE INDEX IF NOT EXISTS opportunity_actions_due_date_idx ON opportunity_actions(due_date);

-- Create indexes for opportunity metrics
CREATE INDEX IF NOT EXISTS opportunity_metrics_opportunity_id_idx ON opportunity_metrics(opportunity_id);
CREATE INDEX IF NOT EXISTS opportunity_metrics_user_id_idx ON opportunity_metrics(user_id);
CREATE INDEX IF NOT EXISTS opportunity_metrics_metric_name_idx ON opportunity_metrics(metric_name);
CREATE INDEX IF NOT EXISTS opportunity_metrics_measurement_date_idx ON opportunity_metrics(measurement_date);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_competitive_opportunities_updated_at 
    BEFORE UPDATE ON competitive_opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_actions_updated_at 
    BEFORE UPDATE ON opportunity_actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_metrics_updated_at 
    BEFORE UPDATE ON opportunity_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();