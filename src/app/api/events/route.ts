import { NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { analyticsEvents } from '@/lib/shared/db/schema/business'
import { logError } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      event_name,
      user_id,
      path,
      referrer,
      utm = {},
      metadata = {},
    } = body as {
      event_name?: string
      user_id?: string
      path?: string
      referrer?: string
      utm?: Record<string, unknown>
      metadata?: Record<string, unknown>
    }

    if (!event_name) {
      return NextResponse.json({ error: 'event_name required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 })
    }

    const db = getDb()
    const properties: Record<string, unknown> = {
      path: path ?? null,
      referrer: referrer ?? null,
      utm,
    }

    await db.insert(analyticsEvents).values({
      user_id: user_id ?? null,
      event: event_name,
      properties,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    logError(
      'analytics_events insert failed',
      e instanceof Error ? e : new Error(String(e)),
    )
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
