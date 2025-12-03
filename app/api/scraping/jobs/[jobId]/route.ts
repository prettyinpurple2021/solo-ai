import { logError } from '@/lib/logger'
import '@/lib/server-polyfills'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { scrapingScheduler } from '@/lib/scraping-scheduler'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Request schemas
const updateJobSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'execute']),
  frequency: z.object({
    type: z.enum(['interval', 'cron', 'manual']),
    value: z.union([z.string(), z.number()]),
    timezone: z.string().optional(),
  }).optional(),
  config: z.object({
    enableChangeDetection: z.boolean().optional(),
    changeThreshold: z.number().min(0).max(1).optional(),
    notifyOnChange: z.boolean().optional(),
    storeHistory: z.boolean().optional(),
    customSelectors: z.record(z.string(), z.string()).optional(),
    excludePatterns: z.array(z.string()).optional(),
  }).optional(),
})


/**
 * GET /api/scraping/jobs/[jobId]
 * Get details of a specific scraping job
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
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

    const contextParams = await context.params
    const { jobId } = contextParams

    // Get job details
    const job = scrapingScheduler.getJob(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to the authenticated user
    if (job.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to job' },
        { status: 403 }
      )
    }

    // Get job execution history
    const history = scrapingScheduler.getJobHistory(jobId)

    return NextResponse.json({
      success: true,
      data: {
        job,
        history,
        metrics: {
          totalExecutions: history.length,
          successfulExecutions: history.filter(h => h.success).length,
          failedExecutions: history.filter(h => !h.success).length,
          averageExecutionTime: history.length > 0
            ? history.reduce((sum, h) => sum + h.executionTime, 0) / history.length
            : 0,
          lastExecution: history.length > 0 ? history[history.length - 1] : null,
        },
      },
    })
  } catch (error) {
    logError('Error fetching job details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/scraping/jobs/[jobId]
 * Update or control a scraping job (pause, resume, cancel, execute)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
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

    const contextParams = await context.params
    const { jobId } = contextParams

    // Get job details
    const job = scrapingScheduler.getJob(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to the authenticated user
    if (job.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to job' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateJobSchema.parse(body)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = { success: false }
    let message = ''

    // Execute the requested action
    switch (validatedData.action) {
      case 'pause':
        result.success = scrapingScheduler.pauseJob(jobId)
        message = result.success ? 'Job paused successfully' : 'Failed to pause job'
        break

      case 'resume':
        result.success = scrapingScheduler.resumeJob(jobId)
        message = result.success ? 'Job resumed successfully' : 'Failed to resume job'
        break

      case 'cancel':
        result.success = scrapingScheduler.cancelJob(jobId)
        message = result.success ? 'Job cancelled successfully' : 'Failed to cancel job'
        break

      case 'execute':
        try {
          const executionResult = await scrapingScheduler.executeJob(jobId)
          result = {
            success: true,
            executionResult,
          }
          message = 'Job executed successfully'
        } catch (error) {
          result = {
            success: false,
            error: error instanceof Error ? error.message : 'Execution failed',
          }
          message = 'Job execution failed'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update job configuration if provided
    if (validatedData.frequency || validatedData.config) {
      const updatedJob = scrapingScheduler.getJob(jobId)
      if (updatedJob) {
        if (validatedData.frequency) {
          updatedJob.frequency = validatedData.frequency
        }
        if (validatedData.config) {
          updatedJob.config = { ...updatedJob.config, ...validatedData.config }
        }
        updatedJob.updatedAt = new Date()
      }
    }

    return NextResponse.json({
      success: result.success,
      data: {
        job: scrapingScheduler.getJob(jobId),
        result,
        message,
      },
    })
  } catch (error) {
    logError('Error updating job:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors },
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
 * DELETE /api/scraping/jobs/[jobId]
 * Delete a scraping job
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
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

    const contextParams = await context.params
    const { jobId } = contextParams

    // Get job details
    const job = scrapingScheduler.getJob(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to the authenticated user
    if (job.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to job' },
        { status: 403 }
      )
    }

    // Cancel and remove the job
    const success = scrapingScheduler.cancelJob(jobId)

    return NextResponse.json({
      success,
      data: {
        message: success ? 'Job deleted successfully' : 'Failed to delete job',
        deletedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    logError('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}