import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { users } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export const runtime = 'nodejs'

const ChangeEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required to change email'),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = ChangeEmailSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { newEmail, password } = validation.data
    const db = getDb()

    // Normalize email
    const normalizedNewEmail = newEmail.toLowerCase()

    // Check if new email is same as current
    if (normalizedNewEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      )
    }

    // Check if email is already taken
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedNewEmail))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'This email is already registered to another account' },
        { status: 409 }
      )
    }

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
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, dbUser.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Password is incorrect' },
          { status: 400 }
        )
      }
    } else {
      // For OAuth users without password, we could require re-authentication
      // For now, we'll allow it but log it
      logInfo('Email change for OAuth user (no password verification)', {
        userId: user.id,
        oldEmail: dbUser.email,
        newEmail: normalizedNewEmail,
      })
    }

    // Update email
    await db
      .update(users)
      .set({
        email: normalizedNewEmail,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id))

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    logInfo('Email changed successfully', {
      userId: user.id,
      oldEmail: dbUser.email,
      newEmail: normalizedNewEmail,
      ipAddress,
    })

    return NextResponse.json({
      message: 'Email has been changed successfully. Please sign in again with your new email.',
      newEmail: normalizedNewEmail,
    })

  } catch (error) {
    logError('Error in change email endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
