import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { z } from 'zod'
import { logError, logInfo } from '@/lib/logger'
import { eq, and, ilike, sql, desc, count } from 'drizzle-orm'
import { briefcases, goals, tasks, users } from '@/shared/db/schema'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/briefcases - Get all briefcases for the authenticated user
export async function GET(request: NextRequest) {
  const route = '/api/briefcases'
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const db = getDb()

    // Ensure user exists in database (auto-provisioning logic from original route)
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.id, user.id)).limit(1)
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        full_name: user.name || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        onboarding_completed: false,
      })
    }

    // Build query conditions
    let conditions = [eq(briefcases.user_id, user.id)]
    if (category && category !== 'all') {
      conditions.push(eq(briefcases.status, category))
    }
    if (search) {
      conditions.push(ilike(briefcases.title, `%${search}%`))
    }

    // Get briefcases with goal and task counts
    const results = await db.select({
      id: briefcases.id,
      title: briefcases.title,
      description: briefcases.description,
      status: briefcases.status,
      metadata: briefcases.metadata,
      created_at: briefcases.created_at,
      updated_at: briefcases.updated_at,
      goal_count: sql<number>`count(distinct ${goals.id})`.as('goal_count'),
      task_count: sql<number>`count(distinct ${tasks.id})`.as('task_count')
    })
      .from(briefcases)
      .leftJoin(goals, eq(briefcases.id, goals.briefcase_id))
      .leftJoin(tasks, eq(briefcases.id, tasks.briefcase_id))
      .where(and(...conditions))
      .groupBy(briefcases.id)
      .orderBy(desc(briefcases.created_at))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const countResult = await db.select({ total: count() })
      .from(briefcases)
      .where(and(...conditions))
    const total = countResult[0].total

    // Get stats
    const statsResult = await db.select({
      total: count(),
      active: sql<number>`count(*) filter (where ${briefcases.status} = 'active')`,
      completed: sql<number>`count(*) filter (where ${briefcases.status} = 'completed')`,
      archived: sql<number>`count(*) filter (where ${briefcases.status} = 'archived')`
    })
      .from(briefcases)
      .where(eq(briefcases.user_id, user.id))
    const stats = statsResult[0]

    // Transform results to match the expected format for UnifiedBriefcase components
    const files = results.map((b: any) => ({
      id: b.id.toString(),
      name: b.title,
      original_name: b.title,
      file_type: 'briefcase',
      mime_type: 'application/briefcase',
      size: 0,
      category: b.status,
      description: b.description || '',
      tags: [],
      metadata: b.metadata || {},
      ai_insights: {},
      is_favorite: false,
      download_count: 0,
      view_count: 0,
      last_accessed: b.updated_at,
      created_at: b.created_at,
      updated_at: b.updated_at,
      folder_id: null,
      folder_name: null,
      folder_color: null,
      downloadUrl: '',
      previewUrl: '',
      goal_count: parseInt(b.goal_count || '0', 10),
      task_count: parseInt(b.task_count || '0', 10),
    }))

    return NextResponse.json({
      files,
      stats: {
        totalFiles: stats.total,
        totalSize: 0,
        categories: [
          { name: 'active', count: stats.active },
          { name: 'completed', count: stats.completed },
          { name: 'archived', count: stats.archived }
        ],
        fileTypes: [{ file_type: 'briefcase', count: stats.total }]
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    logError('Briefcases API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/briefcases - Create a new briefcase
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status = 'active', metadata = {} } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const db = getDb()
    const newBriefcase = await db.insert(briefcases).values({
      user_id: user.id,
      title,
      description: description || null,
      status,
      metadata: metadata || null,
      created_at: new Date(),
      updated_at: new Date()
    }).returning()

    return NextResponse.json({
      success: true,
      briefcase: newBriefcase[0]
    })

  } catch (error) {
    logError('Briefcase creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
