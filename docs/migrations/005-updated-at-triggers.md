# Updated At Triggers - Migration 005

## Overview

This migration fixes the issue where `updated_at` columns in `ai_agents`, `ai_conversations`, and `projects` tables were not automatically updated when records were modified.

## What was fixed

- **ai_agents table**: Added missing `updated_at` trigger
- **ai_conversations table**: Updated existing trigger to use new standardized function
- **projects table**: Updated existing trigger to use new standardized function

## Migration Details

**File**: `supabase/migrations/005_add_updated_at_triggers.sql`

### Changes Made

1. **Created standardized function**: `public.handle_updated_at()`
   - Sets `NEW.updated_at = NOW()` on any UPDATE operation
   - Replaces multiple different functions with a single, consistent implementation

2. **Added missing trigger**: `on_ai_agents_update`
   - The `ai_agents` table was completely missing an `updated_at` trigger

3. **Replaced existing triggers**: 
   - `ai_conversations`: Replaced `update_ai_conversations_updated_at` trigger with `on_ai_conversations_update`
   - `projects`: Replaced `trigger_update_projects_updated_at` trigger with `on_projects_update`

### Function Implementation

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Triggers Created

```sql
CREATE TRIGGER on_ai_agents_update
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_ai_conversations_update
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_update
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
```

## Testing

### Automated Testing
Run the test suite to verify the migration file structure:
```bash
# Note: Jest configuration may need to be set up first
npx jest test/updated-at-triggers.test.ts
```

### Manual Verification
After applying the migration to your database:
```bash
npm run verify-triggers
```

This will:
1. Connect to your Supabase database
2. Create test records in each table
3. Update the records and verify `updated_at` timestamps change
4. Clean up test data

### Manual Database Testing
You can also test directly in your database:

```sql
-- Test ai_agents trigger
INSERT INTO ai_agents (name, display_name, description, personality, capabilities, accent_color, system_prompt)
VALUES ('test', 'Test', 'Test desc', 'Test', ARRAY['test'], '#000', 'Test');

-- Note the current updated_at
SELECT id, updated_at FROM ai_agents WHERE name = 'test';

-- Update and check if updated_at changed
UPDATE ai_agents SET description = 'Updated' WHERE name = 'test';
SELECT id, updated_at FROM ai_agents WHERE name = 'test';

-- Clean up
DELETE FROM ai_agents WHERE name = 'test';
```

## Deployment

1. Apply the migration to your Supabase database
2. Run verification: `npm run verify-triggers`
3. Monitor application logs to ensure no issues

## Rollback

If needed, you can rollback by:

1. Dropping the new triggers:
```sql
DROP TRIGGER IF EXISTS on_ai_agents_update ON ai_agents;
DROP TRIGGER IF EXISTS on_ai_conversations_update ON ai_conversations;
DROP TRIGGER IF EXISTS on_projects_update ON projects;
```

2. Recreating the original triggers (see previous migration files for exact syntax)

## Notes

- The migration safely handles existing triggers with `DROP TRIGGER IF EXISTS`
- No data is lost during this migration
- The `updated_at` columns themselves are not modified, only the triggers
- This follows PostgreSQL best practices for auto-updating timestamp columns