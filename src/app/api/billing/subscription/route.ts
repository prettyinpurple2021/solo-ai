import { NextRequest, NextResponse} from 'next/server'
import { getSql} from '@/lib/api-utils'


export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  
  const sql = getSql()
  try {
    const res = await sql`
      SELECT subscription_tier, subscription_status 
      FROM users 
      WHERE id = ${userId}
    `
    if (res.length === 0) return NextResponse.json({ error: 'user not found' }, { status: 404 })
    const { subscription_tier, subscription_status } = res[0]
    return NextResponse.json({ plan: subscription_tier, status: subscription_status })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


