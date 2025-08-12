import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    const { rows: goals } = await client.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('goals:create', ip, 60_000, 60)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      title: z.string().min(1, 'Goal title is required'),
      description: z.string().optional(),
      target_date: z.union([z.string(), z.date()]).optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { title, description, target_date, category, priority } = parsed.data as any

    const client = await createClient()

    // Idempotency support
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, key)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const { rows } = await client.query(
      `INSERT INTO goals (user_id, title, description, target_date, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [user.id, title, description || '', target_date, category || 'general', priority || 'medium']
    )

    return NextResponse.json({ goal: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
