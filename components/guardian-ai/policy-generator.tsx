"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Copy, Shield, CheckCircle, AlertTriangle } from "lucide-react"

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
}

interface GeneratedPolicy {
  type: "privacy" | "terms" | "cookies"
  content: string
  lastGenerated: Date
  version: string
}

export function PolicyGenerator() {
  const [policyData, setPolicyData] = useState<PolicyData>({
    businessName: "",
    websiteUrl: "",
    businessType: "",
    dataCollected: [],
    thirdPartyServices: [],
    dataRetentionPeriod: "2 years",
    userRights: [],
    contactEmail: "",
    jurisdiction: "United States"
  })

  const [generatedPolicies, setGeneratedPolicies] = useState<GeneratedPolicy[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const dataCollectionOptions = [
    "Name and contact information",
    "Email addresses",
    "Phone numbers",
    "Payment information",
    "IP addresses",
    "Cookies and tracking data",
    "Usage analytics",
    "Social media data",
    "Device information",
    "Location data"
  ]

  const thirdPartyOptions = [
    "Google Analytics",
    "Facebook Pixel",
    "Mailchimp",
    "Stripe",
    "PayPal",
    "Shopify",
    "WordPress",
    "Cloudflare",
    "AWS",
    "Google Ads"
  ]

  const userRightsOptions = [
    "Right to access personal data",
    "Right to rectification",
    "Right to erasure",
    "Right to data portability",
    "Right to restrict processing",
    "Right to object to processing",
    "Right to withdraw consent",
    "Right to lodge a complaint"
  ]

  const updatePolicyData = (field: keyof PolicyData, value: any) => {
    setPolicyData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof PolicyData, item: string) => {
    const currentArray = policyData[field] as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updatePolicyData(field, newArray)
  }

  const generatePolicies = async () => {
    setIsGenerating(true)

    // Simulate policy generation
    setTimeout(() => {
      const newPolicies: GeneratedPolicy[] = [
        {
          type: "privacy",
          content: generatePrivacyPolicy(),
          lastGenerated: new Date(),
          version: "1.0"
        },
        {
          type: "terms",
          content: generateTermsOfService(),
          lastGenerated: new Date(),
          version: "1.0"
        },
        {
          type: "cookies",
          content: generateCookiePolicy(),
          lastGenerated: new Date(),
          version: "1.0"
        }
      ]

      setGeneratedPolicies(newPolicies)
      setIsGenerating(false)
    }, 3000)
  }

  const generatePrivacyPolicy = () => {
    return `Privacy Policy for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. Information We Collect
We collect the following types of information:
${policyData.dataCollected.map(item => `- ${item}`).join('\n')}

2. How We Use Your Information
We use the collected information to:
- Provide and maintain our services
- Process transactions and payments
- Send marketing communications (with your consent)
- Improve our services and user experience
- Comply with legal obligations

3. Third-Party Services
We use the following third-party services:
${policyData.thirdPartyServices.map(service => `- ${service}`).join('\n')}

4. Data Retention
We retain your personal data for ${policyData.dataRetentionPeriod} unless a longer retention period is required by law.

5. Your Rights
You have the following rights regarding your personal data:
${policyData.userRights.map(right => `- ${right}`).join('\n')}

6. Contact Us
For any questions about this Privacy Policy, please contact us at:
${policyData.contactEmail}

7. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

This policy complies with GDPR and CCPA requirements.`
  }

  const generateTermsOfService = () => {
    return `Terms of Service for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. Acceptance of Terms
By accessing and using ${policyData.websiteUrl}, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily download one copy of the materials on ${policyData.businessName}'s website for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on ${policyData.businessName}'s website are provided on an 'as is' basis. ${policyData.businessName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall ${policyData.businessName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ${policyData.businessName}'s website.

5. Accuracy of Materials
The materials appearing on ${policyData.businessName}'s website could include technical, typographical, or photographic errors. ${policyData.businessName} does not warrant that any of the materials on its website are accurate, complete or current.

6. Links
${policyData.businessName} has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.

7. Modifications
${policyData.businessName} may revise these terms of service for its website at any time without notice.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of ${policyData.jurisdiction}.`
  }

  const generateCookiePolicy = () => {
    return `Cookie Policy for ${policyData.businessName}

Last updated: ${new Date().toLocaleDateString()}

1. What Are Cookies
Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and understand how you use our site.

2. How We Use Cookies
We use cookies for the following purposes:
- Essential cookies: Required for the website to function properly
- Analytics cookies: Help us understand how visitors interact with our website
- Marketing cookies: Used to deliver relevant advertisements
- Preference cookies: Remember your settings and preferences

3. Third-Party Cookies
We use the following third-party services that may set cookies:
${policyData.thirdPartyServices.map(service => `- ${service}`).join('\n')}

4. Managing Cookies
You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.

5. Your Choices
You have the following choices regarding cookies:
- Accept all cookies
- Reject non-essential cookies
- Modify your browser settings to control cookies

6. Updates to This Policy
We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.

For more information about our use of cookies, please contact us at ${policyData.contactEmail}.`
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadPolicy = (content: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${policyData.businessName}-${type}-policy.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Automated Policy Generator
          </CardTitle>
          <CardDescription>
            Generate customized Privacy Policy, Terms of Service, and Cookie Policy based on your business needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={policyData.businessName}
                onChange={(e) => updatePolicyData('businessName', e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL *</Label>
              <Input
                id="websiteUrl"
                value={policyData.websiteUrl}
                onChange={(e) => updatePolicyData('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={policyData.businessType}
                onChange={(e) => updatePolicyData('businessType', e.target.value)}
                placeholder="e.g., E-commerce, SaaS, Consulting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                value={policyData.contactEmail}
                onChange={(e) => updatePolicyData('contactEmail', e.target.value)}
                placeholder="privacy@yourbusiness.com"
              />
            </div>
          </div>

          {/* Data Collection */}
          <div className="space-y-3">
            <Label>What data do you collect?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dataCollectionOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={policyData.dataCollected.includes(option)}
                    onCheckedChange={() => toggleArrayItem('dataCollected', option)}
                  />
                  <Label htmlFor={option} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Third Party Services */}
          <div className="space-y-3">
            <Label>Third-party services you use</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {thirdPartyOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={policyData.thirdPartyServices.includes(option)}
                    onCheckedChange={() => toggleArrayItem('thirdPartyServices', option)}
                  />
                  <Label htmlFor={option} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* User Rights */}
          <div className="space-y-3">
            <Label>User rights to include</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userRightsOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={policyData.userRights.includes(option)}
                    onCheckedChange={() => toggleArrayItem('userRights', option)}
                  />
                  <Label htmlFor={option} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={generatePolicies}
            disabled={!policyData.businessName || !policyData.websiteUrl || !policyData.contactEmail || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? "Generating Policies..." : "Generate All Policies"}
          </Button>
        </CardContent>
      </Card>

      {generatedPolicies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Generated Policies
            </CardTitle>
            <CardDescription>
              Your customized policies are ready. Review, copy, or download them below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="privacy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
              </TabsList>
              
              {generatedPolicies.map((policy) => (
                <TabsContent key={policy.type} value={policy.type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Version {policy.version}</Badge>
                      <span className="text-sm text-gray-500">
                        Generated: {policy.lastGenerated.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(policy.content)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPolicy(policy.content, policy.type)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{policy.content}</pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Disclaimer:</strong> These policies are generated based on your inputs and current best practices. 
          However, they should be reviewed by a qualified legal professional to ensure they meet your specific legal requirements 
          and comply with all applicable laws in your jurisdiction.
        </AlertDescription>
      </Alert>
    </div>
  )
} 