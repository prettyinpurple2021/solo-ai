/**
 * Analytics Export API
 * Handles exporting analytics data in various formats
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyticsExportService, ExportConfigSchema } from '@/lib/analytics-export'
import { verifyAuth } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Request schemas
const ExportRequestSchema = z.object({
  reportData: z.object({
    title: z.string(),
    description: z.string(),
    data: z.array(z.object({
      id: z.string(),
      type: z.enum(['metric', 'dimension', 'calculated']),
      name: z.string(),
      value: z.union([z.number(), z.string()]),
      metadata: z.record(z.string(), z.any()).optional(),
      timestamp: z.date()
    })),
    charts: z.array(z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      data: z.array(z.any()),
      config: z.record(z.string(), z.any()),
      metadata: z.object({
        created: z.date(),
        updated: z.date(),
        dataSource: z.string()
      })
    }))
  }),
  config: ExportConfigSchema
})

const ExportStatusSchema = z.object({
  jobId: z.string().uuid()
})

/**
 * POST /api/analytics/export
 * Create a new export job
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 10, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many export requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = ExportRequestSchema.parse(body)

    // Create export job
    // Ensure metadata is included for ReportData
    const reportDataWithMetadata = {
      ...validatedData.reportData,
      generatedAt: new Date(),
      generatedBy: user.id.toString(),
      metadata: {
        totalRecords: validatedData.reportData.data.length,
        dateRange: validatedData.config.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        filters: validatedData.config.filters || {}
      }
    }

    const result = await analyticsExportService.exportData(
      reportDataWithMetadata,
      validatedData.config,
      user.id.toString()
    )

    logApi('POST', '/api/analytics/export', 202, undefined, {
      userId: user.id,
      format: validatedData.config.format,
      jobId: result.jobId
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Export job created successfully'
    }, { status: 202 })

  } catch (error) {
    logError('Error creating analytics export:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid export request data',
        details: (error as any).errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Export Creation Failed',
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to create export job'
    }, { status: 500 })
  }
}

/**
 * GET /api/analytics/export
 * Get export jobs for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get export jobs
    let exports = analyticsExportService.getUserExports(user.id.toString())

    // Filter by status if provided
    if (status) {
      exports = exports.filter(exp => exp.status === status)
    }

    // Apply pagination
    const paginatedExports = exports.slice(offset, offset + limit)

    // Transform for API response
    const exportList = paginatedExports.map(exp => ({
      id: exp.id,
      status: exp.status,
      format: exp.format,
      createdAt: exp.createdAt,
      startedAt: exp.startedAt,
      completedAt: exp.completedAt,
      progress: exp.progress,
      error: exp.error,
      result: exp.result ? {
        filename: exp.result.filename,
        size: exp.result.size,
        mimeType: exp.result.mimeType,
        downloadUrl: exp.result.downloadUrl
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        exports: exportList,
        pagination: {
          total: exports.length,
          limit,
          offset,
          hasMore: offset + limit < exports.length
        }
      },
      message: 'Export jobs retrieved successfully'
    })

  } catch (error) {
    logError('Error retrieving export jobs:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve export jobs'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/analytics/export
 * Cancel an export job
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'Job ID is required'
      }, { status: 400 })
    }

    // Cancel export job
    const cancelled = analyticsExportService.cancelExport(jobId, user.id.toString())

    if (!cancelled) {
      return NextResponse.json({
        error: 'Not Found',
        message: 'Export job not found or cannot be cancelled'
      }, { status: 404 })
    }

    logApi('DELETE', '/api/analytics/export', 200, undefined, {
      userId: user.id,
      jobId
    })

    return NextResponse.json({
      success: true,
      message: 'Export job cancelled successfully'
    })

  } catch (error) {
    logError('Error cancelling export job:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to cancel export job'
    }, { status: 500 })
  }
}

