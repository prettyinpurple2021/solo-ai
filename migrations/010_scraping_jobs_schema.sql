-- Migration: Add scraping jobs and results tables
-- This migration adds the necessary tables for the scraping scheduler and queue system

-- Scraping Jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id VARCHAR(255) PRIMARY KEY,
    competitor_id INTEGER NOT NULL REFERENCES competitor_profiles(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('website', 'pricing', 'products', 'jobs', 'social')),
    url VARCHAR(1000) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    frequency_type VARCHAR(20) NOT NULL DEFAULT 'interval' CHECK (frequency_type IN ('interval', 'cron', 'manual')),
    frequency_value VARCHAR(100) NOT NULL,
    frequency_timezone VARCHAR(50),
    next_run_at TIMESTAMP NOT NULL,
    last_run_at TIMESTAMP,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scraping Job Results table
CREATE TABLE IF NOT EXISTS scraping_job_results (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    success BOOLEAN NOT NULL,
    data JSONB,
    error TEXT,
    execution_time INTEGER NOT NULL, -- milliseconds
    changes_detected BOOLEAN NOT NULL DEFAULT FALSE,
    retry_count INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS scraping_jobs_competitor_id_idx ON scraping_jobs(competitor_id);
CREATE INDEX IF NOT EXISTS scraping_jobs_user_id_idx ON scraping_jobs(user_id);
CREATE INDEX IF NOT EXISTS scraping_jobs_status_idx ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS scraping_jobs_priority_idx ON scraping_jobs(priority);
CREATE INDEX IF NOT EXISTS scraping_jobs_next_run_at_idx ON scraping_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS scraping_jobs_job_type_idx ON scraping_jobs(job_type);

CREATE INDEX IF NOT EXISTS scraping_job_results_job_id_idx ON scraping_job_results(job_id);
CREATE INDEX IF NOT EXISTS scraping_job_results_success_idx ON scraping_job_results(success);
CREATE INDEX IF NOT EXISTS scraping_job_results_completed_at_idx ON scraping_job_results(completed_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scraping_jobs_updated_at 
    BEFORE UPDATE ON scraping_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE scraping_jobs IS 'Scheduled scraping jobs for competitor monitoring';
COMMENT ON TABLE scraping_job_results IS 'Results and history of scraping job executions';

COMMENT ON COLUMN scraping_jobs.frequency_type IS 'Type of scheduling: interval (minutes), cron (expression), or manual';
COMMENT ON COLUMN scraping_jobs.frequency_value IS 'Frequency value: number for interval, cron expression for cron';
COMMENT ON COLUMN scraping_jobs.config IS 'Job configuration including change detection settings, selectors, etc.';
COMMENT ON COLUMN scraping_job_results.execution_time IS 'Job execution time in milliseconds';
COMMENT ON COLUMN scraping_job_results.changes_detected IS 'Whether changes were detected compared to previous scraping';