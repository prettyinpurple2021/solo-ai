import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import * as cheerio from 'cheerio'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'SoloBoss-GuardianAI/1.0' } })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return await res.text()
}

function analyze(html: string, url: string) {
  const $ = cheerio.load(html)
  const title = $('title').first().text().trim()
  const text = $('body').text().toLowerCase()
  const hasPrivacyPolicy = $('a[href*="privacy"]').length > 0 || text.includes('privacy policy')
  const hasCookieBanner = $('[id*="cookie"], [class*="cookie"]').length > 0 || text.includes('cookie')
  const hasContactForm = $('form:has(input[name*="email"])').length > 0
  const hasNewsletter = $('form:has(input[name*="email"])').length > 0 || text.includes('newsletter')
  const hasAnalytics = $('script[src*="google-analytics"], script:contains("gtag(")').length > 0

  const dataCollectionPoints: string[] = []
  if (hasContactForm) dataCollectionPoints.push('Contact Form')
  if (hasNewsletter) dataCollectionPoints.push('Newsletter Signup')
  if (hasAnalytics) dataCollectionPoints.push('Analytics Tracking')

  const cookieTypes: string[] = []
  if (text.includes('marketing cookies')) cookieTypes.push('Marketing')
  if (text.includes('analytics cookies')) cookieTypes.push('Analytics')
  if (text.includes('strictly necessary')) cookieTypes.push('Necessary')

  const consentMechanisms: string[] = []
  if (hasCookieBanner) consentMechanisms.push('Cookie Banner')

  // Simple trust score heuristic
  let trustScore = 50
  if (hasPrivacyPolicy) trustScore += 15
  if (hasCookieBanner) trustScore += 10
  if (hasContactForm) trustScore += 5
  if (hasAnalytics && !hasCookieBanner) trustScore -= 10
  trustScore = Math.max(0, Math.min(100, trustScore))

  return {
    page_title: title,
    has_privacy_policy: hasPrivacyPolicy,
    has_cookie_banner: hasCookieBanner,
    has_contact_form: hasContactForm,
    has_newsletter_signup: hasNewsletter,
    has_analytics: hasAnalytics,
    data_collection_points: dataCollectionPoints,
    cookie_types: cookieTypes,
    consent_mechanisms: consentMechanisms,
    trust_score: trustScore,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, userId } = await req.json()
    if (!url || !userId) {
      return NextResponse.json({ error: 'url and userId are required' }, { status: 400 })
    }

    const html = await fetchHtml(url)
    const result = analyze(html, url)

    const client = await pool.connect()
    try {
      const scanInsert = `
        INSERT INTO compliance_scans (
          user_id, url, trust_score, page_title, has_privacy_policy, has_cookie_banner,
          has_contact_form, has_newsletter_signup, has_analytics, data_collection_points,
          cookie_types, consent_mechanisms
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING id, scan_date
      `
      const scanRes = await client.query(scanInsert, [
        userId,
        url,
        result.trust_score,
        result.page_title,
        result.has_privacy_policy,
        result.has_cookie_banner,
        result.has_contact_form,
        result.has_newsletter_signup,
        result.has_analytics,
        result.data_collection_points,
        result.cookie_types,
        result.consent_mechanisms,
      ])

      // Record trust score history
      await client.query(
        `INSERT INTO trust_score_history (user_id, url, trust_score, score_change, scan_id)
         VALUES ($1, $2, $3, calculate_trust_score_change($1, $2, $3), $4)`,
        [userId, url, result.trust_score, scanRes.rows[0].id]
      )

      return NextResponse.json({
        id: scanRes.rows[0].id,
        scan_date: scanRes.rows[0].scan_date,
        url,
        trust_score: result.trust_score,
        details: result,
      })
    } finally {
      client.release()
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scan failed' }, { status: 500 })
  }
}


