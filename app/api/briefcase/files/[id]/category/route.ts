import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import {
  withDocumentAuth,
  getSql,
  createErrorResponse,
  verifyDocumentOwnership
} from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

export const POST = withDocumentAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const { category } = await request.json()

      if (!category || typeof category !== 'string') {
        return createErrorResponse('Category is required', 400)
      }

      const sql = getSql()

      // Get document details for tracking previous category
      const { document, error } = await verifyDocumentOwnership(
        documentId,
        user.id,
        'id, category'
      )

      if (error || !document) {
        return createErrorResponse(error || 'Document not found', 404)
      }

      // Update category
      await sql`
        UPDATE documents 
        SET category = ${category}, updated_at = NOW()
        WHERE id = ${documentId}
      `

      // Log activity
      const detailsJson = JSON.stringify({
        newCategory: category,
        previousCategory: document.category
      })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${documentId}, ${user.id}, ${'category_updated'}, ${detailsJson}::jsonb, NOW())
      `

      return NextResponse.json({
        success: true,
        category,
        message: 'Category updated successfully'
      })

    } catch (error) {
      logError('Update category error:', error)
      return createErrorResponse('Failed to update category', 500)
    }
  }
)

export const GET = withDocumentAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const { document, error } = await verifyDocumentOwnership(
        documentId,
        user.id,
        'id, category'
      )

      if (error || !document) {
        return createErrorResponse(error || 'Document not found', 404)
      }

      return NextResponse.json({
        category: document.category
      })

    } catch (error) {
      logError('Get category error:', error)
      return createErrorResponse('Failed to get category', 500)
    }
  }
)
