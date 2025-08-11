import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    
    // Get user's saved templates (map Neon schema: name/content/description → expected fields)
    const { rows } = await client.query(
      `SELECT id, name, content, description, created_at, updated_at 
         FROM user_templates WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    )

    const userTemplates = rows.map((r) => {
      let parsed: any
      try {
        parsed = r.content ? JSON.parse(r.content) : null
      } catch {
        parsed = { value: r.content }
      }
      const slug: string = r.name
      const title: string = slug?.replace(/[-_]/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase()) || 'Template'
      return {
        id: r.id,
        template_slug: slug,
        template_data: parsed,
        title,
        description: r.description || undefined,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }
    })

    // Get system templates (from JSON data)
    const systemTemplates = await import('@/data/templates.json').then(m => m.default)

    return NextResponse.json({ 
      templates: userTemplates,
      systemTemplates 
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateSlug, templateData, title, description } = body

    if (!templateSlug || !templateData) {
      return NextResponse.json(
        { error: 'templateSlug and templateData are required' },
        { status: 400 }
      )
    }

    const client = await createClient()
    await client.query(
      `INSERT INTO user_templates (user_id, name, content, description)
       VALUES ($1, $2, $3, $4)`,
      [user.id, templateSlug, JSON.stringify(templateData), description || '']
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
