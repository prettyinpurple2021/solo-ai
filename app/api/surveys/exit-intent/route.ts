import { logError, logDebug } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// // Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    return (decoded?.userId as string) || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql()
    const userId = await getUserIdFromToken(req)

    // Create table if it doesn't exist
    await sql`create table if not exists user_survey_status (
      id serial primary key,
      user_id varchar(255),
      survey_type varchar(50) not null,
      status varchar(20) not null, -- 'submitted' or 'dismissed'
      created_at timestamptz default now(),
      unique(user_id, survey_type)
    )`

    if (!userId) {
      // For anonymous users, return default state
      return NextResponse.json({ status: null, canShow: true })
    }

    // Check if user has already interacted with exit-intent survey
    const result = await sql`
      select status from user_survey_status 
      where user_id = ${userId} and survey_type = 'exit-intent'
    `

    const status = result.length > 0 ? result[0].status : null
    const canShow = status === null // Only show if no previous interaction

    return NextResponse.json({ status, canShow })
  } catch (error) {
    logError('Survey status check error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, goal, blocker, email, action } = await req.json().catch(() => ({}))
    const sql = getSql()
    const userId = await getUserIdFromToken(req)

    logDebug('Survey submission data:', { role, goal, blocker, email, action, userId })

    // Create tables if they don't exist - with proper error handling
    try {
      await sql`create table if not exists exit_intent_surveys (
        id serial primary key,
        user_id varchar(255),
        role varchar(120),
        goal text,
        blocker text,
        email varchar(255),
        created_at timestamptz default now()
      )`
    } catch (tableError) {
      logError('Error creating exit_intent_surveys table:', tableError)
      // If table creation fails, try to continue anyway
    }

    await sql`create table if not exists user_survey_status (
      id serial primary key,
      user_id varchar(255),
      survey_type varchar(50) not null,
      status varchar(20) not null,
      created_at timestamptz default now(),
      unique(user_id, survey_type)
    )`

    if (action === 'dismiss') {
      // User clicked skip/dismiss
      if (userId) {
        await sql`
          insert into user_survey_status (user_id, survey_type, status) 
          values (${userId}, 'exit-intent', 'dismissed')
          on conflict (user_id, survey_type) do update set 
            status = 'dismissed', created_at = now()
        `
      }
      return NextResponse.json({ ok: true, action: 'dismissed' })
    } else {
      // User submitted survey
      try {
        await sql`
          insert into exit_intent_surveys (user_id, role, goal, blocker, email) 
          values (${userId || null}, ${role || null}, ${goal || null}, ${blocker || null}, ${email || null})
        `
        logDebug('Survey data inserted successfully')
      } catch (insertError) {
        logError('Error inserting survey data:', insertError)
        // Continue with status update even if survey data insert fails
      }

      if (userId) {
        await sql`
          insert into user_survey_status (user_id, survey_type, status) 
          values (${userId}, 'exit-intent', 'submitted')
          on conflict (user_id, survey_type) do update set 
            status = 'submitted', created_at = now()
        `
      }

      return NextResponse.json({ ok: true, action: 'submitted' })
    }
  } catch (error) {
    logError('Survey submission error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


