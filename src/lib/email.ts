import { logError, logWarn } from '@/lib/logger'
import { getDefaultFromAddress, isEmailConfigured, sendTransactionalEmail } from '@/lib/mail-transport'

async function sendOrFail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; data?: { id?: string }; error?: unknown }> {
  if (!isEmailConfigured()) {
    logWarn('Email service not configured - SMTP (Zoho Mail) env vars missing')
    return { success: false, error: 'Email service not configured' }
  }

  const result = await sendTransactionalEmail({
    from: getDefaultFromAddress(),
    to,
    subject,
    html,
  })

  if (!result.success) {
    logError('Error sending email:', result.error)
    return { success: false, error: result.error }
  }

  return { success: true, data: { id: result.messageId } }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    return await sendOrFail(
      email,
      'Welcome to SoloSuccess AI - Your Empire Awaits! 👑',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin-bottom: 10px;">Welcome to SoloSuccess AI! 👑</h1>
            <p style="color: #6B7280; font-size: 16px;">Your AI-powered empire building journey starts now</p>
          </div>
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Hey ${name}! 🚀</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">You're now part of an exclusive community of founder entrepreneurs building their empires with AI!</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Start Building Your Empire 🏰
            </a>
          </div>
        </div>
      `
    )
  } catch (error) {
    logError('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://solosuccessai.fun'}/reset-password?token=${resetToken}`
    return await sendOrFail(
      email,
      'Reset Your Password - SoloSuccess AI 🔐',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Password Reset Request 🔐</h1>
          <p>Hey ${name}, click below to reset your password:</p>
          <p><a href="${resetUrl}">Reset My Password</a></p>
          <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour.</p>
        </div>
      `
    )
  } catch (error) {
    logError('Error sending password reset email:', error)
    return { success: false, error }
  }
}

export const sendSubscriptionConfirmation = async (
  email: string,
  name: string,
  planName: string,
  amount: number
) => {
  try {
    return await sendOrFail(
      email,
      `Welcome to ${planName} - Your Empire Just Leveled Up! 🚀`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Subscription Confirmed! 🎉</h1>
          <p>Congratulations ${name}! Your ${planName} is active for $${amount}/month.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Access Your Dashboard</a>
        </div>
      `
    )
  } catch (error) {
    logError('Error sending subscription confirmation:', error)
    return { success: false, error }
  }
}
