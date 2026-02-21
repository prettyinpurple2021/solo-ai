
import { NextRequest, NextResponse } from 'next/server'
import { withDocumentAuth, getSql, createErrorResponse } from '@/lib/api-utils'
import { logError } from '@/lib/logger'

export const PUT = withDocumentAuth(
  async (request: NextRequest, user: any, arg_string: string) => {
    // documentId is the sessionId from the URL param
    // We also need messageId, which should be the last param
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const messageId = pathSegments[pathSegments.length - 1]

    try {
      const body = await request.json()
      const { content } = body

      if (!content) {
        return createErrorResponse('Content is required', 400)
      }

      const sql = getSql()

      // Verify ownership (only sender can edit)
      const existing = await sql`
        SELECT sender_id FROM collaboration_messages WHERE id = ${messageId}
      `

      if (existing.length === 0) {
        return createErrorResponse('Message not found', 404)
      }

      if (existing[0].sender_id !== user.id) {
        return createErrorResponse('You can only edit your own messages', 403)
      }

      const [updatedMessage] = await sql`
        UPDATE collaboration_messages 
        SET content = ${content}, updated_at = NOW()
        WHERE id = ${messageId}
        RETURNING *
      ` as any[]

      return NextResponse.json({ 
        success: true, 
        data: { message: updatedMessage } 
      })

    } catch (error) {
      logError('Error updating message:', error)
      return createErrorResponse('Failed to update message', 500)
    }
  }
)

export const DELETE = withDocumentAuth(
  async (request: NextRequest, user: any, arg_string: string) => {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const messageId = pathSegments[pathSegments.length - 1]

    try {
      const sql = getSql()

      // Verify ownership
      const existing = await sql`
        SELECT sender_id FROM collaboration_messages WHERE id = ${messageId}
      `

      if (existing.length === 0) {
        return createErrorResponse('Message not found', 404)
      }

      if (existing[0].sender_id !== user.id) {
        return createErrorResponse('You can only delete your own messages', 403)
      }

      await sql`
        UPDATE collaboration_messages 
        SET is_deleted = true 
        WHERE id = ${messageId}
      `

      return NextResponse.json({ 
        success: true, 
        message: 'Message deleted' 
      })

    } catch (error) {
      logError('Error deleting message:', error)
      return createErrorResponse('Failed to delete message', 500)
    }
  }
)
