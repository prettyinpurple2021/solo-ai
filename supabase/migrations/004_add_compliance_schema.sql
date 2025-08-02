-- =============================================
-- Guardian AI Compliance Schema
-- =============================================

-- Compliance Scans table
CREATE TABLE IF NOT EXISTS compliance_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    page_title TEXT,
    has_privacy_policy BOOLEAN DEFAULT FALSE,
    has_cookie_banner BOOLEAN DEFAULT FALSE,
    has_contact_form BOOLEAN DEFAULT FALSE,
    has_newsletter_signup BOOLEAN DEFAULT FALSE,
    has_analytics BOOLEAN DEFAULT FALSE,
    data_collection_points TEXT[],
    cookie_types TEXT[],
    consent_mechanisms TEXT[],
    scan_status TEXT DEFAULT 'completed' CHECK (scan_status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Issues table
CREATE TABLE IF NOT EXISTS compliance_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES compliance_scans(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
    category TEXT NOT NULL CHECK (category IN ('data_collection', 'consent', 'cookies', 'privacy_policy', 'data_requests')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    gdpr_article TEXT,
    ccpa_section TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Policies table
CREATE TABLE IF NOT EXISTS generated_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('privacy', 'terms', 'cookies')),
    content TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    compliance_level TEXT NOT NULL CHECK (compliance_level IN ('basic', 'standard', 'comprehensive')),
    jurisdictions TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy Data table (stores the input data used to generate policies)
CREATE TABLE IF NOT EXISTS policy_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    business_type TEXT,
    data_collected TEXT[],
    third_party_services TEXT[],
    data_retention_period TEXT,
    user_rights TEXT[],
    contact_email TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    industry TEXT,
    target_audience TEXT,
    data_processing_purposes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust Score History table (for tracking trust score changes over time)
CREATE TABLE IF NOT EXISTS trust_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    previous_score INTEGER,
    score_change INTEGER,
    scan_id UUID REFERENCES compliance_scans(id),
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Recommendations table (for storing AI-generated recommendations)
CREATE TABLE IF NOT EXISTS compliance_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES compliance_scans(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_items TEXT[],
    estimated_effort TEXT,
    compliance_impact TEXT,
    implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Compliance Scans indexes
CREATE INDEX IF NOT EXISTS idx_compliance_scans_user_id ON compliance_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scans_url ON compliance_scans(url);
CREATE INDEX IF NOT EXISTS idx_compliance_scans_scan_date ON compliance_scans(scan_date);
CREATE INDEX IF NOT EXISTS idx_compliance_scans_trust_score ON compliance_scans(trust_score);

-- Compliance Issues indexes
CREATE INDEX IF NOT EXISTS idx_compliance_issues_scan_id ON compliance_issues(scan_id);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_type ON compliance_issues(type);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_category ON compliance_issues(category);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_resolved ON compliance_issues(resolved);

-- Generated Policies indexes
CREATE INDEX IF NOT EXISTS idx_generated_policies_user_id ON generated_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_policies_policy_type ON generated_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_generated_policies_generated_at ON generated_policies(generated_at);
CREATE INDEX IF NOT EXISTS idx_generated_policies_is_active ON generated_policies(is_active);

-- Policy Data indexes
CREATE INDEX IF NOT EXISTS idx_policy_data_user_id ON policy_data(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_data_website_url ON policy_data(website_url);

-- Trust Score History indexes
CREATE INDEX IF NOT EXISTS idx_trust_score_history_user_id ON trust_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_score_history_url ON trust_score_history(url);
CREATE INDEX IF NOT EXISTS idx_trust_score_history_recorded_at ON trust_score_history(recorded_at);

-- Compliance Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_compliance_recommendations_user_id ON compliance_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_recommendations_priority ON compliance_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_compliance_recommendations_implemented ON compliance_recommendations(implemented);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Compliance Scans trigger
CREATE TRIGGER update_compliance_scans_updated_at
    BEFORE UPDATE ON compliance_scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Compliance Issues trigger
CREATE TRIGGER update_compliance_issues_updated_at
    BEFORE UPDATE ON compliance_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Generated Policies trigger
CREATE TRIGGER update_generated_policies_updated_at
    BEFORE UPDATE ON generated_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Policy Data trigger
CREATE TRIGGER update_policy_data_updated_at
    BEFORE UPDATE ON policy_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Compliance Recommendations trigger
CREATE TRIGGER update_compliance_recommendations_updated_at
    BEFORE UPDATE ON compliance_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all compliance tables
ALTER TABLE compliance_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_recommendations ENABLE ROW LEVEL SECURITY;

-- Compliance Scans RLS policies
CREATE POLICY "Users can view their own compliance scans" ON compliance_scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance scans" ON compliance_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance scans" ON compliance_scans
    FOR UPDATE USING (auth.uid() = user_id);

-- Compliance Issues RLS policies
CREATE POLICY "Users can view issues from their scans" ON compliance_issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compliance_scans 
            WHERE compliance_scans.id = compliance_issues.scan_id 
            AND compliance_scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert issues for their scans" ON compliance_issues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM compliance_scans 
            WHERE compliance_scans.id = compliance_issues.scan_id 
            AND compliance_scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update issues from their scans" ON compliance_issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM compliance_scans 
            WHERE compliance_scans.id = compliance_issues.scan_id 
            AND compliance_scans.user_id = auth.uid()
        )
    );

-- Generated Policies RLS policies
CREATE POLICY "Users can view their own generated policies" ON generated_policies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated policies" ON generated_policies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated policies" ON generated_policies
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy Data RLS policies
CREATE POLICY "Users can view their own policy data" ON policy_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy data" ON policy_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policy data" ON policy_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Trust Score History RLS policies
CREATE POLICY "Users can view their own trust score history" ON trust_score_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trust score history" ON trust_score_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Compliance Recommendations RLS policies
CREATE POLICY "Users can view their own compliance recommendations" ON compliance_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance recommendations" ON compliance_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance recommendations" ON compliance_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to calculate trust score change
CREATE OR REPLACE FUNCTION calculate_trust_score_change(
    p_user_id UUID,
    p_url TEXT,
    p_new_score INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    previous_score INTEGER;
BEGIN
    -- Get the previous score for this URL
    SELECT trust_score INTO previous_score
    FROM trust_score_history
    WHERE user_id = p_user_id AND url = p_url
    ORDER BY recorded_at DESC
    LIMIT 1;
    
    -- Return the change (NULL if no previous score)
    IF previous_score IS NULL THEN
        RETURN NULL;
    ELSE
        RETURN p_new_score - previous_score;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance summary for a user
CREATE OR REPLACE FUNCTION get_compliance_summary(p_user_id UUID)
RETURNS TABLE (
    total_scans INTEGER,
    average_trust_score NUMERIC,
    total_issues INTEGER,
    resolved_issues INTEGER,
    active_policies INTEGER,
    last_scan_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT cs.id)::INTEGER as total_scans,
        ROUND(AVG(cs.trust_score), 2) as average_trust_score,
        COUNT(ci.id)::INTEGER as total_issues,
        COUNT(CASE WHEN ci.resolved = true THEN 1 END)::INTEGER as resolved_issues,
        COUNT(CASE WHEN gp.is_active = true THEN 1 END)::INTEGER as active_policies,
        MAX(cs.scan_date) as last_scan_date
    FROM compliance_scans cs
    LEFT JOIN compliance_issues ci ON cs.id = ci.scan_id
    LEFT JOIN generated_policies gp ON cs.user_id = gp.user_id
    WHERE cs.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql; 