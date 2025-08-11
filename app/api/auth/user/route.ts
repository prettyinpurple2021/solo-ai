import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { verifyToken } from '@/lib/auth-utils'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    const client = await createClient()
    
    const { rows } = await client.query(
      'SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status FROM users WHERE id = $1',
      [decoded.userId]
    )

    const user = rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
