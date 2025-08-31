import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createTables() {
  try {
    console.log('Creating competitor intelligence tables...')
    
    // Create competitor_profiles table
    console.log('Creating competitor_profiles table...')
    await sql`
      CREATE TABLE IF NOT EXISTS competitor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        description TEXT,
        industry VARCHAR(100),
        headquarters VARCHAR(255),
        founded_year INTEGER,
        employee_count INTEGER,
        funding_amount DECIMAL(15, 2),
        funding_stage VARCHAR(50),
        threat_level VARCHAR(20) DEFAULT 'medium' NOT NULL,
        monitoring_status VARCHAR(20) DEFAULT 'active' NOT NULL,
        social_media_handles JSONB DEFAULT '{}',
        key_personnel JSONB DEFAULT '[]',
        products JSONB DEFAULT '[]',
        market_position JSONB DEFAULT '{}',
        competitive_advantages JSONB DEFAULT '[]',
        vulnerabilities JSONB DEFAULT '[]',
        monitoring_config JSONB DEFAULT '{}',
        last_analyzed TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ competitor_profiles table created')
    
    // Create intelligence_data table
    console.log('Creating intelligence_data table...')
    await sql`
      CREATE TABLE IF NOT EXISTS intelligence_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        competitor_id UUID NOT NULL REFERENCES competitor_profiles(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source_type VARCHAR(50) NOT NULL,
        source_url VARCHAR(1000),
        data_type VARCHAR(100) NOT NULL,
        raw_content JSONB,
        extracted_data JSONB DEFAULT '{}',
        analysis_results JSONB DEFAULT '[]',
        confidence DECIMAL(3, 2) DEFAULT 0.00,
        importance VARCHAR(20) DEFAULT 'medium' NOT NULL,
        tags JSONB DEFAULT '[]',
        collected_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ intelligence_data table created')
    
    // Create competitor_alerts table
    console.log('Creating competitor_alerts table...')
    await sql`
      CREATE TABLE IF NOT EXISTS competitor_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        competitor_id UUID NOT NULL REFERENCES competitor_profiles(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        intelligence_id UUID REFERENCES intelligence_data(id) ON DELETE SET NULL,
        alert_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'info' NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source_data JSONB DEFAULT '{}',
        action_items JSONB DEFAULT '[]',
        recommended_actions JSONB DEFAULT '[]',
        is_read BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        acknowledged_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ competitor_alerts table created')
    
    // Create indexes
    console.log('Creating indexes...')
    
    // Competitor profiles indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_profiles_user_id ON competitor_profiles(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_profiles_threat_level ON competitor_profiles(threat_level)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_profiles_monitoring_status ON competitor_profiles(monitoring_status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_profiles_domain ON competitor_profiles(domain)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_profiles_industry ON competitor_profiles(industry)`
    
    // Intelligence data indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_competitor_id ON intelligence_data(competitor_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_user_id ON intelligence_data(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_source_type ON intelligence_data(source_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_data_type ON intelligence_data(data_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_importance ON intelligence_data(importance)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_collected_at ON intelligence_data(collected_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_intelligence_data_expires_at ON intelligence_data(expires_at)`
    
    // Competitor alerts indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON competitor_alerts(competitor_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_user_id ON competitor_alerts(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_alert_type ON competitor_alerts(alert_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_severity ON competitor_alerts(severity)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_is_read ON competitor_alerts(is_read)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_is_archived ON competitor_alerts(is_archived)`
    await sql`CREATE INDEX IF NOT EXISTS idx_competitor_alerts_created_at ON competitor_alerts(created_at)`
    
    console.log('✅ Indexes created')
    
    // Create update triggers
    console.log('Creating update triggers...')
    
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
    
    await sql`
      DROP TRIGGER IF EXISTS update_competitor_profiles_updated_at ON competitor_profiles;
      CREATE TRIGGER update_competitor_profiles_updated_at 
          BEFORE UPDATE ON competitor_profiles 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    
    await sql`
      DROP TRIGGER IF EXISTS update_intelligence_data_updated_at ON intelligence_data;
      CREATE TRIGGER update_intelligence_data_updated_at 
          BEFORE UPDATE ON intelligence_data 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    
    await sql`
      DROP TRIGGER IF EXISTS update_competitor_alerts_updated_at ON competitor_alerts;
      CREATE TRIGGER update_competitor_alerts_updated_at 
          BEFORE UPDATE ON competitor_alerts 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    
    console.log('✅ Update triggers created')
    
    // Verify tables were created
    console.log('Verifying tables...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('competitor_profiles', 'intelligence_data', 'competitor_alerts')
      ORDER BY table_name
    `
    
    console.log('Created tables:', tables.map(t => t.table_name))
    
    if (tables.length === 3) {
      console.log('🎉 All competitor intelligence tables created successfully!')
    } else {
      console.log('⚠️  Some tables may not have been created.')
    }
    
  } catch (error) {
    console.error('Error creating tables:', error)
    process.exit(1)
  }
}

createTables()