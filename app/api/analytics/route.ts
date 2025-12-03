import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { analytics } from '@/lib/analytics'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for analytics events
const AnalyticsEventSchema = z.object({
  event: z.enum([
    'user_signup',
    'user_login',
    'user_logout',
    'page_view',
    'ai_agent_interaction',
    'goal_created',
    'goal_completed',
    'task_created',
    'task_completed',
    'file_uploaded',
    'template_saved',
    'dashboard_viewed',
    'feature_used',
    'error_occurred',
    'performance_metric'
  ]),
  properties: z.record(z.string(), z.any()).default({}),
  timestamp: z.string().datetime().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 1000, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { event, properties, timestamp: _timestamp } = AnalyticsEventSchema.parse(body)

    // Add user ID to properties
    const eventProperties = {
      ...properties,
      userId: user.id
    }

    // Track the event
    await analytics.trackEvent(event, eventProperties, request)

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })

  } catch (error) {
    logError('Error tracking analytics event:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get analytics dashboard data
    const dashboardData = await analytics.getDashboardData()

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    logError('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
