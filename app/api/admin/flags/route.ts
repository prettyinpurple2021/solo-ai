import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getFeatureFlags, updateFeatureFlags } from '@/lib/feature-flags'




export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const { user, error } = await authenticateRequest()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admins = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com').split(',').map(e => e.trim()).filter(Boolean)
  if (!admins.includes(user.email)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  return NextResponse.json(getFeatureFlags())
}

export async function POST(req: NextRequest) {
  const { user, error } = await authenticateRequest()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admins = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com').split(',').map(e => e.trim()).filter(Boolean)
  if (!admins.includes(user.email)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  const body = await req.json()
  const updated = updateFeatureFlags(body)
  return NextResponse.json(updated)
}


