import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('JWT secret is not configured. Set JWT_SECRET or AUTH_SECRET.')
  }
  return secret
}

/**
 * GET /api/ws-token
 * Issues a short-lived JWT compatible with the Railway Express Socket.IO server.
 * The token is signed with the same JWT_SECRET so the backend can verify it.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const email = session.user.email

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      )
    }

    // Sign a short-lived token (15 minutes) using the same secret as the Express backend
    const token = jwt.sign(
      { userId: String(userId), email: email ?? '' },
      getJwtSecret(),
      { expiresIn: '15m' }
    )

    return NextResponse.json({ success: true, token })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate socket token' },
      { status: 500 }
    )
  }
}
