import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; permissionId: string }> }
) {
  try {
    const params = await context.params
    const { id: documentId, permissionId } = params

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

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

    // Update permission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPermissionRows = await sql`
      UPDATE document_permissions 
      SET role = ${role}
      WHERE id = ${permissionId} AND document_id = ${documentId}
      RETURNING *
    ` as any[]

    if (updatedPermissionRows.length === 0) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    const updatedPermission = updatedPermissionRows[0]

    // Log activity
    const detailsJson = JSON.stringify({
      permissionId,
      newRole: role,
      email: updatedPermission.email
    })
    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${documentId}, ${user.id}, ${'permission_updated'}, ${detailsJson}::jsonb, NOW())
    `

    return NextResponse.json({
      success: true,
      role: updatedPermission.role
    })

  } catch (error) {
    logError('Update permission error:', error)
    return NextResponse.json({
      error: 'Failed to update permission'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; permissionId: string }> }
) {
  try {
    const params = await context.params
    const { id: documentId, permissionId } = params

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Get permission details before deletion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permissionRows = await sql`
      SELECT email, role FROM document_permissions 
      WHERE id = ${permissionId} AND document_id = ${documentId}
    ` as any[]

    if (permissionRows.length === 0) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    const permission = permissionRows[0]

    // Delete permission
    await sql`
      DELETE FROM document_permissions 
      WHERE id = ${permissionId} AND document_id = ${documentId}
    `

    // Log activity
    const detailsJson = JSON.stringify({
      permissionId,
      email: permission.email,
      role: permission.role
    })
    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${documentId}, ${user.id}, ${'permission_revoked'}, ${detailsJson}::jsonb, NOW())
    `

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully'
    })

  } catch (error) {
    logError('Delete permission error:', error)
    return NextResponse.json({
      error: 'Failed to delete permission'
    }, { status: 500 })
  }
}
