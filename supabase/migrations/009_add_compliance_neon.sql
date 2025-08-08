-- Guardian AI Compliance schema for Neon (references users table)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Compliance scans
CREATE TABLE IF NOT EXISTS compliance_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  trust_score INTEGER NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
  page_title TEXT,
  has_privacy_policy BOOLEAN DEFAULT FALSE,
  has_cookie_banner BOOLEAN DEFAULT FALSE,
  has_contact_form BOOLEAN DEFAULT FALSE,
  has_newsletter_signup BOOLEAN DEFAULT FALSE,
  has_analytics BOOLEAN DEFAULT FALSE,
  data_collection_points TEXT[],
  cookie_types TEXT[],
  consent_mechanisms TEXT[],
  scan_status TEXT DEFAULT 'completed' CHECK (scan_status IN ('pending','in_progress','completed','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance issues
CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES compliance_scans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('critical','warning','info')),
  category TEXT NOT NULL CHECK (category IN ('data_collection','consent','cookies','privacy_policy','data_requests')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  gdpr_article TEXT,
  ccpa_section TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated policies
CREATE TABLE IF NOT EXISTS generated_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('privacy','terms','cookies')),
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  compliance_level TEXT NOT NULL DEFAULT 'standard',
  jurisdictions TEXT[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy input data
CREATE TABLE IF NOT EXISTS policy_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust score history
CREATE TABLE IF NOT EXISTS trust_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  trust_score INTEGER NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
  previous_score INTEGER,
  score_change INTEGER,
  scan_id UUID REFERENCES compliance_scans(id) ON DELETE SET NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consent logs
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  consent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Data subject requests
CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Helper function & triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_compliance_scans_user_id ON compliance_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_policies_user_id ON generated_policies(user_id);

CREATE TRIGGER trg_update_compliance_scans BEFORE UPDATE ON compliance_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_compliance_issues BEFORE UPDATE ON compliance_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_generated_policies BEFORE UPDATE ON generated_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_policy_data BEFORE UPDATE ON policy_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate trust score change
CREATE OR REPLACE FUNCTION calculate_trust_score_change(p_user_id UUID, p_url TEXT, p_new_score INTEGER)
RETURNS INTEGER AS $$
DECLARE previous_score INTEGER; BEGIN
  SELECT trust_score INTO previous_score FROM trust_score_history
  WHERE user_id = p_user_id AND url = p_url ORDER BY recorded_at DESC LIMIT 1;
  IF previous_score IS NULL THEN RETURN NULL; ELSE RETURN p_new_score - previous_score; END IF;
END; $$ LANGUAGE plpgsql;


