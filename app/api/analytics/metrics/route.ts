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

// Validation schema for performance metrics
const PerformanceMetricsSchema = z.object({
  pageLoadTime: z.number().min(0).optional(),
  apiResponseTime: z.number().min(0).optional(),
  errorRate: z.number().min(0).max(100).optional(),
  uptime: z.number().min(0).max(100).optional(),
  memoryUsage: z.number().min(0).optional(),
  cpuUsage: z.number().min(0).max(100).optional(),
  databaseQueryTime: z.number().min(0).optional()
})

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const metrics = PerformanceMetricsSchema.parse(body)

    // Track performance metrics
    await analytics.trackPerformance(metrics)

    return NextResponse.json({
      success: true,
      message: 'Performance metrics tracked successfully'
    })

  } catch (error) {
    logError('Error tracking performance metrics:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { error: 'Invalid metrics data', details: (error as any).errors },
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

    // Get performance metrics
    const performanceMetrics = await analytics.getPerformanceMetrics()

    // Calculate averages
    const averages = performanceMetrics.length > 0 ? {
      pageLoadTime: performanceMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / performanceMetrics.length,
      apiResponseTime: performanceMetrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / performanceMetrics.length,
      errorRate: performanceMetrics.reduce((sum, m) => sum + m.errorRate, 0) / performanceMetrics.length,
      uptime: performanceMetrics.reduce((sum, m) => sum + m.uptime, 0) / performanceMetrics.length,
      memoryUsage: performanceMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / performanceMetrics.length,
      cpuUsage: performanceMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / performanceMetrics.length,
      databaseQueryTime: performanceMetrics.reduce((sum, m) => sum + m.databaseQueryTime, 0) / performanceMetrics.length
    } : null

    return NextResponse.json({
      success: true,
      data: {
        metrics: performanceMetrics,
        averages,
        count: performanceMetrics.length
      }
    })

  } catch (error) {
    logError('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
