import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { z } from 'zod'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'
import { info, error as logError } from '@/lib/log'

// Enable edge runtime for improved performance on read operations
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const route = '/api/templates'
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      info('Unauthorized templates request', { 
        route, 
        status: 401,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
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

    info('Templates fetched successfully', { 
      route, 
      userId: user.id,
      status: 200,
      meta: { 
        templateCount: userTemplates.length,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({ 
      templates: userTemplates,
      systemTemplates 
    })
  } catch (err) {
    logError('Error fetching templates', {
      route,
      status: 500,
      error: err,
      meta: { 
        errorMessage: err instanceof Error ? err.message : String(err),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

const SaveTemplateSchema = z.object({
  templateSlug: z.string().min(1),
  templateData: z.record(z.any()),
  title: z.string().min(1).optional(),
  description: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  const route = '/api/templates'
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      info('Unauthorized template save attempt', { 
        route, 
        status: 401,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parse = SaveTemplateSchema.safeParse(await request.json())
    if (!parse.success) {
      info('Invalid template payload', { 
        route, 
        userId: user.id,
        status: 400,
        meta: { 
          validationErrors: parse.error.flatten(),
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      return NextResponse.json({ error: 'Invalid payload', details: parse.error.flatten() }, { status: 400 })
    }
    const { templateSlug, templateData, title, description } = parse.data

    const client = await createClient()

    // Idempotency support
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, key)
      if (!reserved) {
        info('Duplicate template save request', { 
          route, 
          userId: user.id,
          status: 409,
          meta: { 
            idempotencyKey: key,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          }
        })
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    await client.query(
      `INSERT INTO user_templates (user_id, name, content, description)
       VALUES ($1, $2, $3, $4)`,
      [user.id, templateSlug, JSON.stringify(templateData), description || '']
    )

    info('Template saved successfully', { 
      route, 
      userId: user.id,
      status: 201,
      meta: { 
        templateSlug,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    logError('Error creating template', {
      route,
      status: 500,
      error: err,
      meta: { 
        errorMessage: err instanceof Error ? err.message : String(err),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}