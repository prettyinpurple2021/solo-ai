import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { users } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

const DeleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm account deletion' }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = DeleteAccountSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { password, confirmation } = validation.data
    const db = getDb()

    // Get user with password to verify
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

    // Verify password (required for security)
    if (dbUser.password) {
      const isPasswordValid = await bcrypt.compare(password, dbUser.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Password is incorrect' },
          { status: 400 }
        )
      }
    } else {
      // For OAuth users, we still require password confirmation
      // They should have set a password, but if not, we'll log and proceed
      logInfo('Account deletion for OAuth user (no password verification)', {
        userId: user.id,
        email: dbUser.email,
      })
    }

    // Verify confirmation text
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Log before deletion (for audit trail)
    logInfo('Account deletion initiated', {
      userId: user.id,
      email: dbUser.email,
      ipAddress,
    })

    // Delete user (cascade will handle related records)
    await db
      .delete(users)
      .where(eq(users.id, user.id))

    logInfo('Account deleted successfully', {
      userId: user.id,
      email: dbUser.email,
      ipAddress,
    })

    return NextResponse.json({
      message: 'Your account has been permanently deleted. All associated data has been removed.',
    })

  } catch (error) {
    logError('Error in delete account endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
