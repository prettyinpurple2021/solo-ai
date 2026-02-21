import { NextRequest, NextResponse} from 'next/server'
import * as jose from 'jose'
import { neon} from '@neondatabase/serverless'




// function getSql() {
function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT token using jose (Edge-compatible)
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user from database
    const sql = getSql()
    const users = await sql`
      SELECT id, email, full_name, username, date_of_birth, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, role, created_at
      FROM users 
      WHERE id = ${payload.userId as string}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Return user data with Stripe fields
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
      role: user.role || 'user',
      created_at: user.created_at
    }

    return NextResponse.json(userData)

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
