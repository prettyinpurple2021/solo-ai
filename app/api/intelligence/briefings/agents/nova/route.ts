import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { agentIntelligenceBriefingService } from '@/lib/agent-intelligence-briefings'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

const novaRequestSchema = z.object({
  competitorIds: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, {
      requests: 3,
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
    const { competitorIds } = novaRequestSchema.parse(body)
    
    // Gather intelligence data for Nova's analysis
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
    
    // Generate Nova's product intelligence briefing
    const briefing = await agentIntelligenceBriefingService.generateNovaProductBriefing(
      intelligenceData,
      intelligenceData.competitors
    )
    
    return NextResponse.json({
      success: true,
      briefing,
      message: 'Nova product intelligence briefing generated successfully'
    })
    
  } catch (error) {
    console.error('Error generating Nova briefing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate Nova briefing' },
      { status: 500 }
    )
  }
}