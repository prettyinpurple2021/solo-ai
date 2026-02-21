import { NextRequest, NextResponse } from 'next/server'
import { analyze } from '@/lib/compliance-analyzer'
import { getSql } from '@/lib/api-utils'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'SoloSuccess-GuardianAI/1.0' } })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return await res.text()
}

export async function POST(req: NextRequest) {
  try {
    const { url, userId } = await req.json()
    if (!url || !userId) {
      return NextResponse.json({ error: 'url and userId are required' }, { status: 400 })
    }

    const html = await fetchHtml(url)
    const result = analyze(html)

    const sql = getSql()
    const inserted = await sql`
      INSERT INTO compliance_scans (
        user_id, url, trust_score, page_title, has_privacy_policy, has_cookie_banner,
        has_contact_form, has_newsletter_signup, has_analytics, data_collection_points,
        cookie_types, consent_mechanisms
      ) VALUES (
        ${userId}, ${url}, ${result.trust_score}, ${result.page_title}, ${result.has_privacy_policy}, ${result.has_cookie_banner},
        ${result.has_contact_form}, ${result.has_newsletter_signup}, ${result.has_analytics}, ${JSON.stringify(result.data_collection_points)},
        ${JSON.stringify(result.cookie_types)}, ${JSON.stringify(result.consent_mechanisms)}
      ) RETURNING id, scan_date
    `

    await sql`
      INSERT INTO trust_score_history (user_id, url, trust_score, score_change, scan_id)
      VALUES (${userId}, ${url}, ${result.trust_score}, calculate_trust_score_change(${userId}, ${url}, ${result.trust_score}), ${inserted[0].id})
    `

    return NextResponse.json({
      id: inserted[0].id,
      scan_date: inserted[0].scan_date,
      url,
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


