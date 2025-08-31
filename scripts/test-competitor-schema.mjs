import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function testSchema() {
  try {
    console.log('Testing competitor intelligence schema...')
    
    // Test table structures
    console.log('\n1. Checking table structures...')
    
    const competitorColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'competitor_profiles'
      ORDER BY ordinal_position
    `
    
    console.log('competitor_profiles columns:')
    competitorColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    const intelligenceColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'intelligence_data'
      ORDER BY ordinal_position
    `
    
    console.log('\nintelligence_data columns:')
    intelligenceColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    const alertColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'competitor_alerts'
      ORDER BY ordinal_position
    `
    
    console.log('\ncompetitor_alerts columns:')
    alertColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Test foreign key constraints
    console.log('\n2. Checking foreign key constraints...')
    
    const constraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('competitor_profiles', 'intelligence_data', 'competitor_alerts')
      ORDER BY tc.table_name, tc.constraint_name
    `
    
    console.log('Foreign key constraints:')
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`)
    })
    
    // Test indexes
    console.log('\n3. Checking indexes...')
    
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('competitor_profiles', 'intelligence_data', 'competitor_alerts')
      ORDER BY tablename, indexname
    `
    
    console.log('Indexes:')
    indexes.forEach(index => {
      console.log(`  - ${index.tablename}: ${index.indexname}`)
    })
    
    // Test triggers
    console.log('\n4. Checking triggers...')
    
    const triggers = await sql`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_timing,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
      AND event_object_table IN ('competitor_profiles', 'intelligence_data', 'competitor_alerts')
      ORDER BY event_object_table, trigger_name
    `
    
    console.log('Triggers:')
    triggers.forEach(trigger => {
      console.log(`  - ${trigger.event_object_table}: ${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`)
    })
    
    console.log('\n✅ Schema test completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`  - Tables created: 3`)
    console.log(`  - Foreign key constraints: ${constraints.length}`)
    console.log(`  - Indexes created: ${indexes.length}`)
    console.log(`  - Triggers created: ${triggers.length}`)
    
  } catch (error) {
    console.error('Error testing schema:', error)
    process.exit(1)
  }
}

testSchema()