import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userConsent, dataSubjectRequests } from '@/shared/db/schema'
import { auth } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'consent' or 'requests'

    if (type === 'consent') {
      const logs = await db.select().from(userConsent).orderBy(desc(userConsent.timestamp)).limit(100)
      return NextResponse.json(logs)
    }

    if (type === 'requests') {
      const requests = await db.select().from(dataSubjectRequests).orderBy(desc(dataSubjectRequests.submittedAt)).limit(100)
      return NextResponse.json(requests)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    logError('Guardian API GET failed', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, data } = body

    if (type === 'consent') {
      await db.insert(userConsent).values({
        userId: session.user.id,
        userEmail: session.user.email!,
        consentType: data.consentType,
        action: data.action,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      })
      return NextResponse.json({ success: true })
    }

    if (type === 'request') {
      await db.insert(dataSubjectRequests).values({
        userId: session.user.id,
        userEmail: session.user.email!,
        requestType: data.requestType,
        notes: data.notes,
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    logError('Guardian API POST failed', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
