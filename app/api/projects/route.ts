import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for project data
const ProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().default('#6366f1'),
  icon: z.string().optional().default('📁'),
  status: z.enum(['active', 'archived', 'completed']).default('active')
})

const ProjectUpdateSchema = ProjectSchema.partial()

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get real projects from database
    const sql = getSql()
    const projects = await sql`
      SELECT 
        id,
        title as name,
        description,
        status,
        metadata,
        created_at,
        updated_at
      FROM briefcases 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    // Transform the data to match the expected format
    const transformedProjects = projects.map(project => ({
      id: project.id.toString(),
      name: project.name,
      description: project.description || '',
      color: project.metadata?.color || '#6366f1',
      icon: project.metadata?.icon || '📁',
      status: project.status as 'active' | 'completed' | 'paused',
      created_at: project.created_at,
      updated_at: project.updated_at
    }))

    return NextResponse.json({
      success: true,
      projects: transformedProjects
    })

  } catch (error) {
    logError('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const projectData = ProjectSchema.parse(body)

    // Create new project in database
    const sql = getSql()
    const result = await sql`
      INSERT INTO briefcases (
        user_id,
        title,
        description,
        status,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${projectData.name},
        ${projectData.description || ''},
        ${projectData.status || 'active'},
        ${JSON.stringify({
      color: projectData.color || '#6366f1',
      icon: projectData.icon || '📁'
    })},
        NOW(),
        NOW()
      )
      RETURNING id, title, description, status, metadata, created_at, updated_at
    `

    const newProject = {
      id: result[0].id.toString(),
      name: result[0].title,
      description: result[0].description || '',
      color: result[0].metadata?.color || '#6366f1',
      icon: result[0].metadata?.icon || '📁',
      status: result[0].status as 'active' | 'completed' | 'paused',
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    }

    return NextResponse.json({
      success: true,
      project: newProject
    }, { status: 201 })

  } catch (error) {
    logError('Error creating project:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const validatedData = ProjectUpdateSchema.parse(updateData)

    // Update project in database
    const sql = getSql()

    // First, get existing metadata to preserve other fields
    const existingProject = await sql`
      SELECT metadata FROM briefcases 
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Merge existing metadata with new values
    const existingMetadata = existingProject[0].metadata || {}
    const updatedMetadata = {
      ...existingMetadata,
      ...(validatedData.color && { color: validatedData.color }),
      ...(validatedData.icon && { icon: validatedData.icon })
    }

    const result = await sql`
      UPDATE briefcases 
      SET 
        title = CASE 
          WHEN ${validatedData.name !== undefined} THEN ${validatedData.name}
          ELSE title
        END,
        description = CASE 
          WHEN ${validatedData.description !== undefined} THEN ${validatedData.description}
          ELSE description
        END,
        status = CASE 
          WHEN ${validatedData.status !== undefined} THEN ${validatedData.status}
          ELSE status
        END,
        metadata = ${JSON.stringify(updatedMetadata)},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, title, description, status, metadata, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    const updatedProject = {
      id: result[0].id.toString(),
      name: result[0].title,
      description: result[0].description || '',
      color: result[0].metadata?.color || '#6366f1',
      icon: result[0].metadata?.icon || '📁',
      status: result[0].status as 'active' | 'completed' | 'paused',
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    }

    return NextResponse.json({
      success: true,
      project: updatedProject
    })

  } catch (error) {
    logError('Error updating project:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Delete project from database
    const sql = getSql()
    const result = await sql`
      DELETE FROM briefcases 
      WHERE id = ${projectId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    logError('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
