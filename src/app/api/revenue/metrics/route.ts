import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError } from '@/lib/logger'
import { RevenueTrackingService } from '@/lib/revenue-tracking'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d')
})

/**
 * GET: Get revenue metrics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    
    const validation = QuerySchema.safeParse({
      period: searchParams.get('period') || '30d'
    })

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 })
    }

    const { period } = validation.data

    // Convert period to days
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period]

    const metrics = await RevenueTrackingService.getRevenueMetrics(userId, periodDays)

    return NextResponse.json({
      success: true,
      metrics
    })
  } catch (error) {
    logError('Revenue metrics API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

