import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { socialMediaConnections } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'
import { socialMediaMonitor } from '@/lib/social-media-monitor'

export const dynamic = 'force-dynamic'

/**
 * POST: Trigger sync for a specific platform
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await context.params
    const authResult = await verifyAuth()
    
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Get connection
    const connection = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.platform, platform),
        eq(socialMediaConnections.is_active, true)
      ))
      .limit(1)

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Platform not connected' }, { status: 404 })
    }

    // Trigger sync - this will fetch latest posts and update analytics
    try {
      await socialMediaMonitor.monitorUserAccounts(userId)
      
      // Update last_synced_at
      await db
        .update(socialMediaConnections)
        .set({
          last_synced_at: new Date(),
          updated_at: new Date()
        })
        .where(eq(socialMediaConnections.id, connection[0].id))

      logInfo('Social media sync completed', { userId, platform })
      return NextResponse.json({ 
        success: true,
        message: 'Sync completed successfully'
      })
    } catch (syncError) {
      logError('Sync failed:', syncError)
      return NextResponse.json({ 
        error: 'Sync failed',
        message: syncError instanceof Error ? syncError.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    logError('Social media sync error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
