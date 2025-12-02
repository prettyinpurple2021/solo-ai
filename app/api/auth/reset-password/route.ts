import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/database-client'
import { users, passwordResetTokens } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

// Validation schema for reset password request
const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ResetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: (validation.error as any).errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validation.data
    const db = getDb()

    // Find valid reset token
    const tokenResults = await db
      .select({
        id: passwordResetTokens.id,
        user_id: passwordResetTokens.user_id,
        expires_at: passwordResetTokens.expires_at,
        used_at: passwordResetTokens.used_at,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.used_at)
        )
      )
      .limit(1)

    if (tokenResults.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const resetToken = tokenResults[0]

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update user's password
    await db
      .update(users)
      .set({
        password_hash: hashedPassword,
        updated_at: new Date()
      })
      .where(eq(users.id, resetToken.user_id))

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used_at: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id))

    // Get client IP for security logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    logInfo('Password reset completed successfully', {
      userId: resetToken.user_id,
      tokenId: resetToken.id,
      ipAddress
    })

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    })

  } catch (error) {
    logError('Error in reset password endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
