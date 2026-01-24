import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { userSettings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticateRequest } from '@/lib/auth-server'
import { logError } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const CATEGORY = 'business_context'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    const settings = await db
      .select()
      .from(userSettings)
      .where(
        and(
          eq(userSettings.user_id, user.id),
          eq(userSettings.category, CATEGORY)
        )
      )

    if (settings.length === 0) {
      // Return null or empty object if not set, consistent with storageService expectations for "no context"
      return NextResponse.json(null)
    }

    return NextResponse.json(settings[0].settings)

  } catch (error) {
    logError('Error fetching business context:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = getDb()

    // Check if exists
    const existing = await db
      .select()
      .from(userSettings)
      .where(
        and(
          eq(userSettings.user_id, user.id),
          eq(userSettings.category, CATEGORY)
        )
      )

    if (existing.length > 0) {
      // Update
      await db
        .update(userSettings)
        .set({ 
          settings: body,
          updated_at: new Date()
        })
        .where(eq(userSettings.id, existing[0].id))
    } else {
      // Insert
      await db
        .insert(userSettings)
        .values({
          user_id: user.id,
          category: CATEGORY,
          settings: body
        })
    }

    return NextResponse.json(body)

  } catch (error) {
    logError('Error saving business context:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
