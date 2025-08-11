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
    
    // Get user's saved templates
    const { rows: userTemplates } = await client.query(
      'SELECT * FROM user_templates WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    // Get system templates (from JSON data)
    const systemTemplates = await import('@/data/templates.json').then(m => m.default)

    return NextResponse.json({ 
      userTemplates,
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
    const { name, content, category, description } = body

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Template name and content are required' },
        { status: 400 }
      )
    }

    const client = await createClient()
    const { rows } = await client.query(
      `INSERT INTO user_templates (user_id, name, content, category, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, name, content, category || 'custom', description || '']
    )

    return NextResponse.json({ template: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
