import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createTriggers() {
  try {
    console.log('Creating update triggers for competitor intelligence tables...')
    
    // Create the update function
    console.log('Creating update_updated_at_column function...')
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
    console.log('✅ Function created')
    
    // Create trigger for competitor_profiles
    console.log('Creating trigger for competitor_profiles...')
    await sql`
      DROP TRIGGER IF EXISTS update_competitor_profiles_updated_at ON competitor_profiles
    `
    await sql`
      CREATE TRIGGER update_competitor_profiles_updated_at 
          BEFORE UPDATE ON competitor_profiles 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    console.log('✅ competitor_profiles trigger created')
    
    // Create trigger for intelligence_data
    console.log('Creating trigger for intelligence_data...')
    await sql`
      DROP TRIGGER IF EXISTS update_intelligence_data_updated_at ON intelligence_data
    `
    await sql`
      CREATE TRIGGER update_intelligence_data_updated_at 
          BEFORE UPDATE ON intelligence_data 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    console.log('✅ intelligence_data trigger created')
    
    // Create trigger for competitor_alerts
    console.log('Creating trigger for competitor_alerts...')
    await sql`
      DROP TRIGGER IF EXISTS update_competitor_alerts_updated_at ON competitor_alerts
    `
    await sql`
      CREATE TRIGGER update_competitor_alerts_updated_at 
          BEFORE UPDATE ON competitor_alerts 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    console.log('✅ competitor_alerts trigger created')
    
    console.log('🎉 All triggers created successfully!')
    
  } catch (error) {
    console.error('Error creating triggers:', error)
    process.exit(1)
  }
}

createTriggers()