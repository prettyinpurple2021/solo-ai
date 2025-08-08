import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

function buildPolicy(type: 'privacy'|'terms'|'cookies', data: any): string {
  const now = new Date().toLocaleDateString()
  if (type === 'privacy') {
    return `Privacy Policy for ${data.businessName}\n\nLast updated: ${now}\n\nWe collect: ${
      (data.dataCollected || []).join(', ') || 'information provided by you'
    }\n\nWe use this information to operate and improve our services, communicate with you, and comply with legal obligations. For questions, contact ${data.contactEmail}.`
  }
  if (type === 'terms') {
    return `Terms of Service for ${data.businessName}\n\nLast updated: ${now}\n\nBy accessing ${data.websiteUrl}, you agree to these terms. Use of the service is provided "as is" without warranties. Governing law: ${data.jurisdiction}.`
  }
  return `Cookie Policy for ${data.businessName}\n\nLast updated: ${now}\n\nWe use cookies for essential functionality, analytics, and preferences. You can control cookies via your browser settings. Contact ${data.contactEmail} for more info.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      businessName,
      websiteUrl,
      businessType,
      dataCollected = [],
      thirdPartyServices = [],
      dataRetentionPeriod,
      userRights = [],
      contactEmail,
      jurisdiction,
      policyTypes = ['privacy','terms','cookies'],
    } = body

    if (!userId || !businessName || !websiteUrl || !contactEmail || !jurisdiction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Save input policy data
      const pdRes = await client.query(
        `INSERT INTO policy_data (
            user_id, business_name, website_url, business_type, data_collected, third_party_services,
            data_retention_period, user_rights, contact_email, jurisdiction
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id`,
        [
          userId,
          businessName,
          websiteUrl,
          businessType || null,
          dataCollected,
          thirdPartyServices,
          dataRetentionPeriod || null,
          userRights,
          contactEmail,
          jurisdiction,
        ]
      )

      const generated: any[] = []
      for (const type of policyTypes as ('privacy'|'terms'|'cookies')[]) {
        const content = buildPolicy(type, {
          businessName,
          websiteUrl,
          dataCollected,
          contactEmail,
          jurisdiction,
        })
        const res = await client.query(
          `INSERT INTO generated_policies (
            user_id, business_name, website_url, policy_type, content, compliance_level, jurisdictions
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING id, version, generated_at`,
          [userId, businessName, websiteUrl, type, content, 'standard', [jurisdiction]]
        )
        generated.push({ id: res.rows[0].id, type, version: res.rows[0].version, generated_at: res.rows[0].generated_at })
      }

      return NextResponse.json({ policy_data_id: pdRes.rows[0].id, generated })
    } finally {
      client.release()
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Policy generation failed' }, { status: 500 })
  }
}


