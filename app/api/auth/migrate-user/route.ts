import { NextRequest, NextResponse } from "next/server"
import { migrateUserData, updateMigrationStatus } from "@/lib/auth-migration"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { clerkUserId } = await request.json()
    
    if (clerkUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update status to in_progress
    await updateMigrationStatus(clerkUserId, 'in_progress')

    // Get Clerk user data
    const clerkUser = await auth()
    
    // Try to find matching Supabase user by email
    const supabase = createClient()
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      await updateMigrationStatus(clerkUserId, 'failed', 'Failed to list Supabase users')
      return NextResponse.json(
        { error: "Failed to access Supabase users" },
        { status: 500 }
      )
    }

    // Find user by email
    const supabaseUser = users?.find(user => 
      user.email === clerkUser.user?.emailAddresses?.[0]?.emailAddress
    )

    if (!supabaseUser) {
      // No matching Supabase user found - this is fine for new users
      await updateMigrationStatus(clerkUserId, 'completed')
      return NextResponse.json({
        success: true,
        message: 'No existing Supabase user found - migration not needed',
        migrated: false
      })
    }

    // Migrate user data
    const migrationResult = await migrateUserData(clerkUserId, supabaseUser)

    if (migrationResult.success) {
      await updateMigrationStatus(clerkUserId, 'completed')
      return NextResponse.json({
        success: true,
        message: 'User data migrated successfully',
        data: migrationResult.data,
        migrated: true
      })
    } else {
      await updateMigrationStatus(clerkUserId, 'failed', migrationResult.error)
      return NextResponse.json(
        { error: migrationResult.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    )
  }
} 