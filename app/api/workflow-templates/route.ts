import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rate-limit'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return neon(url) as any
}

// GET /api/workflow-templates - List workflow templates
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 3600 }) // 100 requests per hour
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'

    // Build query conditions
    const conditions = [`is_public = true`]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = []
    let paramIndex = 1

    if (category) {
      conditions.push(`category = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    if (featured) {
      conditions.push(`featured = true`)
    }

    const whereClause = conditions.join(' AND ')
    const offset = (page - 1) * limit

    // Get templates
    const sql = getSql()
    const query = `
      SELECT 
        id, name, description, category, tags, featured, usage_count,
        created_at, updated_at, created_by
      FROM workflow_templates
      WHERE ${whereClause}
      ORDER BY featured DESC, usage_count DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    const templates = await sql(query, [...params, limit, offset])

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM workflow_templates
      WHERE ${whereClause}
    `
    const countResult = await sql(countQuery, params)
    const total = parseInt(countResult[0]?.total || '0')

    logInfo('Workflow templates fetched successfully', {
      userId: user.id,
      count: templates.length,
      page,
      limit,
      total
    })

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logError('Error in GET /api/workflow-templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/workflow-templates - Create workflow template
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 5, window: 3600 }) // 5 templates per hour
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      tags,
      workflowData,
      isPublic = false,
      featured = false
    } = body

    // Validate required fields
    if (!name || !description || !workflowData) {
      return NextResponse.json(
        { error: 'Name, description, and workflow data are required' },
        { status: 400 }
      )
    }

    // Create template
    const sql = getSql()
    const query = `
      INSERT INTO workflow_templates (
        name, description, category, tags, workflow_data, is_public, featured,
        created_by, usage_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, 0, NOW(), NOW()
      ) RETURNING *
    `

    const template = await sql(query, [
      name,
      description,
      category || 'general',
      JSON.stringify(tags || []),
      JSON.stringify(workflowData),
      isPublic,
      featured,
      user.id
    ])

    logInfo('Workflow template created successfully', {
      templateId: template[0].id,
      userId: user.id,
      name,
      isPublic
    })

    return NextResponse.json({
      template: template[0]
    }, { status: 201 })

  } catch (error) {
    logError('Error in POST /api/workflow-templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}