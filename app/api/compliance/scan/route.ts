import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ComplianceIssue {
  id: string
  type: "critical" | "warning" | "info"
  category: "data_collection" | "consent" | "cookies" | "privacy_policy" | "data_requests"
  title: string
  description: string
  recommendation: string
  gdpr_article?: string
  ccpa_section?: string
}

interface ComplianceScan {
  url: string
  scanDate: Date
  trustScore: number
  issues: ComplianceIssue[]
  dataCollectionPoints: string[]
  cookieTypes: string[]
  consentMechanisms: string[]
  pageTitle: string
  hasPrivacyPolicy: boolean
  hasCookieBanner: boolean
  hasContactForm: boolean
  hasNewsletterSignup: boolean
  hasAnalytics: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let targetUrl: string
    try {
      const urlObj = new URL(url)
      targetUrl = urlObj.href
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Starting compliance scan for: ${targetUrl} by user: ${user.id}`)

    // For now, we'll use a simple fetch to get basic page info
    // This is a simplified version - in production we'd use Puppeteer for full analysis
    let pageTitle = "Website Analysis"
    let hasPrivacyPolicy = false
    let hasCookieBanner = false
    let hasContactForm = false
    let hasNewsletterSignup = false
    let hasAnalytics = false

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        
        // Basic analysis using regex (simplified version)
        pageTitle = extractTitle(html) || "Website Analysis"
        hasPrivacyPolicy = /privacy|privacy-policy|privacy_policy/i.test(html)
        hasCookieBanner = /cookie|consent|gdpr/i.test(html)
        hasContactForm = /contact|mailto|email/i.test(html)
        hasNewsletterSignup = /newsletter|subscribe|sign.?up/i.test(html)
        hasAnalytics = /google-analytics|gtag|ga|facebook|fbq|pixel|hotjar|mixpanel|amplitude/i.test(html)
      }
    } catch (fetchError) {
      console.log('Could not fetch page content, using default analysis')
    }

    console.log('Analysis completed, generating compliance report...')

    // Generate compliance issues based on findings
    const issues: ComplianceIssue[] = []
    let trustScore = 100

    // Check for missing cookie consent
    if (!hasCookieBanner && (hasContactForm || hasNewsletterSignup || hasAnalytics)) {
      issues.push({
        id: "1",
        type: "critical",
        category: "consent",
        title: "Missing Cookie Consent Banner",
        description: "No cookie consent mechanism detected on the website",
        recommendation: "Implement a GDPR-compliant cookie consent banner that appears before any cookies are set",
        gdpr_article: "Article 7",
        ccpa_section: "Section 1798.135"
      })
      trustScore -= 25
    }

    // Check for missing privacy policy
    if (!hasPrivacyPolicy && (hasContactForm || hasNewsletterSignup)) {
      issues.push({
        id: "2",
        type: "critical",
        category: "privacy_policy",
        title: "Missing Privacy Policy",
        description: "No privacy policy found despite collecting personal data",
        recommendation: "Create and prominently display a comprehensive privacy policy that explains data collection and usage",
        gdpr_article: "Article 13",
        ccpa_section: "Section 1798.100"
      })
      trustScore -= 20
    }

    // Check for contact form without privacy notice
    if (hasContactForm && !hasPrivacyPolicy) {
      issues.push({
        id: "3",
        type: "warning",
        category: "data_collection",
        title: "Contact Form Without Privacy Notice",
        description: "Contact form collects personal data without clear privacy notice",
        recommendation: "Add a privacy notice link near the form explaining how data will be used",
        gdpr_article: "Article 13"
      })
      trustScore -= 15
    }

    // Check for analytics without consent
    if (hasAnalytics && !hasCookieBanner) {
      issues.push({
        id: "4",
        type: "warning",
        category: "cookies",
        title: "Analytics Tracking Without Consent",
        description: "Analytics scripts detected without proper consent mechanism",
        recommendation: "Implement cookie consent before loading analytics scripts",
        gdpr_article: "Article 7"
      })
      trustScore -= 10
    }

    // Check for newsletter signup without privacy notice
    if (hasNewsletterSignup && !hasPrivacyPolicy) {
      issues.push({
        id: "5",
        type: "warning",
        category: "data_collection",
        title: "Newsletter Signup Without Privacy Notice",
        description: "Newsletter signup collects email addresses without privacy notice",
        recommendation: "Add privacy notice and consent checkbox to newsletter signup",
        gdpr_article: "Article 7"
      })
      trustScore -= 10
    }

    // Ensure trust score doesn't go below 0
    trustScore = Math.max(0, trustScore)

    // Generate data collection points
    const dataCollectionPoints: string[] = []
    if (hasContactForm) dataCollectionPoints.push("Contact Form")
    if (hasNewsletterSignup) dataCollectionPoints.push("Newsletter Signup")
    if (hasAnalytics) dataCollectionPoints.push("Analytics Tracking")

    // Generate consent mechanisms
    const consentMechanisms: string[] = []
    if (hasCookieBanner) consentMechanisms.push("Cookie Consent Banner")

    // Generate cookie types (simplified)
    const cookieTypes: string[] = []
    if (hasAnalytics) cookieTypes.push("Analytics")
    if (hasNewsletterSignup) cookieTypes.push("Marketing")
    cookieTypes.push("Necessary")

    const scanResults: ComplianceScan = {
      url: targetUrl,
      scanDate: new Date(),
      trustScore,
      issues,
      dataCollectionPoints,
      cookieTypes,
      consentMechanisms,
      pageTitle,
      hasPrivacyPolicy,
      hasCookieBanner,
      hasContactForm,
      hasNewsletterSignup,
      hasAnalytics
    }

    console.log(`Compliance scan completed for ${targetUrl}. Trust score: ${trustScore}`)

    // Save scan results to database
    try {
      // Insert scan record
      const { data: scanData, error: scanError } = await supabase
        .from('compliance_scans')
        .insert({
          user_id: user.id,
          url: targetUrl,
          trust_score: trustScore,
          page_title: pageTitle,
          has_privacy_policy: hasPrivacyPolicy,
          has_cookie_banner: hasCookieBanner,
          has_contact_form: hasContactForm,
          has_newsletter_signup: hasNewsletterSignup,
          has_analytics: hasAnalytics,
          data_collection_points: dataCollectionPoints,
          cookie_types: cookieTypes,
          consent_mechanisms: consentMechanisms
        })
        .select()
        .single()

      if (scanError) {
        console.error('Error saving scan to database:', scanError)
      } else {
        // Insert compliance issues
        if (issues.length > 0) {
          const issuesToInsert = issues.map(issue => ({
            scan_id: scanData.id,
            type: issue.type,
            category: issue.category,
            title: issue.title,
            description: issue.description,
            recommendation: issue.recommendation,
            gdpr_article: issue.gdpr_article,
            ccpa_section: issue.ccpa_section
          }))

          const { error: issuesError } = await supabase
            .from('compliance_issues')
            .insert(issuesToInsert)

          if (issuesError) {
            console.error('Error saving issues to database:', issuesError)
          }
        }

        // Insert trust score history
        const { error: historyError } = await supabase
          .from('trust_score_history')
          .insert({
            user_id: user.id,
            url: targetUrl,
            trust_score: trustScore,
            previous_score: await supabase.rpc('calculate_trust_score_change', {
              p_user_id: user.id,
              p_url: targetUrl,
              p_new_score: trustScore
            }),
            scan_id: scanData.id
          })

        if (historyError) {
          console.error('Error saving trust score history:', historyError)
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with response even if database save fails
    }

    return NextResponse.json(scanResults)

  } catch (error) {
    console.error('Compliance scan error:', error)
    return NextResponse.json(
      { error: 'Failed to scan website for compliance issues', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : null
} 