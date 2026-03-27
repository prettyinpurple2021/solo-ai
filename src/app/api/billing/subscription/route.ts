import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/api-utils'
import { auth } from '@/lib/auth'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userIdFromSession = session?.user?.id
    const userIdFromQuery = req.nextUrl.searchParams.get('userId')
    const userId = userIdFromSession || userIdFromQuery

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getSql()
    const res = await sql`
      SELECT subscription_tier, subscription_status, subscription_current_period_end
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `

    if (res.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const row = res[0]
    const tier = row.subscription_tier || 'launch'
    const status = row.subscription_status || (tier === 'launch' ? 'inactive' : 'active')
    const currentPeriodEnd = row.subscription_current_period_end || null

    return NextResponse.json({
      tier,
      status,
      current_period_end: currentPeriodEnd,
    })
  } catch (error) {
    logError('Billing subscription fetch failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


