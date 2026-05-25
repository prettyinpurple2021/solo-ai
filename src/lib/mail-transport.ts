import nodemailer, { type Transporter } from 'nodemailer'

import { logError, logInfo } from '@/lib/logger'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const DEFAULT_FROM = 'SoloSuccess AI <support@solosuccessai.fun>'

let cachedTransporter: Transporter | null = null

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const password = process.env.SMTP_PASSWORD?.trim()

  if (!host || !user || !password) {
    return null
  }

  const port = Number(process.env.SMTP_PORT ?? '587')
  const secure =
    process.env.SMTP_SECURE === 'true' || (Number.isFinite(port) && port === 465)

  return { host, port, secure, user, password }
}

/** True when Zoho (or any SMTP) credentials are present. */
export function isEmailConfigured(): boolean {
  return getSmtpConfig() !== null
}

export function getDefaultFromAddress(): string {
  return process.env.FROM_EMAIL?.trim() || DEFAULT_FROM
}

function getTransporter(): Transporter | null {
  if (cachedTransporter) {
    return cachedTransporter
  }

  const config = getSmtpConfig()
  if (!config) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure && config.port === 587,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })

  return cachedTransporter
}

export async function sendTransactionalEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const transporter = getTransporter()
  if (!transporter) {
    return { success: false, error: 'Email service not configured (SMTP)' }
  }

  const to = Array.isArray(params.to) ? params.to : [params.to]

  try {
    const info = await transporter.sendMail({
      from: params.from ?? getDefaultFromAddress(),
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    logInfo('Transactional email sent', { messageId: info.messageId, toCount: to.length })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    logError('Transactional email failed', error)
    const message = error instanceof Error ? error.message : 'Unknown email error'
    return { success: false, error: message }
  }
}
