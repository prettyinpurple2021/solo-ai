import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = ChangePasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data
    const db = getDb()

    // Get user with password hash
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dbUser = userResults[0]

    // Check if user has a password (OAuth users might not)
    if (!dbUser.password) {
      return NextResponse.json(
        { error: 'Password change not available for accounts signed in with social providers. Please set a password first.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, dbUser.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id))

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    logInfo('Password changed successfully', {
      userId: user.id,
      email: dbUser.email,
      ipAddress,
    })

    return NextResponse.json({
      message: 'Password has been changed successfully',
    })

  } catch (error) {
    logError('Error in change password endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
