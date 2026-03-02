import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
  const tsIntegerTables = [
    'contacts', 'competitor_reports', 'pivot_analyses', 'search_index', 'competitor_activities', 
    'password_reset_tokens', 'user_mfa_settings', 'device_approvals', 'user_api_keys', 
    'workflow_edges', 'workflow_steps', 'workflows', 'workflow_templates', 'workflow_executions', 
    'social_accounts', 'social_posts', 'social_analytics', 'post_schedule', 
    'achievements', 'user_achievements', 'business_context', 'business_metrics'
  ];

  try {
    const result = await pool.query(`
      select table_name, column_name, data_type, is_identity 
      from information_schema.columns 
      where column_name = 'id' and table_name = ANY($1) and table_schema = 'public';
    `, [tsIntegerTables]);
    
    const mismatch = result.rows.filter(r => r.data_type !== 'integer');
    console.log("TS IS INTEGER, BUT POSTGRES IS NOT:");
    console.log(mismatch);
  } finally {
    await pool.end();
  }
}

checkColumns().catch(console.error);
