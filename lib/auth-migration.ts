import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Migration utility for transitioning from Supabase to Clerk authentication
 * This handles user data migration and session management during the transition
 */

export interface UserMigrationData {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

/**
 * Get current user from either Clerk or Supabase (for migration period)
 */
export async function getCurrentUser() {
  try {
    // First try Clerk
    const { userId } = await auth()
    if (userId) {
      return { provider: 'clerk', userId }
    }
  } catch (error) {
    console.warn('Clerk auth failed, falling back to Supabase:', error)
  }

  try {
    // Fallback to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return { provider: 'supabase', userId: user.id }
    }
  } catch (error) {
    console.warn('Supabase auth failed:', error)
  }

  return null
}

/**
 * Migrate user data from Supabase to Clerk
 */
export async function migrateUserData(clerkUserId: string, supabaseUser: any) {
  try {
    const supabase = createClient()
    
    // Get user profile data from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    // Get user projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', supabaseUser.id)

    // Get user tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', supabaseUser.id)

    // Get user templates
    const { data: templates } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', supabaseUser.id)

    // Create migration record
    const migrationData = {
      clerk_user_id: clerkUserId,
      supabase_user_id: supabaseUser.id,
      email: supabaseUser.email,
      migrated_at: new Date().toISOString(),
      profile_data: profile,
      projects_count: projects?.length || 0,
      tasks_count: tasks?.length || 0,
      templates_count: templates?.length || 0,
    }

    // Store migration data (you can use your preferred storage method)
    await supabase
      .from('user_migrations')
      .insert(migrationData)

    return {
      success: true,
      data: migrationData,
      message: 'User data migrated successfully'
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Migration failed'
    }
  }
}

/**
 * Check if user has been migrated
 */
export async function checkMigrationStatus(clerkUserId: string) {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('user_migrations')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    return data ? { migrated: true, data } : { migrated: false }
  } catch (error) {
    return { migrated: false, error }
  }
}

/**
 * Get user data from the appropriate provider
 */
export async function getUserData(userId: string, provider: 'clerk' | 'supabase') {
  if (provider === 'clerk') {
    // Use Clerk user data
    return { provider: 'clerk', userId }
  } else {
    // Use Supabase user data
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return {
        provider: 'supabase',
        userId,
        user,
        profile
      }
    } catch (error) {
      console.error('Error getting Supabase user data:', error)
      return null
    }
  }
}

/**
 * Create migration database table
 */
export async function createMigrationTable() {
  const supabase = createClient()
  
  const { error } = await supabase.rpc('create_migration_table', {
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
        migration_status TEXT DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_migrations_clerk_id ON user_migrations(clerk_user_id);
      CREATE INDEX IF NOT EXISTS idx_user_migrations_supabase_id ON user_migrations(supabase_user_id);
    `
  })

  return { success: !error, error }
}

/**
 * Migration status types
 */
export type MigrationStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

/**
 * Update migration status
 */
export async function updateMigrationStatus(
  clerkUserId: string, 
  status: MigrationStatus, 
  error?: string
) {
  try {
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('user_migrations')
      .update({ 
        migration_status: status,
        updated_at: new Date().toISOString(),
        ...(error && { error_message: error })
      })
      .eq('clerk_user_id', clerkUserId)

    return { success: !updateError, error: updateError }
  } catch (error) {
    return { success: false, error }
  }
} 