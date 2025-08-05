import { NextRequest, NextResponse } from "next/server"
import { checkMigrationStatus } from "@/lib/auth-migration"
import { auth } from "@clerk/nextjs/server"

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

    const migrationStatus = await checkMigrationStatus(clerkUserId)

    return NextResponse.json(migrationStatus)
  } catch (error) {
    console.error('Migration status check failed:', error)
    return NextResponse.json(
      { error: "Failed to check migration status" },
      { status: 500 }
    )
  }
} 