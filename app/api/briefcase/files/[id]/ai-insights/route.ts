import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

// Type for Cloudflare service bindings
interface Env {
  GOOGLE_AI_WORKER: {
    fetch: (request: Request) => Promise<Response>
  }
}


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = id
    const sql = getSql()

    // Get document info with file data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id, name, mime_type, file_data, user_id
      FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    const document = documentRows[0]

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if document is text-based for AI analysis
    const textBasedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/typescript',
      'application/typescript',
    ]

    if (!textBasedTypes.includes(document.mime_type)) {
      return NextResponse.json({
        error: 'Document type not suitable for AI analysis',
        supportedTypes: textBasedTypes
      }, { status: 400 })
    }

    // Get file content from database
    const fileBuffer = document.file_data
    const content = fileBuffer.toString('utf-8')

    if (content.length === 0) {
      return NextResponse.json({
        error: 'Document is empty'
      }, { status: 400 })
    }

    // Limit content size for AI processing (50KB max)
    const maxContentLength = 50000
    const truncatedContent = content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '...'
      : content

    // Generate AI insights using Google AI Worker
    const env = process.env as unknown as Env
    const googleAiWorker = env.GOOGLE_AI_WORKER

    if (!googleAiWorker) {
      return NextResponse.json({ error: 'AI analysis service temporarily unavailable' }, { status: 503 })
    }

    // Create request to Google AI worker
    const workerRequest = new Request('https://worker/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: truncatedContent,
        fileName: document.name,
        mimeType: document.mime_type
      })
    })

    // Call the worker
    const workerResponse = await googleAiWorker.fetch(workerRequest)

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text()
      logError('Google AI Worker error:', errorText)
      return NextResponse.json({ error: 'Failed to generate AI insights' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workerResult = await workerResponse.json() as any
    const insights = workerResult.insights

    // Save insights to database
    const insightsJson = JSON.stringify(insights)
    await sql`
      UPDATE documents 
      SET ai_insights = ${insightsJson}::jsonb, updated_at = NOW()
      WHERE id = ${documentId}
    `

    // Log activity
    const activityDetailsJson = JSON.stringify({
      fileName: document.name,
      fileType: document.mime_type,
      contentLength: content.length,
      insightsGenerated: Object.keys(insights).length,
    })
    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${documentId}, ${user.id}, ${'ai_analyzed'}, ${activityDetailsJson}::jsonb, NOW())
    `

    return NextResponse.json({
      success: true,
      insights,
      document: {
        id: document.id,
        name: document.name,
        type: document.file_type,
        size: document.size,
      }
    })

  } catch (error) {
    logError('AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}

