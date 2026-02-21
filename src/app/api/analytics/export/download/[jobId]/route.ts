/**
 * Analytics Export Download API
 * Handles downloading generated analytics reports by Job ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyticsExportService } from '@/lib/analytics-export'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logApi } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/export/download/[jobId]
 * Downloads the exported file
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    // Authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get job status
    const job = analyticsExportService.getExportStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Export job not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (job.userId !== user.id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this export' },
        { status: 403 }
      )
    }

    // Check if completed
    if (job.status !== 'completed' || !job.result) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Export job is in ${job.status} state` },
        { status: 400 }
      )
    }

    const { result } = job
    let body: Buffer | string

    // Handle binary content (PDF/Excel) vs text content (CSV/JSON)
    if (result.format === 'pdf' || result.format === 'excel') {
      body = Buffer.from(result.content, 'base64')
    } else {
      body = result.content
    }

    logApi('GET', `/api/analytics/export/download/${jobId}`, 200, undefined, {
      userId: user.id,
      format: result.format,
      filename: result.filename
    })

    // Sanitize filename for Content-Disposition header
    // 1. Basic cleaning: trim and remove control characters (0x00-0x1F) and delete (0x7F)
    let cleanFilename = (result.filename || 'export').trim().replace(/[\x00-\x1F\x7F]/g, '')

    // 2. ASCII-safe version for 'filename' parameter
    // Replace non-ASCII characters with underscore, remove double quotes to prevent breaking the header string
    let asciiFilename = cleanFilename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '')
    
    // Limit length to 255 characters
    if (asciiFilename.length > 255) {
      asciiFilename = asciiFilename.substring(0, 255)
    }
    
    // Fallback to safe default if empty
    if (!asciiFilename) {
      asciiFilename = 'export_file'
    }

    // 3. RFC5987 encoded version for 'filename*' parameter (Handles full UTF-8)
    // Encode for safe inclusion in header
    const encodedFilename = encodeURIComponent(cleanFilename)
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': body.length.toString(),
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (error) {
    logError('Error downloading analytics export:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to download export' },
      { status: 500 }
    )
  }
}
