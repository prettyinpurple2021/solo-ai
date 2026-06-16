
import { NextRequest,} from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils'
import { logInfo, logError } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, type = 'demo_request' } = body

    if (!name || !email) {
      return createErrorResponse('Name and email are required', 400)
    }

    // Send email via Zoho Mail SMTP if configured
    try {
        const { isEmailConfigured, sendTransactionalEmail, getDefaultFromAddress } = await import('@/lib/mail-transport');
        const adminInbox = process.env.CONTACT_INBOX_EMAIL || process.env.SMTP_USER;
        if (isEmailConfigured() && adminInbox) {
            await sendTransactionalEmail({
                from: getDefaultFromAddress(),
                to: adminInbox,
                subject: `New Contact Request: ${type}`,
                html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Type:</strong> ${type}</p>`
            });
            logInfo('Contact email dispatched via SMTP');
        } else {
             logInfo('Contact request logged (Email service not configured):', { 
                type, 
                name, 
                email: email.replace(/(?<=.{3}).(?=.*@)/g, '*') // mask email for logs
            })
        }
    } catch (emailError) {
        logError('Failed to send contact email:', emailError);
        // Fallback to logging is implicit success for the user, but we log the error
    }

    return createSuccessResponse(
      { success: true },
      'Request submitted successfully'
    )

  } catch (error) {
    logError('Contact API error:', error)
    return createErrorResponse('Failed to submit request', 500)
  }
}
