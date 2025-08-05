#!/usr/bin/env node

/**
 * Setup Migration Database Script
 * 
 * This script creates the necessary database tables and indexes for
 * migrating users from Supabase to Clerk authentication.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMigrationTable() {
  console.log('🔄 Creating user_migrations table...')
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_migrations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          clerk_user_id TEXT NOT NULL UNIQUE,
          supabase_user_id UUID NOT NULL,
          email TEXT NOT NULL,
          migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          profile_data JSONB,
          projects_count INTEGER DEFAULT 0,
          tasks_count INTEGER DEFAULT 0,
          templates_count INTEGER DEFAULT 0,
          migration_status TEXT DEFAULT 'pending',
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (error) {
      console.error('❌ Error creating user_migrations table:', error)
      return false
    }

    console.log('✅ user_migrations table created successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to create user_migrations table:', error)
    return false
  }
}

async function createIndexes() {
  console.log('🔄 Creating indexes...')
  
  const indexes = [
    {
      name: 'idx_user_migrations_clerk_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_migrations_clerk_id ON user_migrations(clerk_user_id);'
    },
    {
      name: 'idx_user_migrations_supabase_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_migrations_supabase_id ON user_migrations(supabase_user_id);'
    },
    {
      name: 'idx_user_migrations_email',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_migrations_email ON user_migrations(email);'
    },
    {
      name: 'idx_user_migrations_status',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_migrations_status ON user_migrations(migration_status);'
    }
  ]

  for (const index of indexes) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: index.sql })
      
      if (error) {
        console.error(`❌ Error creating ${index.name}:`, error)
      } else {
        console.log(`✅ ${index.name} created successfully`)
      }
    } catch (error) {
      console.error(`❌ Failed to create ${index.name}:`, error)
    }
  }
}

async function createTriggers() {
  console.log('🔄 Creating triggers...')
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_user_migrations_updated_at ON user_migrations;
        
        CREATE TRIGGER update_user_migrations_updated_at
          BEFORE UPDATE ON user_migrations
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (error) {
      console.error('❌ Error creating triggers:', error)
      return false
    }

    console.log('✅ Triggers created successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to create triggers:', error)
    return false
  }
}

async function createViews() {
  console.log('🔄 Creating views...')
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW migration_stats AS
        SELECT 
          migration_status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration_seconds
        FROM user_migrations
        GROUP BY migration_status;
      `
    })

    if (error) {
      console.error('❌ Error creating views:', error)
      return false
    }

    console.log('✅ Views created successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to create views:', error)
    return false
  }
}

async function verifySetup() {
  console.log('🔄 Verifying setup...')
  
  try {
    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('user_migrations')
      .select('count(*)')
      .limit(1)

    if (tableError) {
      console.error('❌ Table verification failed:', tableError)
      return false
    }

    console.log('✅ Table verification successful')

    // Check if indexes exist
    const { data: indexes, error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'user_migrations';
      `
    })

    if (indexError) {
      console.error('❌ Index verification failed:', indexError)
      return false
    }

    console.log('✅ Indexes found:', indexes?.length || 0)
    return true
  } catch (error) {
    console.error('❌ Setup verification failed:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting migration database setup...\n')

  const steps = [
    { name: 'Create migration table', fn: createMigrationTable },
    { name: 'Create indexes', fn: createIndexes },
    { name: 'Create triggers', fn: createTriggers },
    { name: 'Create views', fn: createViews },
    { name: 'Verify setup', fn: verifySetup }
  ]

  let success = true

  for (const step of steps) {
    console.log(`\n📋 ${step.name}...`)
    const result = await step.fn()
    
    if (!result) {
      success = false
      console.error(`❌ ${step.name} failed`)
      break
    }
  }

  if (success) {
    console.log('\n🎉 Migration database setup completed successfully!')
    console.log('\n📊 Next steps:')
    console.log('   1. Test migration API endpoints')
    console.log('   2. Deploy migration components')
    console.log('   3. Start user migration process')
    console.log('   4. Monitor migration progress')
  } else {
    console.log('\n❌ Migration database setup failed!')
    console.log('   Please check the errors above and try again.')
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Script execution failed:', error)
  process.exit(1)
}) 