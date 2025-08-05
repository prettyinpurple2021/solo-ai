# Migration 005: Add Missing updated_at Triggers

## Overview
This migration fixes the missing `updated_at` trigger for the `ai_agents` table. Previously, the `ai_agents` table had an `updated_at` column but lacked the necessary trigger to automatically update the timestamp when records were modified.

## Problem
The `ai_agents` table was missing a trigger to automatically update the `updated_at` column when records were updated. This resulted in the `updated_at` timestamp only reflecting the creation time, not the last update time.

## Solution
Added the missing trigger `update_ai_agents_updated_at` that uses the existing `update_updated_at_column()` function to ensure consistency with other tables.

## Files Changed
- `supabase/migrations/005_add_missing_updated_at_triggers.sql` - New migration file
- `scripts/verify-updated-at-triggers.js` - Verification script
- `package.json` - Added `verify-triggers` npm script

## Current Trigger Status After Migration
- ✅ **ai_agents**: `update_ai_agents_updated_at` → `update_updated_at_column()`
- ✅ **ai_conversations**: `update_ai_conversations_updated_at` → `update_updated_at_column()`
- ✅ **projects**: `trigger_update_projects_updated_at` → `update_projects_updated_at()`

## Usage
Apply this migration using your standard Supabase migration process:
```bash
supabase db migrate
```

## Verification
Run the verification script to confirm the fix:
```bash
npm run verify-triggers
```

## Testing
To manually test the trigger works:
1. Insert a test record in the `ai_agents` table
2. Update any field in that record
3. Verify that `updated_at` timestamp changed from `created_at`