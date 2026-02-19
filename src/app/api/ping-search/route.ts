import { NextRequest, NextResponse } from 'next/server'
import { rateLimitByIp } from '@/lib/rate-limit'

const ENDPOINTS = {
  google: 'https://www.google.com/ping?sitemap=',
  bing: 'https://www.bing.com/ping?sitemap=',
}

async function handlePing(request: NextRequest) {
  // Rate limit to prevent abuse (allow CRON/webhook but limit public access)
  const rateLimitResult = await rateLimitByIp(request, { requests: 10, window: 3600 })
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const sitemapUrl = 'https://solobossai.fun/sitemap.xml'
  try {
    const [g, b] = await Promise.all([
      fetch(`${ENDPOINTS.google}${encodeURIComponent(sitemapUrl)}`),
      fetch(`${ENDPOINTS.bing}${encodeURIComponent(sitemapUrl)}`),
    ])
    const ok = g.ok && b.ok
    return NextResponse.json({ ok, google: g.status, bing: b.status })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Ping failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return handlePing(request)
}

export async function GET(request: NextRequest) {
  // Allow CRON GET request to trigger same logic
  return handlePing(request)
}


