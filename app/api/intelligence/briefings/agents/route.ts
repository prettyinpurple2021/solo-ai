import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { agentIntelligenceBriefingService } from '@/lib/agent-intelligence-briefings'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const agentBriefingRequestSchema = z.object({
  agentId: z.enum(['echo', 'lexi', 'nova', 'blaze', 'collaborative']),
  competitorIds: z.array(z.string()).optional(),
  participatingAgents: z.array(z.string()).optional() // For collaborative briefings
})


export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 5,
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
    const { agentId, competitorIds, participatingAgents } = agentBriefingRequestSchema.parse(body)

    // Gather intelligence data for the briefing
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

    let briefing

    // Generate agent-specific briefing
    switch (agentId) {
      case 'echo':
        briefing = await agentIntelligenceBriefingService.generateEchoMarketingBriefing(
          intelligenceData,
          intelligenceData.competitors
        )
        break

      case 'lexi':
        briefing = await agentIntelligenceBriefingService.generateLexiStrategicBriefing(
          intelligenceData,
          intelligenceData.competitors
        )
        break

      case 'nova':
        briefing = await agentIntelligenceBriefingService.generateNovaProductBriefing(
          intelligenceData,
          intelligenceData.competitors
        )
        break

      case 'blaze':
        briefing = await agentIntelligenceBriefingService.generateBlazeGrowthBriefing(
          intelligenceData,
          intelligenceData.competitors
        )
        break

      case 'collaborative':
        briefing = await agentIntelligenceBriefingService.generateCollaborativeBriefing(
          intelligenceData,
          intelligenceData.competitors,
          participatingAgents || ['echo', 'lexi', 'nova', 'blaze']
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid agent ID' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      briefing,
      message: `${briefing.agentName} intelligence briefing generated successfully`
    })

  } catch (error) {
    logError('Error generating agent briefing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as z.ZodError).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate agent briefing' },
      { status: 500 }
    )
  }
}