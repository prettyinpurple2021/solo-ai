
import { 
  users, 
  documents, 
  searchIndex, 
  sops, 
  jobDescriptions, 
  campaigns, 
  workflows,
  communityPosts,
  moodEntries,
  webhookEvents
} from '../lib/shared/db/schema/index.ts';
import { getTableConfig } from 'drizzle-orm/pg-core';

async function audit() {
  console.log('🚀 Starting deep schema audit...');
  
  const tablesToAudit = [
    { table: users, name: 'users', columns: ['email', 'role', 'subscription_tier', 'onboarding_completed', 'created_at', 'updated_at'] },
    { table: documents, name: 'documents', columns: ['file_url', 'category', 'tags', 'metadata', 'ai_insights', 'is_favorite', 'is_public', 'download_count', 'view_count', 'created_at', 'updated_at'] },
    { table: searchIndex, name: 'search_index', columns: ['user_id', 'entity_type', 'entity_id', 'title', 'content', 'tags', 'metadata', 'created_at', 'updated_at'] },
    { table: sops, name: 'sops', columns: ['status', 'version', 'created_at', 'updated_at'] },
    { table: jobDescriptions, name: 'job_descriptions', columns: ['status', 'created_at', 'updated_at'] },
    { table: campaigns, name: 'campaigns', columns: ['status', 'channels', 'created_at', 'updated_at'] },
    { table: workflows, name: 'workflows', columns: ['version', 'status', 'trigger_config', 'nodes', 'edges', 'variables', 'settings', 'category', 'tags', 'created_at', 'updated_at'] },
    { table: communityPosts, name: 'community_posts', columns: ['tags', 'metadata', 'is_pinned', 'view_count', 'like_count', 'comment_count', 'shares_count', 'created_at', 'updated_at'] },
    { table: moodEntries, name: 'mood_entries', columns: ['mood_label', 'created_at'] },
    { table: webhookEvents, name: 'webhook_events', columns: ['data', 'created_at'] }
  ];

  let failCount = 0;

  for (const { table, name, columns } of tablesToAudit) {
    const config = getTableConfig(table);
    for (const colName of columns) {
      const column = config.columns.find(c => c.name === colName);
      if (!column) {
        console.error(`❌ FAIL: Table '${name}' is missing column '${colName}'`);
        failCount++;
        continue;
      }
      if (!column.notNull) {
        console.error(`❌ FAIL: Column '${colName}' in table '${name}' should be notNull()`);
        failCount++;
      }
    }
  }

  // Check for pgvector alignment
  const docsConfig = getTableConfig(documents);
  const embeddingCol = docsConfig.columns.find(c => c.name === 'embedding');
  if (!embeddingCol) {
    console.error("❌ FAIL: Table 'documents' missing 'embedding' column for RAG");
    failCount++;
  }

  if (failCount > 0) {
    console.error(`\n💀 Audit failed with ${failCount} errors.`);
    process.exit(1);
  }

  console.log('\n✅ Elite Production Schema Audit Passed! All mission-critical columns are strictly notNull().');
}

audit().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
