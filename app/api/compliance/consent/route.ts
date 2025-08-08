import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const client = await pool.connect()
  try {
    const logs = await client.query(
      `SELECT id, user_email, consent_type, action, timestamp, ip_address
       FROM consent_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 200`,
      [userId]
    )
    const requests = await client.query(
      `SELECT id, user_email, request_type, status, submitted_at, completed_at
       FROM data_requests WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 200`,
      [userId]
    )
    return NextResponse.json({ consent_logs: logs.rows, data_requests: requests.rows })
  } finally {
    client.release()
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, type, payload } = body
    if (!userId || !type) return NextResponse.json({ error: 'userId and type required' }, { status: 400 })
    const client = await pool.connect()
    try {
      if (type === 'log-consent') {
        const { userEmail, consentType, action, ipAddress } = payload
        await client.query(
          `INSERT INTO consent_logs (user_id, user_email, consent_type, action, ip_address)
           VALUES ($1,$2,$3,$4,$5)`,
          [userId, userEmail, consentType, action, ipAddress]
        )
        return NextResponse.json({ ok: true })
      }
      if (type === 'create-request') {
        const { userEmail, requestType, notes } = payload
        const res = await client.query(
          `INSERT INTO data_requests (user_id, user_email, request_type, status, notes)
           VALUES ($1,$2,$3,'pending',$4) RETURNING id, submitted_at`,
          [userId, userEmail, requestType, notes || null]
        )
        return NextResponse.json({ id: res.rows[0].id, submitted_at: res.rows[0].submitted_at })
      }
      return NextResponse.json({ error: 'unsupported type' }, { status: 400 })
    } finally {
      client.release()
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Consent operation failed' }, { status: 500 })
  }
}


