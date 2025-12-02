import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { agentIntelligenceBriefingService } from '@/lib/agent-intelligence-briefings'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const lexiRequestSchema = z.object({
  competitorIds: z.array(z.string()).optional()
})


export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 3,
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

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { competitorIds } = lexiRequestSchema.parse(body)

    // Gather intelligence data for Lexi's analysis
    const periodCovered = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date()
    }

    const intelligenceData = await (intelligenceBriefingService as any).gatherIntelligenceData(
      userId,
      competitorIds,
      periodCovered.start,
      periodCovered.end
    )

    // Generate Lexi's strategic analysis briefing
    const briefing = await agentIntelligenceBriefingService.generateLexiStrategicBriefing(
      intelligenceData,
      intelligenceData.competitors
    )

    return NextResponse.json({
      success: true,
      briefing,
      message: 'Lexi strategic analysis briefing generated successfully'
    })

  } catch (error) {
    logError('Error generating Lexi briefing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate Lexi briefing' },
      { status: 500 }
    )
  }
}