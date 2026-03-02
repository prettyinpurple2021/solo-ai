import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
  const result = await pool.query(`
    select table_name, column_name, data_type, is_identity 
    from information_schema.columns 
    where column_name = 'id' and table_schema = 'public'
    order by table_name;
  `);
  
  // Tables we suspect changed to integer identity in codebase:
  const checkTables = [
    'password_reset_tokens', 'user_mfa_settings', 'device_approvals', 'user_api_keys',
    'competitor_activities', 'competitor_news_articles', 'competitor_social_mentions',
    'competitors', 'intelligence_data', 'market_intelligence_cache',
    'workflow_executions', 'workflow_templates', 'workflows', 'workflow_steps', 'workflow_edges',
    'social_accounts', 'social_posts', 'social_analytics', 'post_schedule',
    'achievements', 'user_achievements',
    'business_context', 'business_metrics'
  ];

  const suspectRows = result.rows.filter(r => checkTables.includes(r.table_name) && r.data_type !== 'integer');
  console.log("SUSPECT TABLES IN DB (NOT INTEGER):");
  console.log(suspectRows);
  pool.end();
}

checkColumns().catch(console.error);
