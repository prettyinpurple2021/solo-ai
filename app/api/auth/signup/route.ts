import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'
import { enqueueOnboardingWorkflow } from '@/lib/onboarding/onboarding-queue'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'nodejs'
// Use Web Crypto API for Edge Runtime compatibility
function generateUUID() {
  return crypto.randomUUID()
}



function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const { email, password, metadata } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists (by email or username)
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} OR username = ${metadata?.username?.toLowerCase() || ''}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Extract metadata
    const fullName = metadata?.full_name || ''
    const usernameValue = (metadata?.username && String(metadata.username).trim().length > 0)
      ? String(metadata.username).trim().toLowerCase()
      : null
    const dateOfBirth = metadata?.date_of_birth || null

    // Create user in database
    const _userId = generateUUID()
    const newUsers = await sql`
      INSERT INTO users (id, email, password_hash, full_name, username, date_of_birth, subscription_tier, subscription_status, cancel_at_period_end, created_at, updated_at)
      VALUES (${_userId}, ${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${usernameValue}, ${dateOfBirth}, 'launch', 'active', false, NOW(), NOW())
      RETURNING id, email, full_name, username, date_of_birth, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, created_at
    `

    if (newUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    const newUser = newUsers[0]

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data (without password)
    const userData = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      username: newUser.username,
      date_of_birth: newUser.date_of_birth,
      subscription_tier: newUser.subscription_tier || 'launch',
      subscription_status: newUser.subscription_status || 'active',
      stripe_customer_id: newUser.stripe_customer_id,
      stripe_subscription_id: newUser.stripe_subscription_id,
      current_period_start: newUser.current_period_start,
      current_period_end: newUser.current_period_end,
      cancel_at_period_end: newUser.cancel_at_period_end || false,
      created_at: newUser.created_at
    }

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
      user: userData,
      token: token,
      message: 'Signup successful'
    })

    // Set HTTP-only cookie as backup
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    logError('Signup error:', error)

    // Temporary debug logging
    try {
      const fs = require('fs');
      const debugMsg = `[${new Date().toISOString()}] Signup Error: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack'}\n\n`;
      fs.appendFileSync('debug-auth.log', debugMsg);
    } catch {
      // ignore
    }

    logError('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: message,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
