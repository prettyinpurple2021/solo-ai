import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { createToken } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { rateLimitByIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('signup', ip, 60_000, 20)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const BodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      metadata: z.object({ full_name: z.string().min(1).max(200).optional() }).optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { email, password, metadata } = parsed.data

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
