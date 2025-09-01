import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { agentIntelligenceBriefingService } from '@/lib/agent-intelligence-briefings'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

const collaborativeRequestSchema = z.object({
  competitorIds: z.array(z.string()).optional(),
  participatingAgents: z.array(z.enum(['echo', 'lexi', 'nova', 'blaze'])).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 2,
      window: 60 * 1000 // 1 minute
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
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
    
    const userId = authResult.user.id
    
    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { competitorIds, participatingAgents } = collaborativeRequestSchema.parse(body)
    
    // Default to all agents if none specified
    const agents = participatingAgents || ['echo', 'lexi', 'nova', 'blaze']
    
    // Gather intelligence data for collaborative analysis
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
    
    // Generate collaborative intelligence briefing
    const briefing = await agentIntelligenceBriefingService.generateCollaborativeBriefing(
      intelligenceData,
      intelligenceData.competitors,
      agents
    )
    
    return NextResponse.json({
      success: true,
      briefing,
      message: `Collaborative intelligence briefing generated with ${agents.length} agents`
    })
    
  } catch (error) {
    console.error('Error generating collaborative briefing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate collaborative briefing' },
      { status: 500 }
    )
  }
}