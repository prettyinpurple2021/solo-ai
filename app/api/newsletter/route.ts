import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'


export async function POST(req: Request) {
  try {
    const { email, source } = await req.json().catch(() => ({}))
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    const sql = neon(process.env.DATABASE_URL as string)
    await sql`create table if not exists newsletter_subscribers (
      id serial primary key,
      email varchar(255) unique not null,
      source varchar(255),
      created_at timestamptz default now()
    )`;
    await sql`insert into newsletter_subscribers (email, source) values (${email}, ${source ?? 'blog_hero'}) on conflict (email) do nothing`;
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


