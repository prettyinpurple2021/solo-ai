import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import {
  withDocumentAuth,
  getSql,
  createErrorResponse
} from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

export const GET = withDocumentAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const sql = getSql()

      // Get document versions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const versions = await sql`
        SELECT 
          dv.id,
          dv.version_number,
          dv.file_name,
          dv.file_size,
          dv.mime_type,
          dv.created_at,
          dv.created_by,
          dv.changelog,
          dv.is_current,
          u.name as created_by_name,
          u.avatar_url
        FROM document_versions dv
        LEFT JOIN users u ON dv.created_by = u.id
        WHERE dv.document_id = ${documentId}
        ORDER BY dv.version_number DESC
      ` as any[]

      return NextResponse.json(versions.map(v => ({
        id: v.id,
        versionNumber: v.version_number,
        fileName: v.file_name,
        fileSize: v.file_size,
        mimeType: v.mime_type,
        createdAt: v.created_at,
        createdBy: v.created_by,
        createdByName: v.created_by_name || 'Unknown',
        createdByAvatar: v.avatar_url,
        changelog: v.changelog,
        isCurrent: v.is_current
      })))

    } catch (error) {
      logError('Get versions error:', error)
      return createErrorResponse('Failed to get versions', 500)
    }
  }
)

export const POST = withDocumentAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const { changelog } = await request.json()
      const sql = getSql()

      // Get document details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const documentRows = await sql`
        SELECT id, name, file_data, file_size, mime_type FROM documents 
        WHERE id = ${documentId} AND user_id = ${user.id}
      ` as any[]

      if (documentRows.length === 0) {
        return createErrorResponse('Document not found', 404)
      }

      const doc = documentRows[0]

      // Get next version number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastVersionRows = await sql`
        SELECT version_number FROM document_versions 
        WHERE document_id = ${documentId} 
        ORDER BY version_number DESC 
        LIMIT 1
      ` as any[]

      const nextVersionNumber = lastVersionRows.length > 0 ? lastVersionRows[0].version_number + 1 : 1

      // Create new version
      const changelogText = changelog || `Version ${nextVersionNumber}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newVersionRows = await sql`
        INSERT INTO document_versions (
          document_id, version_number, file_name, file_data, file_size, 
          mime_type, created_by, changelog, is_current, created_at
        ) VALUES (${documentId}, ${nextVersionNumber}, ${doc.name}, ${doc.file_data}, ${doc.file_size}, 
        ${doc.mime_type}, ${user.id}, ${changelogText}, ${true}, NOW())
        RETURNING *
      ` as any[]
      const newVersion = newVersionRows[0]

      // Mark all other versions as not current
      await sql`
        UPDATE document_versions 
        SET is_current = false 
        WHERE document_id = ${documentId} AND id != ${newVersion.id}
      `

      // Log activity
      const activityDetailsJson = JSON.stringify({
        versionId: newVersion.id,
        versionNumber: nextVersionNumber,
        changelog: changelogText
      })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${documentId}, ${user.id}, ${'version_created'}, ${activityDetailsJson}::jsonb, NOW())
      `

      return NextResponse.json({
        id: newVersion.id,
        versionNumber: newVersion.version_number,
        fileName: newVersion.file_name,
        fileSize: newVersion.file_size,
        mimeType: newVersion.mime_type,
        createdAt: newVersion.created_at,
        createdBy: newVersion.created_by,
        changelog: newVersion.changelog,
        isCurrent: newVersion.is_current
      })

    } catch (error) {
      logError('Create version error:', error)
      return createErrorResponse('Failed to create version', 500)
    }
  }
)
