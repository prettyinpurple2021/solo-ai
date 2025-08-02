import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

interface PolicyData {
  businessName: string
  websiteUrl: string
  businessType: string
  dataCollected: string[]
  thirdPartyServices: string[]
  dataRetentionPeriod: string
  userRights: string[]
  contactEmail: string
  jurisdiction: string
  industry?: string
  targetAudience?: string
  dataProcessingPurposes?: string[]
}

interface GeneratedPolicy {
  type: "privacy" | "terms" | "cookies"
  content: string
  lastGenerated: Date
  version: string
  complianceLevel: "basic" | "standard" | "comprehensive"
  jurisdictions: string[]
}

export async function POST(request: NextRequest) {
  try {
    const policyData: PolicyData = await request.json()

    // Validate required fields
    if (!policyData.businessName || !policyData.websiteUrl || !policyData.contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, websiteUrl, contactEmail' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Generating policies for: ${policyData.businessName} by user: ${user.id}`)

    // Generate policies using AI
    const policies: GeneratedPolicy[] = []

    // Generate Privacy Policy
    const privacyPolicy = await generatePrivacyPolicy(policyData)
    policies.push({
      type: "privacy",
      content: privacyPolicy,
      lastGenerated: new Date(),
      version: "1.0",
      complianceLevel: "comprehensive",
      jurisdictions: ["GDPR", "CCPA", "LGPD"]
    })

    // Generate Terms of Service
    const termsOfService = await generateTermsOfService(policyData)
    policies.push({
      type: "terms",
      content: termsOfService,
      lastGenerated: new Date(),
      version: "1.0",
      complianceLevel: "standard",
      jurisdictions: ["US", "EU"]
    })

    // Generate Cookie Policy
    const cookiePolicy = await generateCookiePolicy(policyData)
    policies.push({
      type: "cookies",
      content: cookiePolicy,
      lastGenerated: new Date(),
      version: "1.0",
      complianceLevel: "comprehensive",
      jurisdictions: ["GDPR", "CCPA"]
    })

    console.log(`Successfully generated ${policies.length} policies for ${policyData.businessName}`)

    // Save policies to database
    try {
      // Save policy data
      const { data: policyDataRecord, error: policyDataError } = await supabase
        .from('policy_data')
        .insert({
          user_id: user.id,
          business_name: policyData.businessName,
          website_url: policyData.websiteUrl,
          business_type: policyData.businessType,
          data_collected: policyData.dataCollected,
          third_party_services: policyData.thirdPartyServices,
          data_retention_period: policyData.dataRetentionPeriod,
          user_rights: policyData.userRights,
          contact_email: policyData.contactEmail,
          jurisdiction: policyData.jurisdiction,
          industry: policyData.industry,
          target_audience: policyData.targetAudience,
          data_processing_purposes: policyData.dataProcessingPurposes
        })
        .select()
        .single()

      if (policyDataError) {
        console.error('Error saving policy data:', policyDataError)
      }

      // Save generated policies
      const policiesToInsert = policies.map(policy => ({
        user_id: user.id,
        business_name: policyData.businessName,
        website_url: policyData.websiteUrl,
        policy_type: policy.type,
        content: policy.content,
        version: policy.version,
        compliance_level: policy.complianceLevel,
        jurisdictions: policy.jurisdictions
      }))

      const { error: policiesError } = await supabase
        .from('generated_policies')
        .insert(policiesToInsert)

      if (policiesError) {
        console.error('Error saving generated policies:', policiesError)
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with response even if database save fails
    }

    return NextResponse.json({
      policies,
      generatedAt: new Date(),
      businessName: policyData.businessName
    })

  } catch (error) {
    console.error('Policy generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate policies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generatePrivacyPolicy(policyData: PolicyData): Promise<string> {
  const prompt = `Generate a comprehensive, legally compliant Privacy Policy for a business with the following details:

Business Name: ${policyData.businessName}
Website: ${policyData.websiteUrl}
Business Type: ${policyData.businessType || 'General Business'}
Contact Email: ${policyData.contactEmail}
Jurisdiction: ${policyData.jurisdiction}

Data Collected: ${policyData.dataCollected.join(', ')}
Third-Party Services: ${policyData.thirdPartyServices.join(', ')}
Data Retention Period: ${policyData.dataRetentionPeriod}
User Rights: ${policyData.userRights.join(', ')}

Requirements:
1. Must comply with GDPR, CCPA, and other relevant privacy laws
2. Use clear, understandable language
3. Include all required sections for legal compliance
4. Be specific to the business type and data collection practices
5. Include contact information and user rights
6. Add proper legal disclaimers
7. Include data breach notification procedures
8. Specify international data transfers if applicable

Generate a complete, professional Privacy Policy that can be used immediately.`

  try {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt,
      maxTokens: 2000,
      temperature: 0.3
    })

    return text
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    return generateFallbackPrivacyPolicy(policyData)
  }
}

async function generateTermsOfService(policyData: PolicyData): Promise<string> {
  const prompt = `Generate a comprehensive Terms of Service agreement for a business with the following details:

Business Name: ${policyData.businessName}
Website: ${policyData.websiteUrl}
Business Type: ${policyData.businessType || 'General Business'}
Contact Email: ${policyData.contactEmail}
Jurisdiction: ${policyData.jurisdiction}

Requirements:
1. Include all standard legal protections
2. Cover intellectual property rights
3. Include disclaimers and limitations of liability
4. Specify governing law and jurisdiction
5. Include dispute resolution procedures
6. Cover user responsibilities and prohibited uses
7. Include termination clauses
8. Be specific to the business type and services offered

Generate a complete, professional Terms of Service that provides adequate legal protection.`

  try {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt,
      maxTokens: 2000,
      temperature: 0.3
    })

    return text
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    return generateFallbackTermsOfService(policyData)
  }
}

async function generateCookiePolicy(policyData: PolicyData): Promise<string> {
  const prompt = `Generate a comprehensive Cookie Policy for a business with the following details:

Business Name: ${policyData.businessName}
Website: ${policyData.websiteUrl}
Third-Party Services: ${policyData.thirdPartyServices.join(', ')}

Requirements:
1. Must comply with GDPR and CCPA cookie requirements
2. Explain what cookies are and how they're used
3. Categorize cookies (essential, analytics, marketing, etc.)
4. Include specific third-party cookie information
5. Provide clear instructions for cookie management
6. Include consent mechanisms
7. Explain user choices and rights
8. Be specific about the actual services used

Generate a complete, professional Cookie Policy that ensures compliance with cookie laws.`

  try {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt,
      maxTokens: 1500,
      temperature: 0.3
    })

    return text
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    return generateFallbackCookiePolicy(policyData)
  }
}

// Fallback functions in case AI generation fails
function generateFallbackPrivacyPolicy(policyData: PolicyData): string {
  return `Privacy Policy for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. Introduction
This Privacy Policy describes how ${policyData.businessName} ("we," "us," or "our") collects, uses, and protects your personal information when you visit our website ${policyData.websiteUrl}.

2. Information We Collect
We collect the following types of information:
${policyData.dataCollected.map(item => `- ${item}`).join('\n')}

3. How We Use Your Information
We use the collected information to:
- Provide and maintain our services
- Process transactions and payments
- Send marketing communications (with your consent)
- Improve our services and user experience
- Comply with legal obligations

4. Third-Party Services
We use the following third-party services:
${policyData.thirdPartyServices.map(service => `- ${service}`).join('\n')}

5. Data Retention
We retain your personal data for ${policyData.dataRetentionPeriod} unless a longer retention period is required by law.

6. Your Rights
You have the following rights regarding your personal data:
${policyData.userRights.map(right => `- ${right}`).join('\n')}

7. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

8. International Data Transfers
Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

9. Data Breach Notification
In the event of a data breach, we will notify affected users and relevant authorities as required by law.

10. Contact Us
For any questions about this Privacy Policy, please contact us at:
${policyData.contactEmail}

11. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

This policy complies with GDPR, CCPA, and other applicable privacy laws.`
}

function generateFallbackTermsOfService(policyData: PolicyData): string {
  return `Terms of Service for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. Acceptance of Terms
By accessing and using ${policyData.websiteUrl}, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily download one copy of the materials on ${policyData.businessName}'s website for personal, non-commercial transitory viewing only.

3. Intellectual Property Rights
All content on this website, including text, graphics, logos, and software, is the property of ${policyData.businessName} and is protected by copyright laws.

4. User Responsibilities
You agree to:
- Use the website only for lawful purposes
- Not attempt to gain unauthorized access to our systems
- Not interfere with the website's functionality
- Respect intellectual property rights

5. Disclaimer
The materials on ${policyData.businessName}'s website are provided on an 'as is' basis. We make no warranties, expressed or implied.

6. Limitations of Liability
In no event shall ${policyData.businessName} be liable for any damages arising out of the use or inability to use our services.

7. Termination
We may terminate or suspend access to our service immediately, without prior notice, for any reason.

8. Governing Law
These terms are governed by the laws of ${policyData.jurisdiction}.

9. Contact Information
For questions about these terms, contact us at ${policyData.contactEmail}.`
}

function generateFallbackCookiePolicy(policyData: PolicyData): string {
  return `Cookie Policy for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. What Are Cookies
Cookies are small text files that are placed on your device when you visit our website.

2. How We Use Cookies
We use cookies for:
- Essential functionality
- Analytics and performance
- Marketing and advertising
- User preferences

3. Third-Party Cookies
We use the following third-party services that may set cookies:
${policyData.thirdPartyServices.map(service => `- ${service}`).join('\n')}

4. Managing Cookies
You can control cookies through your browser settings. However, disabling certain cookies may affect website functionality.

5. Your Choices
You can:
- Accept all cookies
- Reject non-essential cookies
- Modify browser settings

6. Updates to This Policy
We may update this Cookie Policy from time to time.

For questions about cookies, contact us at ${policyData.contactEmail}.`
} 