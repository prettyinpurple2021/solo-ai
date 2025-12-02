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

      // Get permissions with access counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const permissions = await sql`
        SELECT 
          dp.id,
          dp.user_id,
          dp.email,
          dp.role,
          dp.granted_at,
          dp.expires_at,
          dp.is_active,
          u.name as user_name,
          u.avatar_url,
          dp.granted_by,
          gb.name as granted_by_name,
          COALESCE(a.access_count, 0) AS access_count
        FROM document_permissions dp
        LEFT JOIN users u ON dp.user_id = u.id
        LEFT JOIN users gb ON dp.granted_by = gb.id
        LEFT JOIN (
          SELECT permission_id, COUNT(*) AS access_count
          FROM document_access_logs
          WHERE document_id = ${documentId}
          GROUP BY permission_id
        ) a ON a.permission_id = dp.id
        WHERE dp.document_id = ${documentId} AND dp.is_active = true
        ORDER BY dp.granted_at DESC
      ` as any[]

      return NextResponse.json(permissions.map(p => ({
        id: p.id,
        userId: p.user_id,
        email: p.email,
        name: p.user_name || p.email.split('@')[0],
        avatar: p.avatar_url,
        role: p.role,
        granted: p.granted_at,
        expiresAt: p.expires_at,
        status: p.is_active ? 'accepted' : 'pending',
        accessCount: Number(p.access_count) || 0,
        invitedBy: p.granted_by_name || 'Unknown'
      })))

    } catch (error) {
      logError('Get permissions error:', error)
      return createErrorResponse('Failed to get permissions', 500)
    }
  }
)

export const POST = withDocumentAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (request: NextRequest, user: any, documentId: string) => {
    try {
      const { email, role, message } = await request.json()

      if (!email || !role) {
        return createErrorResponse('Email and role are required', 400)
      }

      const sql = getSql()

      // Check if permission already exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingPermission = await sql`
        SELECT id FROM document_permissions 
        WHERE document_id = ${documentId} AND email = ${email} AND is_active = true
      ` as any[]

      if (existingPermission.length > 0) {
        return createErrorResponse('Permission already exists for this email', 400)
      }

      // Create permission
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newPermission = await sql`
        INSERT INTO document_permissions (
          document_id, user_id, email, role, granted_by, granted_at, is_active
        ) VALUES (${documentId}, ${null}, ${email}, ${role}, ${user.id}, NOW(), ${true})
        RETURNING *
      ` as any[]

      // Log activity
      const detailsJson = JSON.stringify({
        email,
        role,
        message: message || null
      })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${documentId}, ${user.id}, ${'permission_granted'}, ${detailsJson}::jsonb, NOW())
      `

      return NextResponse.json({
        id: newPermission[0].id,
        email: newPermission[0].email,
        role: newPermission[0].role,
        granted: newPermission[0].granted_at,
        status: 'pending',
        accessCount: 0,
        invitedBy: user.full_name || user.email
      })

    } catch (error) {
      logError('Create permission error:', error)
      return createErrorResponse('Failed to create permission', 500)
    }
  }
)
