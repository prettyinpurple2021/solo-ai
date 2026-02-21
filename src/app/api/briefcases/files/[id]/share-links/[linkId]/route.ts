import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { 
  withDocumentAuth, 
  getSql, 
  createErrorResponse 
} from '@/lib/api-utils'

// Node.js runtime required 
export const runtime = 'nodejs'

export const DELETE = withDocumentAuth(
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const url = new URL(request.url)
      // Extract linkId from the URL path manually since we are in a nested route [id]/share-links/[linkId]
      // The path format is /api/briefcase/files/[id]/share-links/[linkId]
      const pathSegments = url.pathname.split('/')
      const linkId = pathSegments[pathSegments.length - 1]

      if (!linkId) {
        return createErrorResponse('Share Link ID is required', 400)
      }

      const sql = getSql()

      // Verify the link belongs to the document and user has access (checked by withDocumentAuth)
      // Also perform soft delete by setting is_active = false
      const result = await sql`
        UPDATE document_share_links 
        SET is_active = false 
        WHERE id = ${linkId} AND document_id = ${documentId}
        RETURNING id
      ` as any[]

      if (result.length === 0) {
        return createErrorResponse('Share link not found or already deleted', 404)
      }

      // Log activity
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${documentId}, ${user.id}, ${'share_link_deleted'}, ${JSON.stringify({ linkId })}: jsonb, NOW())
      `

      logInfo('Share link deleted', { linkId, documentId, userId: user.id })

      return NextResponse.json({ success: true, id: linkId })

    } catch (error) {
      logError('Delete share link error:', error)
      return createErrorResponse('Failed to delete share link', 500)
    }
  }
)
