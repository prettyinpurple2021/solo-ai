# How to Apply the Compliance Database Migration

Since the automated migration script couldn't work due to Supabase limitations, you need to apply the migration manually.

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Apply the migration**
   - Copy the contents of `supabase/migrations/004_add_compliance_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

## Option 2: Using Supabase CLI (if you have it installed)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Apply the migration**:
   ```bash
   supabase db push
   ```

## What the Migration Creates

The migration will create these tables:
- `compliance_scans` - Stores website scan results
- `compliance_issues` - Stores individual compliance issues found
- `generated_policies` - Stores AI-generated legal policies
- `policy_data` - Stores input data for policy generation
- `trust_score_history` - Stores trust score changes over time
- `compliance_recommendations` - Stores AI-generated recommendations

## After Applying the Migration

Once the migration is applied:
1. The Guardian AI scanning will save results to the database
2. The Policy Generator will save generated policies
3. The Dashboard will show real compliance history
4. All features will work with persistent data

## Verification

After applying the migration, you can verify it worked by:
1. Going to your Supabase dashboard
2. Clicking on "Table Editor"
3. You should see the new compliance tables listed 