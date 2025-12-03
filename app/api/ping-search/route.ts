import { NextResponse } from 'next/server'

const ENDPOINTS = {
  google: 'https://www.google.com/ping?sitemap=',
  bing: 'https://www.bing.com/ping?sitemap=',
}


export async function POST() {
  const sitemapUrl = 'https://solobossai.fun/sitemap.xml'
  try {
    const [g, b] = await Promise.all([
      fetch(`${ENDPOINTS.google}${encodeURIComponent(sitemapUrl)}`),
      fetch(`${ENDPOINTS.bing}${encodeURIComponent(sitemapUrl)}`),
    ])
    const ok = g.ok && b.ok
    return NextResponse.json({ ok, google: g.status, bing: b.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Ping failed' }, { status: 500 })
  }
}

export async function GET() {
  // Allow CRON GET request to trigger same logic
  return POST()
}


