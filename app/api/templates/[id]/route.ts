import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { z } from 'zod'
import { rateLimitByIp } from '@/lib/rate-limit'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'

// DELETE /api/templates/:id → delete a saved user template
const IdParamSchema = z.object({ id: z.string().regex(/^\d+$/) })

export async function DELETE(
  _request: Request,
  context: any
) {
  try {
    const req = _request as Request
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('templates:delete', ip, 60_000, 60)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const parsed = IdParamSchema.safeParse({ id: context?.params?.id })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    const { id } = parsed.data
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()

    const key = getIdempotencyKeyFromRequest(req)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, `tpl-del:${id}:${user.id}:${key}`)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const { rowCount } = await client.query(
      'DELETE FROM user_templates WHERE id = $1 AND user_id = $2',
      [id, user.id]
    )

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}


