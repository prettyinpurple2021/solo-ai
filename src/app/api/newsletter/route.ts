import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const rateLimitResult = await rateLimitByIp(req, { requests: 5, window: 3600 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    
    // Validate input with Zod
    const validation = NewsletterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, source } = validation.data

    const sql = neon(process.env.DATABASE_URL as string)
    await sql`create table if not exists newsletter_subscribers (
      id serial primary key,
      email varchar(255) unique not null,
      source varchar(255),
      created_at timestamptz default now()
    )`;
    await sql`insert into newsletter_subscribers (email, source) values (${email}, ${source ?? 'blog_hero'}) on conflict (email) do nothing`;
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


