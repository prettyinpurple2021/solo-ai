import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rate-limit'
import { neon } from '@neondatabase/serverless'




function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// POST /api/workflow-templates/[id]/download - Download template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 3600 }) // 20 downloads per hour
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const resolvedParams = await params
    const templateId = resolvedParams.id

    // Get template
    const sql = getSql()
    const templates = await sql`
      SELECT * FROM workflow_templates 
      WHERE id = ${templateId} AND is_public = true
    `

    if (templates.length === 0) {
      return NextResponse.json(
        { error: 'Template not found or not public' },
        { status: 404 }
      )
    }

    const template = templates[0]

    // Increment usage count
    await sql`
      UPDATE workflow_templates 
      SET usage_count = usage_count + 1 
      WHERE id = ${templateId}
    `

    // Log download
    await sql`
      INSERT INTO template_downloads (template_id, user_id, downloaded_at)
      VALUES (${templateId}, ${user.id}, NOW())
    `

    logInfo('Template downloaded successfully', {
      templateId,
      userId: user.id,
      templateName: template.name
    })

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        workflowData: template.workflow_data,
        usageCount: template.usage_count + 1
      }
    })

  } catch (error) {
    logError('Error in POST /api/workflow-templates/[id]/download:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}