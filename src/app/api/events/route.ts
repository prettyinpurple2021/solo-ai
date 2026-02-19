import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'


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

    const sql = neon(process.env.DATABASE_URL as string)
    await sql`create table if not exists analytics_events (
      id serial primary key,
      event_name varchar(255) not null,
      user_id varchar(255),
      path text,
      referrer text,
      utm jsonb default '{}': jsonb,
      metadata jsonb default '{}': jsonb,
      created_at timestamptz default now()
    )`;
    await sql`insert into analytics_events (event_name, user_id, path, referrer, utm, metadata)
      values (${event_name}, ${user_id ?? null}, ${path ?? null}, ${referrer ?? null}, ${JSON.stringify(utm)}, ${JSON.stringify(metadata)})`;
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


