import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'nodejs'

import {
  getSql
} from '@/lib/api-utils'


export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const { identifier, password, isEmail } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    // Get user from database - check both email and username
    let users
    if (isEmail) {
      // Search by email
      users = await sql`
        SELECT id, email, password_hash, full_name, username, date_of_birth, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, created_at
        FROM users 
        WHERE email = ${identifier.toLowerCase()}
      `
    } else {
      // Search by username
      users = await sql`
        SELECT id, email, password_hash, full_name, username, date_of_birth, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, created_at
        FROM users 
        WHERE username = ${identifier.toLowerCase()}
      `
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if user has a password hash (for existing users without passwords)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Please set up a password for your account' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      username: user.username
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      date_of_birth: user.date_of_birth,
      subscription_tier: user.subscription_tier || 'launch',
      subscription_status: user.subscription_status || 'active',
      stripe_customer_id: user.stripe_customer_id,
      stripe_subscription_id: user.stripe_subscription_id,
      current_period_start: user.current_period_start,
      current_period_end: user.current_period_end,
      cancel_at_period_end: user.cancel_at_period_end || false,
      created_at: user.created_at
    }

    const response = NextResponse.json({
      user: userData,
      token: token,
      message: 'Login successful'
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
    logError('Signin error:', error)
    logError('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}
