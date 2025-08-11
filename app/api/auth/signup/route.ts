import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { createToken } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Basic in-memory rate limiting per IP (best-effort)
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    // Move this to a separate types.d.ts file if needed
    type RateLimitEntry = { count: number; ts: number };
    const rateLimit = globalThis as { __signupRateLimit?: Map<string, RateLimitEntry> };
    if (!rateLimit.__signupRateLimit) {
      rateLimit.__signupRateLimit = new Map<string, RateLimitEntry>()
    }
    const map = rateLimit.__signupRateLimit
    const currentTime = Date.now()
    const entry = map.get(ip)
    if (!entry || currentTime - entry.ts > 60_000) {
      map.set(ip, { count: 1, ts: currentTime })
    } else {
      entry.count += 1
      if (entry.count > 20) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    }

    const { email, password, metadata } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const client = await createClient()
    
    // Check if user already exists
    const { rows: existingUsers } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const userId = uuidv4()
    const now = new Date().toISOString()
    
    const { rows } = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name`,
      [
        userId,
        email,
        passwordHash,
        metadata?.full_name || null,
        now,
        now
      ]
    )

    const user = rows[0]

    // Create JWT token
    const token = createToken(user.id, user.email)

    // Set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      token
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
