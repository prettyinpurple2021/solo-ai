import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/api-response'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}



// JWT authentication helper using jose (Edge-compatible)
async function authenticateJWTRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'Authorization header required' }
    }

    const token = authHeader.substring(7)

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)

    // Type guard to ensure payload has required properties
    if (!payload || !payload.userId) {
      return { user: null, error: 'Invalid token' }
    }

    // After type guard, we can safely access properties
    return {
      user: {
        id: payload.userId as string,
        email: (payload.email as string) || '',
        full_name: (payload.full_name as string) || null,
        avatar_url: null,
        subscription_tier: 'free',
        level: 1,
        total_points: 0,
        current_streak: 0,
        wellness_score: 50,
        focus_minutes: 0,
        onboarding_completed: false
      },
      error: null
    }
  } catch (error) {
    logError('JWT authentication error:', error)
    return { user: null, error: 'Invalid token' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateJWTRequest(request)

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Ensure user exists in database
    const sql = getSql()
    const userData = await sql`
      SELECT id FROM users WHERE id = ${user.id}
    `

    if (userData.length === 0) {
      // Create user if they don't exist
      await sql`
        INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, subscription_status, is_verified, created_at, updated_at)
        VALUES (${user.id}, ${user.email}, ${user.full_name}, ${user.avatar_url}, 'free', 'active', false, NOW(), NOW())
      `
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get briefcases (projects) for the user
    let briefcases
    if (search) {
      briefcases = await sql`
        SELECT 
          b.id, b.title, b.description, b.status, b.metadata,
          b.created_at, b.updated_at,
          COUNT(DISTINCT g.id) as goal_count,
          COUNT(DISTINCT t.id) as task_count
        FROM briefcases b
        LEFT JOIN goals g ON b.id = g.briefcase_id
        LEFT JOIN tasks t ON b.id = t.briefcase_id
        WHERE b.user_id = ${user.id} 
          AND (b.title ILIKE ${`%${search}%`} OR b.description ILIKE ${`%${search}%`})
        GROUP BY b.id, b.title, b.description, b.status, b.metadata, b.created_at, b.updated_at
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (category && category !== 'all') {
      briefcases = await sql`
        SELECT 
          b.id, b.title, b.description, b.status, b.metadata,
          b.created_at, b.updated_at,
          COUNT(DISTINCT g.id) as goal_count,
          COUNT(DISTINCT t.id) as task_count
        FROM briefcases b
        LEFT JOIN goals g ON b.id = g.briefcase_id
        LEFT JOIN tasks t ON b.id = t.briefcase_id
        WHERE b.user_id = ${user.id} AND b.status = ${category}
        GROUP BY b.id, b.title, b.description, b.status, b.metadata, b.created_at, b.updated_at
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      briefcases = await sql`
        SELECT 
          b.id, b.title, b.description, b.status, b.metadata,
          b.created_at, b.updated_at,
          COUNT(DISTINCT g.id) as goal_count,
          COUNT(DISTINCT t.id) as task_count
        FROM briefcases b
        LEFT JOIN goals g ON b.id = g.briefcase_id
        LEFT JOIN tasks t ON b.id = t.briefcase_id
        WHERE b.user_id = ${user.id}
        GROUP BY b.id, b.title, b.description, b.status, b.metadata, b.created_at, b.updated_at
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Get total count for pagination
    let countResult
    if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM briefcases 
        WHERE user_id = ${user.id} 
          AND (title ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})
      `
    } else if (category && category !== 'all') {
      countResult = await sql`
        SELECT COUNT(*) as total FROM briefcases 
        WHERE user_id = ${user.id} AND status = ${category}
      `
    } else {
      countResult = await sql`
        SELECT COUNT(*) as total FROM briefcases 
        WHERE user_id = ${user.id}
      `
    }

    const total = parseInt(countResult[0].total)

    // Get stats
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_briefcases,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_briefcases,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_briefcases,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_briefcases
      FROM briefcases 
      WHERE user_id = ${user.id}
    `

    const stats = statsResult[0]

    // Transform briefcases to match expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = briefcases.map((briefcase: any) => ({
      id: briefcase.id.toString(),
      name: briefcase.title,
      original_name: briefcase.title,
      file_type: 'briefcase',
      mime_type: 'application/briefcase',
      size: 0,
      category: briefcase.status,
      description: briefcase.description || '',
      tags: [],
      metadata: briefcase.metadata || {},
      ai_insights: {},
      is_favorite: false,
      download_count: 0,
      view_count: 0,
      last_accessed: briefcase.updated_at,
      created_at: briefcase.created_at,
      updated_at: briefcase.updated_at,
      folder_id: null,
      folder_name: null,
      folder_color: null,
      downloadUrl: '',
      previewUrl: '',
      goal_count: parseInt(briefcase.goal_count || '0', 10),
      task_count: parseInt(briefcase.task_count || '0', 10),
    }))

    return NextResponse.json({
      files,
      stats: {
        totalFiles: stats.total_briefcases,
        totalSize: 0,
        categories: [
          { name: 'active', count: stats.active_briefcases },
          { name: 'completed', count: stats.completed_briefcases },
          { name: 'archived', count: stats.archived_briefcases }
        ],
        fileTypes: [{ file_type: 'briefcase', count: stats.total_briefcases }]
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    logError('Briefcase API error:', error)
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

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateJWTRequest(request)

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { title, description, status = 'active', metadata = {} } = body

    if (!title) {
      return createErrorResponse('Title is required', 400)
    }

    const sql = getSql()

    // Create new briefcase
    const newBriefcase = await sql`
      INSERT INTO briefcases (user_id, title, description, status, metadata, created_at, updated_at)
      VALUES (${user.id}, ${title}, ${description}, ${status}, ${JSON.stringify(metadata)}, NOW(), NOW())
      RETURNING id, title, description, status, metadata, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      briefcase: newBriefcase[0]
    })

  } catch (error) {
    logError('Briefcase creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}