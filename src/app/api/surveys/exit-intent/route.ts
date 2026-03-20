import { logError, logDebug } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { exitIntentSurveys, userSurveyStatus } from '@/lib/shared/db/schema/marketing'
import { and, eq } from 'drizzle-orm'
import * as jose from 'jose'

export const dynamic = 'force-dynamic'

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
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ status: null, canShow: true })
    }

    const userId = await getUserIdFromToken(req)
    const db = getDb()

    if (!userId) {
      return NextResponse.json({ status: null, canShow: true })
    }

    const rows = await db
      .select({ status: userSurveyStatus.status })
      .from(userSurveyStatus)
      .where(
        and(eq(userSurveyStatus.user_id, userId), eq(userSurveyStatus.survey_type, 'exit-intent')),
      )
      .limit(1)

    const status = rows.length > 0 ? rows[0].status : null
    const canShow = status === null

    return NextResponse.json({ status, canShow })
  } catch (error) {
    logError(
      'Survey status check error (handled):',
      error instanceof Error ? error : new Error(String(error)),
    )
    return NextResponse.json({ status: null, canShow: true })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, goal, blocker, email, action } = await req.json().catch(() => ({}))
    if (!process.env.DATABASE_URL) {
      logError('DATABASE_URL missing for exit-intent POST')
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const userId = await getUserIdFromToken(req)
    const db = getDb()

    logDebug('Survey submission data:', { role, goal, blocker, email, action, userId })

    if (action === 'dismiss') {
      if (userId) {
        await db
          .insert(userSurveyStatus)
          .values({
            user_id: userId,
            survey_type: 'exit-intent',
            status: 'dismissed',
          })
          .onConflictDoUpdate({
            target: [userSurveyStatus.user_id, userSurveyStatus.survey_type],
            set: { status: 'dismissed', created_at: new Date() },
          })
      }
      return NextResponse.json({ ok: true, action: 'dismissed' })
    }

    try {
      await db.insert(exitIntentSurveys).values({
        user_id: userId || null,
        role: role || null,
        goal: goal || null,
        blocker: blocker || null,
        email: email || null,
      })
      logDebug('Survey data inserted successfully')
    } catch (insertError) {
      logError(
        'Error inserting survey data:',
        insertError instanceof Error ? insertError : new Error(String(insertError)),
      )
    }

    if (userId) {
      await db
        .insert(userSurveyStatus)
        .values({
          user_id: userId,
          survey_type: 'exit-intent',
          status: 'submitted',
        })
        .onConflictDoUpdate({
          target: [userSurveyStatus.user_id, userSurveyStatus.survey_type],
          set: { status: 'submitted', created_at: new Date() },
        })
    }

    return NextResponse.json({ ok: true, action: 'submitted' })
  } catch (error) {
    logError(
      'Survey submission error:',
      error instanceof Error ? error : new Error(String(error)),
    )
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
