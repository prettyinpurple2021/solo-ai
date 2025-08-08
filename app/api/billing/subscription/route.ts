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
    const res = await client.query(
      'SELECT subscription_tier, subscription_status FROM users WHERE id = $1',
      [userId]
    )
    if (res.rowCount === 0) return NextResponse.json({ error: 'user not found' }, { status: 404 })
    const { subscription_tier, subscription_status } = res.rows[0]
    return NextResponse.json({ plan: subscription_tier, status: subscription_status })
  } finally {
    client.release()
  }
}


