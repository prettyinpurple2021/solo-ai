#!/usr/bin/env node

/**
 * SoloBoss AI Compliance Database Setup Script
 * 
 * This script applies the compliance schema migration
 * 
 * Run with: node scripts/setup-compliance-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupComplianceDatabase() {
  console.log('🚀 Setting up SoloBoss AI Compliance database...\n');

  try {
    // Read the migration file
    const migrationPath = path.resolve('supabase/migrations/004_add_compliance_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Applying compliance schema migration...');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    // For now, let's just check if the tables exist and create them manually
    console.log('🔍 Checking if compliance tables exist...');
    
    try {
      // Check if compliance_scans table exists
      const { data: scansCheck, error: scansError } = await supabase
        .from('compliance_scans')
        .select('count')
        .limit(1);

      if (scansError) {
        console.log('ℹ️  Compliance tables do not exist yet.');
        console.log('📝 Please apply the migration manually in the Supabase dashboard:');
        console.log('   1. Go to your Supabase project dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste the contents of: supabase/migrations/004_add_compliance_schema.sql');
        console.log('   4. Execute the SQL');
        console.log('\n   Or use the Supabase CLI: supabase db push');
        return false;
      }

      console.log('✅ Compliance tables already exist!');
      return true;
    } catch (error) {
      console.error('❌ Error checking compliance tables:', error);
      return false;
    }

    if (errorCount === 0) {
      console.log('✅ Compliance schema migration completed successfully!');
      console.log(`📊 Executed ${successCount} statements`);
      
      console.log('\n🎉 Compliance database setup completed!');
      console.log('\n📝 Next steps:');
      console.log('   1. The Guardian AI compliance features should now work');
      console.log('   2. Visit /dashboard/guardian-ai to test compliance scanning');
      console.log('   3. Test policy generation and compliance history');
      
      return true;
    } else {
      console.error(`❌ Migration completed with ${errorCount} errors`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error setting up compliance database:', error);
    return false;
  }
}

// Run the setup
setupComplianceDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }); 