import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const dailyBriefingSchema = z.object({
  competitorIds: z.array(z.string()).optional()
})


export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 5,
      window: 60 // 1 minute in seconds
    })

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

    const userId = user.id

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { competitorIds } = dailyBriefingSchema.parse(body)

    // Generate daily briefing
    const briefing = await intelligenceBriefingService.generateDailyBriefing(
      userId,
      competitorIds
    )

    return NextResponse.json({
      success: true,
      briefing,
      message: 'Daily intelligence briefing generated successfully'
    })

  } catch (error) {
    logError('Error generating daily briefing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as z.ZodError).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate daily briefing' },
      { status: 500 }
    )
  }
}