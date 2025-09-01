import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { intelligenceBriefingService } from '@/lib/intelligence-briefing-system'
import { z } from 'zod'

const weeklyBriefingSchema = z.object({
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
    const { competitorIds } = weeklyBriefingSchema.parse(body)
    
    // Generate weekly briefing
    const briefing = await intelligenceBriefingService.generateWeeklyBriefing(
      userId,
      competitorIds
    )
    
    return NextResponse.json({
      success: true,
      briefing,
      message: 'Weekly strategic briefing generated successfully'
    })
    
  } catch (error) {
    console.error('Error generating weekly briefing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate weekly briefing' },
      { status: 500 }
    )
  }
}