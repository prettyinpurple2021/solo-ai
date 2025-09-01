import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { queueProcessor } from '@/lib/scraping-queue-processor'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'

const createDefaultJobsSchema = z.object({
  domain: z.string().optional(),
  socialMediaHandles: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional()
  }).optional()
})

const updateFrequencySchema = z.object({
  threatLevel: z.enum(['low', 'medium', 'high', 'critical'])
})

/**
 * GET /api/competitors/[id]/scraping - Get scraping jobs for a competitor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
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

    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Get jobs for the competitor
    const jobs = await queueProcessor.getCompetitorJobs(competitorId, authResult.user.id)

    return NextResponse.json({
      success: true,
      data: jobs
    })

  } catch (error) {
    console.error('Error getting competitor scraping jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitors/[id]/scraping - Create default scraping jobs for a competitor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
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

    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDefaultJobsSchema.parse(body)

    // Create default monitoring jobs
    const jobIds = await queueProcessor.createDefaultJobs(
      competitorId,
      authResult.user.id,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: {
        jobIds,
        count: jobIds.length,
        message: `Created ${jobIds.length} default monitoring jobs`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating default scraping jobs:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/competitors/[id]/scraping - Update scraping job frequencies based on threat level
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
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

    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateFrequencySchema.parse(body)

    // Update job frequencies
    await queueProcessor.updateJobFrequencies(
      competitorId,
      authResult.user.id,
      validatedData.threatLevel
    )

    return NextResponse.json({
      success: true,
      data: {
        message: `Updated scraping frequencies for threat level: ${validatedData.threatLevel}`
      }
    })

  } catch (error) {
    console.error('Error updating scraping frequencies:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/competitors/[id]/scraping - Delete all scraping jobs for a competitor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
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

    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Delete all jobs for the competitor
    await queueProcessor.deleteCompetitorJobs(competitorId, authResult.user.id)

    return NextResponse.json({
      success: true,
      data: {
        message: 'All scraping jobs deleted successfully'
      }
    })

  } catch (error) {
    console.error('Error deleting competitor scraping jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}