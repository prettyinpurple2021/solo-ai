
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

    // Send email via Resend if configured
    try {
        if (process.env.RESEND_API_KEY) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'SoloSuccess AI <onboarding@resend.dev>', // Update validation domain in prod
                to: 'support@solosuccesss.com', // Configurable admin email
                subject: `New Contact Request: ${type}`,
                html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Type:</strong> ${type}</p>`
            });
            logInfo('Contact email dispatched via Resend');
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
