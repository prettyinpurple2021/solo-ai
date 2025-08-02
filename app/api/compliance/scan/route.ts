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

    // Enhanced website analysis
    let pageTitle = "Website Analysis"
    let hasPrivacyPolicy = false
    let hasCookieBanner = false
    let hasContactForm = false
    let hasNewsletterSignup = false
    let hasAnalytics = false
    let hasThirdPartyScripts = false
    let hasSocialMediaWidgets = false
    let hasPaymentProcessing = false
    let hasUserAccounts = false

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        
        // Enhanced analysis using more sophisticated patterns
        pageTitle = extractTitle(html) || "Website Analysis"
        
        // Privacy Policy detection - look for actual links, not just keywords
        hasPrivacyPolicy = /href=["'][^"']*(?:privacy|privacy-policy|privacy_policy|legal|terms)[^"']*["']/i.test(html) ||
                          /<a[^>]*>(?:privacy|privacy policy|legal|terms)[^<]*<\/a>/i.test(html)
        
        // Cookie Banner detection - look for actual consent mechanisms
        hasCookieBanner = /(?:cookie|consent|gdpr).*?(?:banner|popup|modal|notice)/i.test(html) ||
                         /(?:accept|reject|manage).*?(?:cookies|consent)/i.test(html) ||
                         /cookieconsent|gdpr-consent|cc-banner/i.test(html)
        
        // Contact Form detection - look for actual form elements
        hasContactForm = /<form[^>]*>[\s\S]*?(?:contact|email|phone|message)[\s\S]*?<\/form>/i.test(html) ||
                        /<input[^>]*(?:email|phone|message)[^>]*>/i.test(html)
        
        // Newsletter Signup detection
        hasNewsletterSignup = /(?:newsletter|subscribe|sign.?up)[\s\S]*?<form/i.test(html) ||
                             /<input[^>]*(?:email|newsletter)[^>]*>/i.test(html)
        
        // Analytics detection - look for actual tracking scripts
        hasAnalytics = /(?:google-analytics|gtag|ga\(|facebook|fbq|pixel|hotjar|mixpanel|amplitude|plausible|fathom)/i.test(html)
        
        // Third-party scripts detection
        hasThirdPartyScripts = /(?:cdn\.|\.js|\.com).*?(?:script|iframe)/i.test(html) &&
                              !/(?:jquery|bootstrap|font-awesome|googleapis\.com)/i.test(html)
        
        // Social media widgets
        hasSocialMediaWidgets = /(?:facebook|twitter|instagram|linkedin|youtube).*?(?:widget|plugin|share|like)/i.test(html)
        
        // Payment processing
        hasPaymentProcessing = /(?:stripe|paypal|square|shopify|woocommerce|payment)/i.test(html)
        
        // User accounts
        hasUserAccounts = /(?:login|signin|register|signup|account|profile)/i.test(html)
        
      } else {
        // If the page doesn't load, it's likely not a real website
        console.log(`Page returned status ${response.status} for ${targetUrl}`)
        return NextResponse.json({
          url: targetUrl,
          scanDate: new Date(),
          trustScore: 0,
          issues: [{
            id: "1",
            type: "critical",
            category: "data_collection",
            title: "Website Not Accessible",
            description: "The website could not be accessed or does not exist",
            recommendation: "Verify the URL is correct and the website is operational"
          }],
          dataCollectionPoints: [],
          cookieTypes: [],
          consentMechanisms: [],
          pageTitle: "Website Not Accessible",
          hasPrivacyPolicy: false,
          hasCookieBanner: false,
          hasContactForm: false,
          hasNewsletterSignup: false,
          hasAnalytics: false
        })
      }
    } catch (fetchError) {
      console.log('Could not fetch page content:', fetchError)
      return NextResponse.json({
        url: targetUrl,
        scanDate: new Date(),
        trustScore: 0,
        issues: [{
          id: "1",
          type: "critical",
          category: "data_collection",
          title: "Website Not Accessible",
          description: "The website could not be accessed or does not exist",
          recommendation: "Verify the URL is correct and the website is operational"
        }],
        dataCollectionPoints: [],
        cookieTypes: [],
        consentMechanisms: [],
        pageTitle: "Website Not Accessible",
        hasPrivacyPolicy: false,
        hasCookieBanner: false,
        hasContactForm: false,
        hasNewsletterSignup: false,
        hasAnalytics: false
      })
    }

    console.log('Analysis completed, generating compliance report...')

    // Generate compliance issues based on findings
    const issues: ComplianceIssue[] = []
    let trustScore = 100

    // Check for missing cookie consent (critical for any data collection)
    if (!hasCookieBanner && (hasContactForm || hasNewsletterSignup || hasAnalytics || hasThirdPartyScripts || hasSocialMediaWidgets)) {
      issues.push({
        id: "1",
        type: "critical",
        category: "consent",
        title: "Missing Cookie Consent Banner",
        description: "No cookie consent mechanism detected despite collecting user data",
        recommendation: "Implement a GDPR-compliant cookie consent banner that appears before any cookies are set",
        gdpr_article: "Article 7",
        ccpa_section: "Section 1798.135"
      })
      trustScore -= 30
    }

    // Check for missing privacy policy (critical for data collection)
    if (!hasPrivacyPolicy && (hasContactForm || hasNewsletterSignup || hasUserAccounts || hasPaymentProcessing)) {
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
      trustScore -= 25
    }

    // Check for analytics without consent
    if (hasAnalytics && !hasCookieBanner) {
      issues.push({
        id: "3",
        type: "critical",
        category: "cookies",
        title: "Analytics Tracking Without Consent",
        description: "Analytics scripts detected without proper consent mechanism",
        recommendation: "Implement cookie consent before loading analytics scripts",
        gdpr_article: "Article 7"
      })
      trustScore -= 20
    }

    // Check for third-party scripts without consent
    if (hasThirdPartyScripts && !hasCookieBanner) {
      issues.push({
        id: "4",
        type: "warning",
        category: "cookies",
        title: "Third-Party Scripts Without Consent",
        description: "Third-party scripts detected without consent mechanism",
        recommendation: "Review and implement consent for third-party scripts",
        gdpr_article: "Article 7"
      })
      trustScore -= 15
    }

    // Check for social media widgets without consent
    if (hasSocialMediaWidgets && !hasCookieBanner) {
      issues.push({
        id: "5",
        type: "warning",
        category: "cookies",
        title: "Social Media Widgets Without Consent",
        description: "Social media widgets detected without consent mechanism",
        recommendation: "Implement consent for social media tracking widgets",
        gdpr_article: "Article 7"
      })
      trustScore -= 10
    }

    // Check for contact form without privacy notice
    if (hasContactForm && !hasPrivacyPolicy) {
      issues.push({
        id: "6",
        type: "warning",
        category: "data_collection",
        title: "Contact Form Without Privacy Notice",
        description: "Contact form collects personal data without clear privacy notice",
        recommendation: "Add a privacy notice link near the form explaining how data will be used",
        gdpr_article: "Article 13"
      })
      trustScore -= 10
    }

    // Check for newsletter signup without privacy notice
    if (hasNewsletterSignup && !hasPrivacyPolicy) {
      issues.push({
        id: "7",
        type: "warning",
        category: "data_collection",
        title: "Newsletter Signup Without Privacy Notice",
        description: "Newsletter signup collects email addresses without privacy notice",
        recommendation: "Add privacy notice and consent checkbox to newsletter signup",
        gdpr_article: "Article 7"
      })
      trustScore -= 10
    }

    // Check for payment processing without privacy policy
    if (hasPaymentProcessing && !hasPrivacyPolicy) {
      issues.push({
        id: "8",
        type: "critical",
        category: "data_collection",
        title: "Payment Processing Without Privacy Policy",
        description: "Payment processing detected without privacy policy",
        recommendation: "Create comprehensive privacy policy for payment data handling",
        gdpr_article: "Article 13"
      })
      trustScore -= 20
    }

    // Ensure trust score doesn't go below 0
    trustScore = Math.max(0, trustScore)

    // Generate data collection points
    const dataCollectionPoints: string[] = []
    if (hasContactForm) dataCollectionPoints.push("Contact Form")
    if (hasNewsletterSignup) dataCollectionPoints.push("Newsletter Signup")
    if (hasAnalytics) dataCollectionPoints.push("Analytics Tracking")
    if (hasThirdPartyScripts) dataCollectionPoints.push("Third-Party Scripts")
    if (hasSocialMediaWidgets) dataCollectionPoints.push("Social Media Widgets")
    if (hasPaymentProcessing) dataCollectionPoints.push("Payment Processing")
    if (hasUserAccounts) dataCollectionPoints.push("User Accounts")

    // Generate consent mechanisms
    const consentMechanisms: string[] = []
    if (hasCookieBanner) consentMechanisms.push("Cookie Consent Banner")

    // Generate cookie types (simplified)
    const cookieTypes: string[] = []
    if (hasAnalytics) cookieTypes.push("Analytics")
    if (hasNewsletterSignup || hasSocialMediaWidgets) cookieTypes.push("Marketing")
    if (hasThirdPartyScripts) cookieTypes.push("Third-Party")
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

    console.log(`Compliance scan completed for ${targetUrl}. Trust score: ${trustScore}, Issues found: ${issues.length}`)

    // Save scan results to database (only if tables exist)
    try {
      // Check if compliance tables exist by trying to query them
      const { data: tableCheck, error: tableError } = await supabase
        .from('compliance_scans')
        .select('id')
        .limit(1)

      if (tableError) {
        console.log('Compliance tables not found, skipping database save:', tableError.message)
      } else {
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
          console.log('Scan saved to database with ID:', scanData.id)
          
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
            } else {
              console.log('Issues saved to database')
            }
          }

          // Insert trust score history
          const { error: historyError } = await supabase
            .from('trust_score_history')
            .insert({
              user_id: user.id,
              url: targetUrl,
              trust_score: trustScore,
              scan_id: scanData.id
            })

          if (historyError) {
            console.error('Error saving trust score history:', historyError)
          } else {
            console.log('Trust score history saved')
          }
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