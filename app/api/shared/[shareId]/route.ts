import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { getSql } from '@/lib/api-utils'
import bcrypt from 'bcryptjs'

// Node.js runtime required for bcryptjs password verification
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const contextParams = await context.params
    const { shareId } = contextParams


    // Get share link details
    const sql = getSql()
    const shareLinkResult = await sql`
      SELECT 
        dsl.*,
        d.name, d.original_name, d.file_type, d.mime_type, d.size, d.file_data,
        d.description, d.tags, d.metadata, d.created_at, d.updated_at
      FROM document_share_links dsl
      JOIN documents d ON dsl.document_id = d.id
      WHERE dsl.id = ${shareId} AND dsl.is_active = true
    `
    const shareLink = shareLinkResult[0]

    if (!shareLink) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 })
    }

    // Check if link has expired
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Check access count limit
    if (shareLink.max_access_count && shareLink.access_count >= shareLink.max_access_count) {
      return NextResponse.json({ error: 'Share link access limit reached' }, { status: 429 })
    }

    // Increment access count
    await sql`
      UPDATE document_share_links 
      SET access_count = access_count + 1
      WHERE id = ${shareId}
    `

    // Log access activity
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')
    const details = JSON.stringify({
      shareId,
      ipAddress,
      userAgent
    })

    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${shareLink.document_id}, NULL, 'shared_access', ${details}, NOW())
    `

    return NextResponse.json({
      file: {
        id: shareLink.document_id,
        name: shareLink.name,
        originalName: shareLink.original_name,
        fileType: shareLink.file_type,
        mimeType: shareLink.mime_type,
        size: shareLink.size,
        description: shareLink.description,
        tags: shareLink.tags,
        metadata: shareLink.metadata,
        createdAt: shareLink.created_at,
        updatedAt: shareLink.updated_at
      },
      shareInfo: {
        permissions: shareLink.permissions,
        downloadEnabled: shareLink.download_enabled,
        requireAuth: shareLink.require_auth,
        hasPassword: !!shareLink.password_hash,
        expiresAt: shareLink.expires_at,
        accessCount: shareLink.access_count + 1,
        maxAccess: shareLink.max_access_count
      }
    })

  } catch (error) {
    logError('Get shared file error:', error)
    return NextResponse.json({
      error: 'Failed to access shared file'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const contextParams = await context.params
    const { shareId } = contextParams
    const { password, action } = await request.json()


    // Get share link details
    const sql = getSql()
    const shareLinkResult = await sql`
      SELECT 
        dsl.*,
        d.name, d.original_name, d.file_type, d.mime_type, d.size, d.file_data
      FROM document_share_links dsl
      JOIN documents d ON dsl.document_id = d.id
      WHERE dsl.id = ${shareId} AND dsl.is_active = true
    `
    const shareLink = shareLinkResult[0]

    if (!shareLink) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 })
    }

    // Check if link has expired
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Verify password if required
    if (shareLink.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 })
      }

      const isValidPassword = await bcrypt.compare(password, shareLink.password_hash)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    }

    // Handle different actions
    switch (action) {
      case 'download':
        if (!shareLink.download_enabled) {
          return NextResponse.json({ error: 'Download not allowed' }, { status: 403 })
        }

        // Return file data for download
        return new NextResponse(shareLink.file_data, {
          headers: {
            'Content-Type': shareLink.mime_type,
            'Content-Disposition': `attachment; filename="${shareLink.original_name}"`,
            'Content-Length': shareLink.size.toString()
          }
        })

      case 'preview':
        // Return file data for preview
        return new NextResponse(shareLink.file_data, {
          headers: {
            'Content-Type': shareLink.mime_type,
            'Content-Disposition': `inline; filename="${shareLink.original_name}"`,
            'Content-Length': shareLink.size.toString()
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    logError('Shared file action error:', error)
    return NextResponse.json({
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
