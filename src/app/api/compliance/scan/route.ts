import { NextRequest, NextResponse } from 'next/server'
import { analyze } from '@/lib/compliance-analyzer'
import { getSql } from '@/lib/api-utils'
import dns from 'node:dns/promises'
export const dynamic = 'force-dynamic'

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true
  const [a, b] = parts
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    (a === 169 && b === 254) ||
    a === 0
  )
}

function isPrivateIPv6(ip: string): boolean {
  const value = ip.toLowerCase()
  return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:')
}

function isIpLiteral(hostname: string): boolean {
  return /^[0-9.]+$/.test(hostname) || hostname.includes(':')
}

async function validateAndNormalizeScanUrl(input: string): Promise<string> {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    throw new Error('Invalid URL')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed')
  }

  if (parsed.username || parsed.password) {
    throw new Error('URLs with credentials are not allowed')
  }

  if (parsed.port) {
    const port = Number(parsed.port)
    const isAllowedHttpPort = parsed.protocol === 'http:' && port === 80
    const isAllowedHttpsPort = parsed.protocol === 'https:' && port === 443
    if (!isAllowedHttpPort && !isAllowedHttpsPort) {
      throw new Error('Only default ports are allowed')
    }
  }

  const hostname = parsed.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Local addresses are not allowed')
  }

  if (isIpLiteral(hostname)) {
    if (hostname.includes(':')) {
      if (isPrivateIPv6(hostname)) throw new Error('Private network addresses are not allowed')
    } else if (isPrivateIPv4(hostname)) {
      throw new Error('Private network addresses are not allowed')
    }
  } else {
    const records = await dns.lookup(hostname, { all: true })
    if (!records.length) throw new Error('Hostname could not be resolved')
    for (const record of records) {
      if (
        (record.family === 4 && isPrivateIPv4(record.address)) ||
        (record.family === 6 && isPrivateIPv6(record.address))
      ) {
        throw new Error('Target resolves to a private network address')
      }
    }
  }

  return parsed.toString()
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SoloSuccess-GuardianAI/1.0' },
    redirect: 'manual',
  })

  if (res.status >= 300 && res.status < 400) {
    throw new Error('Redirects are not allowed')
  }

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return await res.text()
}

export async function POST(req: NextRequest) {
  try {
    const { url, userId } = await req.json()
    if (!url || !userId) {
      return NextResponse.json({ error: 'url and userId are required' }, { status: 400 })
    }

    let scanUrl: string
    try {
      scanUrl = await validateAndNormalizeScanUrl(url)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid URL'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const html = await fetchHtml(scanUrl)
    const result = analyze(html)

    const sql = getSql()
    const inserted = await sql`
      INSERT INTO compliance_scans (
        user_id, url, trust_score, page_title, has_privacy_policy, has_cookie_banner,
        has_contact_form, has_newsletter_signup, has_analytics, data_collection_points,
        cookie_types, consent_mechanisms
      ) VALUES (
        ${userId}, ${scanUrl}, ${result.trust_score}, ${result.page_title}, ${result.has_privacy_policy}, ${result.has_cookie_banner},
        ${result.has_contact_form}, ${result.has_newsletter_signup}, ${result.has_analytics}, ${JSON.stringify(result.data_collection_points)},
        ${JSON.stringify(result.cookie_types)}, ${JSON.stringify(result.consent_mechanisms)}
      ) RETURNING id, scan_date
    `

    await sql`
      INSERT INTO trust_score_history (user_id, url, trust_score, score_change, scan_id)
      VALUES (${userId}, ${scanUrl}, ${result.trust_score}, calculate_trust_score_change(${userId}, ${scanUrl}, ${result.trust_score}), ${inserted[0].id})
    `

    return NextResponse.json({
      id: inserted[0].id,
      scan_date: inserted[0].scan_date,
      url: scanUrl,
      trust_score: result.trust_score,
      details: result,
    })
  } catch (err: unknown) {
    let message = 'Scan failed';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


