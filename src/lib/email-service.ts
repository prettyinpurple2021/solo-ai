import { logError, logInfo } from '@/lib/logger'
import {
  getDefaultFromAddress,
  isEmailConfigured,
  sendTransactionalEmail,
} from '@/lib/mail-transport'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export class EmailService {
  /**
   * Send an email via Zoho Mail SMTP (or configured SMTP host).
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text, from = getDefaultFromAddress() } = options

    if (!isEmailConfigured()) {
      logInfo('📧 [SIMULATION] Email would be sent:', {
        to,
        subject,
        from,
        contentPreview: text || html.substring(0, 100) + '...',
      })
      return true
    }

    const result = await sendTransactionalEmail({ to, subject, html, text, from })
    if (!result.success) {
      logError('Failed to send email:', result.error)
      return false
    }

    logInfo(`📧 Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`, {
      id: result.messageId,
    })
    return true
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to SoloSuccess AI!',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>We're excited to have you on board. SoloSuccess AI is here to help you crush your goals.</p>
        <p>Get started by setting up your first goal in the dashboard.</p>
        <br>
        <p>Best,</p>
        <p>The SoloSuccess AI Team</p>
      `,
      text: `Welcome, ${name}! We're excited to have you on board. Get started by setting up your first goal in the dashboard.`,
    })
  }

  static async sendCompetitorAlertEmail(
    email: string,
    alertTitle: string,
    competitorName: string,
    severity: string
  ): Promise<boolean> {
    const color =
      severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : '#3b82f6'

    return this.sendEmail({
      to: email,
      subject: `[${severity.toUpperCase()}] Competitor Alert: ${competitorName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">New Competitor Alert</h2>
          <p><strong>Competitor:</strong> ${competitorName}</p>
          <p><strong>Alert:</strong> ${alertTitle}</p>
          <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
          <hr>
          <p>Log in to your dashboard to view full details and take action.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competitors" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
        </div>
      `,
      text: `New Competitor Alert for ${competitorName}: ${alertTitle} (${severity.toUpperCase()}). Log in to view details.`,
    })
  }
}
