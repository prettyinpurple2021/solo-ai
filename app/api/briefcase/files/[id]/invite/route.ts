import { logError, logWarn, logInfo } from '@/lib/logger'
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
      const { email, role, message } = await request.json()

      if (!email || !role) {
        return createErrorResponse('Email and role are required', 400)
      }

      const sql = getSql()

      // Get document details for email
      const { document, error } = await verifyDocumentOwnership(
        documentId,
        user.id,
        'id, name'
      )

      if (error || !document) {
        return createErrorResponse(error || 'Document not found', 404)
      }

      // Check if permission already exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingPermission = await sql`
        SELECT id FROM document_permissions 
        WHERE document_id = ${documentId} AND email = ${email} AND is_active = true
      ` as any[]

      if (existingPermission.length > 0) {
        return createErrorResponse('User already has access to this document', 400)
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
        message: message || null,
        documentName: document.name
      })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${documentId}, ${user.id}, ${'invitation_sent'}, ${detailsJson}::jsonb, NOW())
      `

      // Send email invitation via Resend
      try {
        const { Resend } = await import('resend')
        const resendApiKey = process.env.RESEND_API_KEY
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY not configured')
        }
        const resend = new Resend(resendApiKey)
        const appUrl = process.env.APP_URL || 'https://solobossai.fun'
        const inviteLink = `${appUrl}/briefcase/invite/accept?doc=${encodeURIComponent(documentId)}&email=${encodeURIComponent(email)}`
        await resend.emails.send({
          from: 'SoloBoss AI <noreply@solobossai.fun>',
          to: email,
          subject: `You have been invited to access "${document.name}"`,
          html: `<p>Hello,</p>
                 <p>${user.full_name || user.email} has invited you to access the document <strong>${document.name}</strong> with <strong>${role}</strong> access.</p>
                 ${message ? `<p>Message from ${user.full_name || user.email}: ${message}</p>` : ''}
                 <p>Click the link below to accept the invitation:</p>
                 <p><a href="${inviteLink}">Accept Invitation</a></p>
                 <p>If you did not expect this email, you can ignore it.</p>`
        })
        logInfo(`Invitation email sent to ${email} for document ${document.name} with role ${role}`)
      } catch (mailError) {
        logWarn('Failed to send invitation email. Proceeding without email.', mailError)
      }

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
      logError('Send invitation error:', error)
      return createErrorResponse('Failed to send invitation', 500)
    }
  }
)
