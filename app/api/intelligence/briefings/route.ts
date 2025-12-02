import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const briefingRequestSchema = z.object({
  briefingType: z.enum(['daily', 'weekly', 'monthly', 'on-demand']),
  competitorIds: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  customization: z.object({
    role: z.string().optional(),
    interests: z.array(z.string()).optional(),
    priority: z.enum(['high-level', 'detailed', 'executive']).optional()
  }).optional()
})


export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 10,
      window: 60 * 1000 // 1 minute
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = briefingRequestSchema.parse(body)

    const { briefingType, competitorIds, topics, customization } = validatedData

    // Generate briefing based on type
    let briefing

    switch (briefingType) {
      case 'daily':
        briefing = await intelligenceBriefingService.generateDailyBriefing(
          userId,
          competitorIds
        )
        break
      case 'weekly':
        briefing = await intelligenceBriefingService.generateWeeklyBriefing(
          userId,
          competitorIds
        )
        break
      case 'monthly':
        briefing = await intelligenceBriefingService.generateMonthlyReport(
          userId,
          competitorIds
        )
        break
      case 'on-demand':
        briefing = await intelligenceBriefingService.generateOnDemandBriefing(
          userId,
          topics || [],
          competitorIds
        )
        break
      default:
        return NextResponse.json(
          { error: 'Invalid briefing type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      briefing
    })

  } catch (error) {
    logError('Error generating intelligence briefing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as z.ZodError).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 20,
      window: 60 * 1000 // 1 minute
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get briefing history
    const briefings = await intelligenceBriefingService.getBriefingHistory(
      userId,
      limit
    )

    return NextResponse.json({
      success: true,
      briefings
    })

  } catch (error) {
    logError('Error fetching briefing history:', error)

    return NextResponse.json(
      { error: 'Failed to fetch briefings' },
      { status: 500 }
    )
  }
}