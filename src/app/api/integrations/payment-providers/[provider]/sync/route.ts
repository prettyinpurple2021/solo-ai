import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { RevenueTrackingService } from '@/lib/revenue-tracking'

export const dynamic = 'force-dynamic'

/**
 * POST: Manually sync revenue data from a payment provider
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params
    const authResult = await verifyAuth()
    
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id

    // Trigger revenue sync for the user
    // This will update the last_synced_at timestamp
    await RevenueTrackingService.getRevenueMetrics(userId, 30)

    logInfo('Revenue sync completed', { userId, provider })
    return NextResponse.json({ 
      success: true,
      message: 'Revenue data synced successfully'
    })
  } catch (error) {
    logError('Revenue sync error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
