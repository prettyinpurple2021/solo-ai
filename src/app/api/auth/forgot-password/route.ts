import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/database-client'
import { users, passwordResetTokens } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { sendPasswordResetEmail } from '@/lib/email'
import { logError, logInfo } from '@/lib/logger'
import crypto from 'crypto'

export const runtime = 'nodejs'

// Validation schema for forgot password request
const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ForgotPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { email } = validation.data
    const db = getDb()

    // Check if user exists
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        full_name: users.full_name,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account with this email exists, a password reset link has been sent."

    if (userResults.length === 0) {
      logInfo('Password reset requested for non-existent email', { email })
      return NextResponse.json({ message: successMessage })
    }

    const user = userResults[0]

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Get client IP and user agent for security logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Invalidate any existing reset tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ used_at: new Date() })
      .where(eq(passwordResetTokens.user_id, user.id))

    // Create new reset token
    await db.insert(passwordResetTokens).values({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.full_name || 'User',
      resetToken
    )

    if (!emailResult.success) {
      logError('Failed to send password reset email', { 
        userId: user.id, 
        email: user.email,
        error: emailResult.error 
      })
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    logInfo('Password reset email sent successfully', { 
      userId: user.id, 
      email: user.email,
      ipAddress 
    })

    return NextResponse.json({ message: successMessage })

  } catch (error) {
    logError('Error in forgot password endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
