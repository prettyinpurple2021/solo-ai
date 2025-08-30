import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = neon(process.env.DATABASE_URL);

async function applyMigration() {
  try {
    console.log('🚀 Applying Enhanced To-Do List schema extensions...');
    
    // Read and execute the main migration
    const migrationPath = join(process.cwd(), 'migrations', '008_enhanced_todo_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing statement:', statement.substring(0, 50) + '...');
        await sql.query(statement);
      }
    }
    
    console.log('✅ Enhanced To-Do List schema migration completed successfully!');
    
    // Verify the new tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('task_categories', 'task_analytics', 'productivity_insights')
    `;
    
    console.log('📋 New tables created:', tables.map(t => t.table_name));
    
    // Check if tasks table has new columns
    const taskColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      AND column_name IN ('estimated_minutes', 'actual_minutes', 'category', 'tags', 'ai_suggestions', 'energy_level', 'is_recurring', 'parent_task_id')
    `;
    
    console.log('📋 New task columns added:', taskColumns.map(c => c.column_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();