import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { createToken } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { rateLimitByIp } from '@/lib/rate-limit'

// Typed global cache for simple in-memory rate limiting
declare global {
  // eslint-disable-next-line no-var
  var __signinRateLimit: Map<string, { count: number; ts: number }> | undefined
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('signin', ip, 60_000, 20)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const BodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { email, password } = parsed.data

    const client = await createClient()
    
    // Get user from database
    const { rows } = await client.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    )

    const user = rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

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
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
