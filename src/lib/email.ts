import { logError, logWarn,} from '@/lib/logger'
import { Resend } from "resend"

// Initialize Resend client only if API key is available
// This allows builds to succeed in environments without the key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    if (!resend) {
      logWarn('Email service not configured - RESEND_API_KEY missing')
      return { success: false, error: 'Email service not configured' }
    }
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "SoloSuccess AI <noreply@solosuccess.ai>",
      to: [email],
      subject: "Welcome to SoloSuccess AI - Your Empire Awaits! 👑",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin-bottom: 10px;">Welcome to SoloSuccess AI! 👑</h1>
            <p style="color: #6B7280; font-size: 16px;">Your AI-powered empire building journey starts now</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Hey ${name}! 🚀</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">You're now part of an exclusive community of founder entrepreneurs building their empires with AI!</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; font-size: 20px; margin-bottom: 15px;">What's Next? ✨</h3>
            <ul style="color: #6B7280; font-size: 16px; line-height: 1.6;">
              <li style="margin-bottom: 10px;">🎯 Set up your first goals in SlayList</li>
              <li style="margin-bottom: 10px;">🤖 Meet your AI Squad - 8 powerful agents ready to help</li>
              <li style="margin-bottom: 10px;">💼 Organize your projects in Briefcase</li>
              <li style="margin-bottom: 10px;">🎨 Design your brand identity in Brand Studio</li>
              <li style="margin-bottom: 10px;">🛡️ Activate Burnout Shield for wellness tracking</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Start Building Your Empire 🏰
            </a>
          </div>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              Need help? Reply to this email or visit our support center.<br>
              You're destined for greatness! 💪✨
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      logError("Error sending welcome email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logError("Error sending welcome email:", error)
    return { success: false, error }
  }
}

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  try {
    if (!resend) {
      logWarn('Email service not configured - RESEND_API_KEY missing')
      return { success: false, error: 'Email service not configured' }
    }
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://solosuccess.ai'}/reset-password?token=${resetToken}`
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "SoloSuccess AI <noreply@solosuccess.ai>",
      to: [email],
      subject: "Reset Your Password - SoloSuccess AI 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin-bottom: 10px;">Password Reset Request 🔐</h1>
            <p style="color: #6B7280; font-size: 16px;">We received a request to reset your password</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Hey ${name}! 👋</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">No worries, it happens to the best of us! Click the button below to reset your password.</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔑 Reset My Password
            </a>
          </div>
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 10px;">⚠️ Important Security Information</h3>
            <ul style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">This link will expire in 1 hour for security</li>
              <li style="margin-bottom: 8px;">If you didn't request this reset, please ignore this email</li>
              <li style="margin-bottom: 8px;">Your password won't change until you click the link above</li>
            </ul>
          </div>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #8B5CF6; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      logError("Error sending password reset email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logError("Error sending password reset email:", error)
    return { success: false, error }
  }
}

export const sendSubscriptionConfirmation = async (email: string, name: string, planName: string, amount: number) => {
  try {
    if (!resend) {
      logWarn('Email service not configured - RESEND_API_KEY missing')
      return { success: false, error: 'Email service not configured' }
    }
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "SoloSuccess AI <noreply@solosuccess.ai>",
      to: [email],
      subject: `Welcome to ${planName} - Your Empire Just Leveled Up! 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 28px; margin-bottom: 10px;">Subscription Confirmed! 🎉</h1>
            <p style="color: #6B7280; font-size: 16px;">Your ${planName} is now active</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Congratulations ${name}! 👑</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">You've unlocked the full power of ${planName} for just $${amount}/month</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Your Empire Tools Are Ready! ⚡</h3>
            <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              All premium features are now unlocked and ready to accelerate your success:
            </p>
            <ul style="color: #6B7280; font-size: 16px; line-height: 1.6;">
              <li style="margin-bottom: 10px;">✅ Full AI Squad access</li>
              <li style="margin-bottom: 10px;">✅ Advanced automation tools</li>
              <li style="margin-bottom: 10px;">✅ Priority support</li>
              <li style="margin-bottom: 10px;">✅ Unlimited projects</li>
              <li style="margin-bottom: 10px;">✅ Premium integrations</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Access Your Premium Dashboard 🏆
            </a>
          </div>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              Questions? We're here to help you dominate! 💪<br>
              Manage your subscription anytime in your account settings.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      logError("Error sending subscription confirmation:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logError("Error sending subscription confirmation:", error)
    return { success: false, error }
  }
}
