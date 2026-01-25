import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Get current user session
 * Compatible with Better Auth session endpoint for migration compatibility
 */
export async function GET(request: NextRequest) {
  try {
    // First, check for NextAuth session cookies
    const nextAuthSessionCookie = request.cookies.get('authjs.session-token')?.value ||
                                   request.cookies.get('__Secure-authjs.session-token')?.value
    
    if (nextAuthSessionCookie) {
      // Use NextAuth's built-in auth() function
      // In NextAuth v5, auth() reads from request headers/cookies automatically in server contexts
      try {
        const { auth } = await import('@/lib/auth')
        // auth() automatically uses the current request context in server components/API routes

        const session = await auth()
        
        if (session?.user) {
          const expiresValue =
            typeof session.expires === 'string'
              ? session.expires
              : (session.expires as any) instanceof Date && typeof (session.expires as any).toISOString === 'function'
                ? (session.expires as any).toISOString()
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

          // Explicitly set all fields with fallbacks - spread operator would overwrite fallbacks
          const user = session.user as any
          return NextResponse.json({
            user: {
              id: user.id || '',
              email: user.email || '',
              name: user.name || '',
              image: user.image || null,
              full_name: user.full_name || user.name || null,
              role: user.role || null,
              subscription_tier: user.subscription_tier || null,
              emailVerified: user.emailVerified || false,
              createdAt: user.createdAt || null,
              updatedAt: user.updatedAt || null,
            },
            session: {
              expires: expiresValue,
            }
          })
        }
      } catch (authError) {
        // NextAuth session check failed, fall through to JWT token check
        // This can happen if session hasn't been fully established yet
      }
    }
    
    // Try to get token from Authorization header or cookie (fallback for JWT auth)
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value
    
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }
    
    if (!token) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      )
    }

    // Verify JWT token using jose (Edge-compatible)
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      )
    }

    // Get user from database
    const sql = getSql()
    const users = await sql`
      SELECT id, email, full_name, username, date_of_birth, subscription_tier, subscription_status, 
             stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, 
             cancel_at_period_end, created_at, avatar_url
      FROM users 
      WHERE id = ${payload.userId as string}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      )
    }

    const user = users[0]

    // Return user data in Better Auth compatible format
    const userData = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      image: user.avatar_url,
      emailVerified: true,
      createdAt: user.created_at,
      updatedAt: user.created_at,
      // Additional custom fields
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
    }

    return NextResponse.json({
      user: userData,
      session: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

  } catch (error) {
    // Invalid token or other error - return null session
    return NextResponse.json(
      { user: null, session: null },
      { status: 200 }
    )
  }
}
