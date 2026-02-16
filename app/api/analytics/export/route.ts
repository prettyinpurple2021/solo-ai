/**
 * Analytics Export API
 * Handles exporting analytics data in various formats
 */

import { logError, logApi } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyticsExportService, ExportConfigSchema, type AnalyticsData } from '@/lib/analytics-export'
import { verifyAuth } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'

/**
 * FIX FOR NEXT.JS 15 / VERCEL BUILD:
 * We have switched the runtime from 'edge' to 'nodejs'.
 * Next.js 15's Edge runtime currently has issues with internal object iteration 
 * (the "b.entries is not a function" error) during the "Collecting page data" 
 * phase when complex Auth/DB adapters are present. 
 * Node.js runtime is more stable for this specific export logic.
 */
export const runtime = 'nodejs'

/**
 * Force dynamic rendering
 * This prevents Vercel from trying to "pre-build" this API route as a static file,
 * which is a common cause of build-time crashes.
 */
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
      metadata: z.record(z.unknown()).optional(),
      timestamp: z.string().or(z.date()) // Allow string for JSON serialization
    })),
    charts: z.array(z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      data: z.array(z.unknown()), // Chart data can be complex
      config: z.record(z.unknown()),
      metadata: z.object({
        created: z.string().or(z.date()),
        updated: z.string().or(z.date()),
        dataSource: z.string()
      })
    }))
  }),
  config: ExportConfigSchema
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
    // We need to map the data to ensure timestamps are Date objects as expected by the service
    const processedData: AnalyticsData[] = validatedData.reportData.data.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name,
      value: item.value,
      timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp,
      metadata: item.metadata as Record<string, any> | undefined
    }))

    const processedCharts = validatedData.reportData.charts.map(chart => ({
      ...chart,
      metadata: {
        ...chart.metadata,
        created: typeof chart.metadata.created === 'string' ? new Date(chart.metadata.created) : chart.metadata.created,
        updated: typeof chart.metadata.updated === 'string' ? new Date(chart.metadata.updated) : chart.metadata.updated
      }
    }))

    const reportDataWithMetadata = {
      ...validatedData.reportData,
      data: processedData,
      charts: processedCharts,
      generatedAt: new Date(),
      generatedBy: user.id.toString(),
      metadata: {
        totalRecords: validatedData.reportData.data.length,
        dateRange: validatedData.config.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        filters: validatedData.config.filters as Record<string, any> || {}
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
        details: error.errors
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

    /**
     * FIX FOR NEXT.JS 15:
     * We use request.nextUrl.searchParams instead of new URL(request.url).
     * This is the standard, optimized way for Next.js to handle query strings,
     * which prevents errors during the "Collecting page data" phase.
     */
    const searchParams = request.nextUrl.searchParams
    // const jobId = searchParams.get('jobId') // Unused
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
