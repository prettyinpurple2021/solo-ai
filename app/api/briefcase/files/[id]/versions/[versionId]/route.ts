import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id: documentId, versionId } = params
    const sql = getSql()

    // Verify document ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    if (documentRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get version details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const versionRows = await sql`
      SELECT 
        dv.*,
        u.name as created_by_name,
        u.avatar_url
      FROM document_versions dv
      LEFT JOIN users u ON dv.created_by = u.id
      WHERE dv.id = ${versionId} AND dv.document_id = ${documentId}
    ` as any[]

    if (versionRows.length === 0) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const version = versionRows[0]

    return NextResponse.json({
      id: version.id,
      versionNumber: version.version_number,
      fileName: version.file_name,
      fileSize: version.file_size,
      mimeType: version.mime_type,
      createdAt: version.created_at,
      createdBy: version.created_by,
      createdByName: version.created_by_name || 'Unknown',
      createdByAvatar: version.avatar_url,
      changelog: version.changelog,
      isCurrent: version.is_current
    })

  } catch (error) {
    logError('Get version error:', error)
    return NextResponse.json({
      error: 'Failed to get version'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id: documentId, versionId } = params
    const { action } = await request.json()
    const sql = getSql()

    // Verify document ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    if (documentRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get version details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const versionRows = await sql`
      SELECT * FROM document_versions 
      WHERE id = ${versionId} AND document_id = ${documentId}
    ` as any[]

    if (versionRows.length === 0) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const version = versionRows[0]

    switch (action) {
      case 'restore':
        // Restore this version as current
        await sql`
          UPDATE document_versions 
          SET is_current = false 
          WHERE document_id = ${documentId}
        `

        await sql`
          UPDATE document_versions 
          SET is_current = true 
          WHERE id = ${versionId}
        `

        // Update the main document with this version's data
        await sql`
          UPDATE documents 
          SET 
            file_data = ${version.file_data},
            file_size = ${version.file_size},
            mime_type = ${version.mime_type},
            updated_at = NOW()
          WHERE id = ${documentId}
        `

        // Log activity
        const restoreDetailsJson = JSON.stringify({
          versionId,
          versionNumber: version.version_number,
          changelog: version.changelog
        })
        await sql`
          INSERT INTO document_activity (document_id, user_id, action, details, created_at)
          VALUES (${documentId}, ${user.id}, ${'version_restored'}, ${restoreDetailsJson}::jsonb, NOW())
        `

        return NextResponse.json({
          success: true,
          message: 'Version restored successfully'
        })

      case 'download':
        // Return file data for download
        return new NextResponse(version.file_data, {
          headers: {
            'Content-Type': version.mime_type,
            'Content-Disposition': `attachment; filename="${version.file_name}"`,
            'Content-Length': version.file_size.toString()
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    logError('Version action error:', error)
    return NextResponse.json({
      error: 'Failed to process version action'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id: documentId, versionId } = params
    const sql = getSql()

    // Verify document ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    if (documentRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get version details before deletion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const versionRows = await sql`
      SELECT version_number, changelog, is_current FROM document_versions 
      WHERE id = ${versionId} AND document_id = ${documentId}
    ` as any[]

    if (versionRows.length === 0) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const version = versionRows[0]

    // Don't allow deletion of current version
    if (version.is_current) {
      return NextResponse.json({ error: 'Cannot delete current version' }, { status: 400 })
    }

    // Delete version
    await sql`
      DELETE FROM document_versions 
      WHERE id = ${versionId} AND document_id = ${documentId}
    `

    // Log activity
    const deleteDetailsJson = JSON.stringify({
      versionId,
      versionNumber: version.version_number,
      changelog: version.changelog
    })
    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${documentId}, ${user.id}, ${'version_deleted'}, ${deleteDetailsJson}::jsonb, NOW())
    `

    return NextResponse.json({
      success: true,
      message: 'Version deleted successfully'
    })

  } catch (error) {
    logError('Delete version error:', error)
    return NextResponse.json({
      error: 'Failed to delete version'
    }, { status: 500 })
  }
}
