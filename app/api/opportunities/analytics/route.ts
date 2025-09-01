import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { opportunityRecommendationSystem } from '@/lib/opportunity-recommendation-system'
import { z } from 'zod'

const analyticsSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month')
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedParams = analyticsSchema.parse(queryParams)

    // Get analytics data
    const analytics = await opportunityRecommendationSystem.getOpportunityAnalytics(
      authResult.user.id,
      validatedParams.timeframe
    )

    if (!analytics) {
      return NextResponse.json(
        { error: 'Failed to generate analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error getting opportunity analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}