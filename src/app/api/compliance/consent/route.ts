import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/api-utils'
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const sql = getSql()
  const logs = await sql`
    SELECT id, user_email, consent_type, action, timestamp, ip_address
    FROM consent_logs WHERE user_id = ${userId} ORDER BY timestamp DESC LIMIT 200
  `
  const requests = await sql`
    SELECT id, user_email, request_type, status, submitted_at, completed_at
    FROM data_requests WHERE user_id = ${userId} ORDER BY submitted_at DESC LIMIT 200
  `
  return NextResponse.json({ consent_logs: logs, data_requests: requests })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, type, payload } = body
    if (!userId || !type) return NextResponse.json({ error: 'userId and type required' }, { status: 400 })
    const sql = getSql()
    if (type === 'log-consent') {
      const { userEmail, consentType, action, ipAddress } = payload
      await sql`
        INSERT INTO consent_logs (user_id, user_email, consent_type, action, ip_address)
        VALUES (${userId}, ${userEmail}, ${consentType}, ${action}, ${ipAddress})
      `
      return NextResponse.json({ ok: true })
    }
    if (type === 'create-request') {
      const { userEmail, requestType, notes } = payload
      const res = await sql`
        INSERT INTO data_requests (user_id, user_email, request_type, status, notes)
        VALUES (${userId}, ${userEmail}, ${requestType}, 'pending', ${notes || null})
        RETURNING id, submitted_at
      `
      return NextResponse.json({ id: res[0].id, submitted_at: res[0].submitted_at })
    }
    return NextResponse.json({ error: 'unsupported type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Consent operation failed' }, { status: 500 })
  }
}


