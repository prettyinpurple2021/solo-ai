import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getScrapingSystemHealth } from '@/lib/scraping-startup'
import { queueProcessor } from '@/lib/scraping-queue-processor'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/competitors/scraping/health - Get scraping system health status
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication (optional for health check, but good for security)
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get system health
    const systemHealth = getScrapingSystemHealth()

    // Get queue statistics
    const queueStats = await queueProcessor.getQueueStats()

    // Get processor health
    const processorHealth = queueProcessor.getHealthStatus()

    const healthData = {
      timestamp: new Date().toISOString(),
      system: systemHealth,
      queue: {
        stats: queueStats,
        processor: processorHealth
      },
      status: systemHealth.isRunning ? 'healthy' : 'unhealthy'
    }

    const statusCode = systemHealth.isRunning ? 200 : 503

    return NextResponse.json({
      success: true,
      data: healthData
    }, { status: statusCode })

  } catch (error) {
    logError('Error getting scraping system health:', error)

    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      data: {
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

/**
 * POST /api/competitors/scraping/health - Restart scraping system (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
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

    // For now, we'll allow any authenticated user to restart
    // In production, you might want to check for admin role

    const body = await request.json()
    const { action } = body

    if (action === 'restart') {
      // Stop and start the queue processor
      queueProcessor.stop()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      await queueProcessor.start()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Scraping system restarted successfully',
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "restart"' },
      { status: 400 }
    )

  } catch (error) {
    logError('Error restarting scraping system:', error)
    return NextResponse.json(
      { error: 'Failed to restart scraping system' },
      { status: 500 }
    )
  }
}