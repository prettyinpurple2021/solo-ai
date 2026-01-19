import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { notificationJobQueue } from '@/lib/notification-job-queue'
import { scrapingScheduler } from '@/lib/scraping-scheduler'




export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const { user, error } = await authenticateRequest()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
    .split(',').map(e => e.trim()).filter(Boolean)
  if (!adminEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const notifications = {
    status: notificationJobQueue.getStatus(),
    stats: await notificationJobQueue.getStats()
  }
  const scraping = scrapingScheduler.getStatus()

  return NextResponse.json({
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: new Date().toISOString(),
    notifications,
    scraping
  })
}


