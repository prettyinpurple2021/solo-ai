import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { newsletterSubscribers } from '@/lib/shared/db/schema/marketing'
import { rateLimitByIp } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'
import { z } from 'zod'

const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimitByIp(req, { requests: 5, window: 3600 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const validation = NewsletterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address', details: validation.error.flatten() },
        { status: 400 },
      )
    }

    const { email, source } = validation.data

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 })
    }

    const db = getDb()
    await db
      .insert(newsletterSubscribers)
      .values({
        email,
        source: source ?? 'blog_hero',
      })
      .onConflictDoNothing({ target: newsletterSubscribers.email })

    return NextResponse.json({ ok: true })
  } catch (e) {
    logError(
      'newsletter subscribe failed',
      e instanceof Error ? e : new Error(String(e)),
    )
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
