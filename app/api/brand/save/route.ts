import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('brand:save', ip, 60_000, 60)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      brandName: z.string().min(1, 'Brand name is required'),
      tagline: z.string().optional(),
      description: z.string().optional(),
      industry: z.string().optional(),
      colors: z.any().optional(),
      typography: z.any().optional(),
      logoData: z.any().optional(),
      logoStyle: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { brandName, tagline, description, industry, colors, typography, logoData, logoStyle } = parsed.data

    const client = await createClient()

    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, key)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const { rows } = await client.query(
      `INSERT INTO brand_profiles (user_id, brand_name, tagline, description, industry, colors, typography, logo_data, logo_style)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user.id, brandName, tagline || '', description || '', industry || '', JSON.stringify(colors), JSON.stringify(typography), logoData, logoStyle]
    )

    return NextResponse.json({ 
      message: 'Brand kit saved successfully',
      brandProfile: rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving brand kit:', error)
    return NextResponse.json(
      { error: 'Failed to save brand kit' },
      { status: 500 }
    )
  }
}
