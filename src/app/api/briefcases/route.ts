import { NextRequest, NextResponse} from 'next/server'
import * as jose from 'jose'
import { neon} from '@neondatabase/serverless'




// // Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Helper function to verify JWT token using jose (Edge-compatible)
async function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    if (!process.env.JWT_SECRET) {
      return null
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

// GET /api/briefcases - Get all briefcases for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const sql = getSql()
    const decoded = await verifyToken(request.headers.get('authorization'))
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const briefcases = await sql`
      SELECT id, title, description, status, metadata, created_at, updated_at
      FROM briefcases 
      WHERE user_id = ${decoded.userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(briefcases)

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/briefcases - Create a new briefcase
export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const decoded = await verifyToken(request.headers.get('authorization'))
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, metadata } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const newBriefcases = await sql`
      INSERT INTO briefcases (user_id, title, description, metadata, created_at, updated_at)
      VALUES (${decoded.userId}, ${title}, ${description || null}, ${metadata || null}, NOW(), NOW())
      RETURNING id, title, description, status, metadata, created_at, updated_at
    `

    if (newBriefcases.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create briefcase' },
        { status: 500 }
      )
    }

    return NextResponse.json(newBriefcases[0])

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
