import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import * as jose from 'jose' 
import { db } from '@/lib/database-client'
import { users } from '@/shared/db/schema'
import { eq, or } from 'drizzle-orm'
import { enqueueOnboardingWorkflow } from '@/lib/onboarding/onboarding-queue'

// Node.js runtime for signup
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, metadata } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const usernameValue = (metadata?.username && String(metadata.username).trim().length > 0)
      ? String(metadata.username).trim().toLowerCase()
      : null

    // Check if user already exists
    const existingUsers = await db.select()
      .from(users)
      .where(
        or(
          eq(users.email, normalizedEmail),
          usernameValue ? eq(users.username, usernameValue) : undefined
        )
      )
      .limit(1)

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user in database within a transaction
    const newUser = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        email: normalizedEmail,
        password: passwordHash, // Assuming the column is 'password' or 'password_hash' based on schema. NextAuth uses 'password'
        full_name: metadata?.full_name || '',
        username: usernameValue,
        date_of_birth: metadata?.date_of_birth ? new Date(metadata.date_of_birth) : null,
        subscription_tier: 'launch',
        subscription_status: 'active',
        onboarding_completed: false,
        created_at: new Date(),
        updated_at: new Date()
      }).returning()

      return user
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token = await new jose.SignJWT({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    // Trigger onboarding workflow asynchronously
    try {
      const { jobId: onboardingJobId } = await enqueueOnboardingWorkflow({ userId: newUser.id })
      logInfo('Onboarding workflow queued', { userId: newUser.id, onboardingJobId })
    } catch (error) {
      logError('Failed to enqueue onboarding workflow', {
        userId: newUser.id,
        error: error instanceof Error ? error.message : String(error)
      })
    }

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        username: newUser.username,
        subscription_tier: newUser.subscription_tier,
        subscription_status: newUser.subscription_status,
        onboarding_completed: newUser.onboarding_completed,
        created_at: newUser.created_at
      },
      token: token,
      message: 'Signup successful'
    })

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    logError('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
