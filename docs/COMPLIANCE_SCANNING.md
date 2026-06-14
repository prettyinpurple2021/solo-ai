# Compliance Scanning

## Overview

The Compliance Scanning system performs automated security and regulatory checks on websites and applications. It analyzes HTML for data collection points, cookie usage, privacy policies, analytics tracking, and generates trust scores. The system includes SSRF (Server-Side Request Forgery) protection, DNS validation, and compliance policy verification.

**Use Cases**:
- Scan competitor websites for compliance status
- Audit your own site for GDPR/CCPA readiness
- Generate compliance reports for enterprise customers
- Monitor changes in competitor privacy policies

**Key Components**:
- `src/lib/compliance-analyzer.ts` — Core scanning logic
- `src/components/guardian-ai/compliance-scanner.tsx` — UI component
- `src/app/api/compliance/scan/route.ts` — Scan endpoint (POST)
- `src/app/api/compliance/policies/route.ts` — Policy generation (POST)
- `src/app/api/compliance/consent/route.ts` — Consent tracking
- `src/app/compliance/page.tsx` — Compliance dashboard

---

## 1. Architecture

### Scanning Flow

```
User Request
  ├─ URL validation
  ├─ SSRF protection (DNS check)
  ├─ Network request to URL
  ├─ HTML parsing
  ├─ Pattern analysis
  │   ├─ Privacy policy detection
  │   ├─ Cookie banner detection
  │   ├─ Contact form detection
  │   ├─ Newsletter signup detection
  │   ├─ Analytics tracking detection
  │   └─ Data collection point identification
  ├─ Trust score calculation
  └─ Response with findings
```

### Analysis Engine

```typescript
export function analyze(html: string) {
  const text = html.toLowerCase()
  const title = extractTitle(html)
  
  // Pattern-based detection
  const hasPrivacyPolicy = text.includes('privacy policy')
  const hasCookieBanner = text.includes('cookie') && text.includes('accept')
  const hasContactForm = text.includes('contact') && text.includes('form')
  const hasNewsletter = text.includes('newsletter')
  const hasAnalytics = text.includes('gtag') || text.includes('ga')
  
  // Trust score: 50 base + points for compliance
  let trustScore = 50
  if (hasPrivacyPolicy) trustScore += 15
  if (hasCookieBanner) trustScore += 10
  if (hasContactForm) trustScore += 5
  if (hasAnalytics && !hasCookieBanner) trustScore -= 10
  
  return {
    page_title: title,
    has_privacy_policy: hasPrivacyPolicy,
    has_cookie_banner: hasCookieBanner,
    has_contact_form: hasContactForm,
    data_collection_points: [...],
    trust_score: Math.max(0, Math.min(100, trustScore))
  }
}
```

**Note**: Cheerio (HTML parsing library) was removed to reduce bundle size. The analyzer now uses simplified text-based pattern matching.

---

## 2. REST API

### POST `/api/compliance/scan`

Scan a website for compliance issues.

```
POST /api/compliance/scan
Content-Type: application/json

{
  "url": "https://example.com",
  "userId": "user-123"
}

Response (200):
{
  "id": "scan-123",
  "scan_date": "2026-06-10T13:00:00Z",
  "url": "https://example.com",
  "trust_score": 72,
  "details": {
    "page_title": "Example Site",
    "has_privacy_policy": true,
    "has_cookie_banner": true,
    "has_contact_form": true,
    "has_newsletter_signup": false,
    "has_analytics": true,
    "data_collection_points": [
      "Contact Form",
      "Analytics Tracking"
    ],
    "cookie_types": [
      "Analytics",
      "Necessary",
      "Marketing"
    ],
    "consent_mechanisms": [
      "Cookie Banner"
    ]
  }
}

Error Responses:
- 400: Invalid URL, missing required fields, or blocked/private target
  { "error": "Invalid URL format" }
- 500: Fetch, analysis, or database persistence failure
  { "error": "Scan failed" }
```

### POST `/api/compliance/policies`

Generate policy content (privacy, terms, cookies) from business profile data.

```
POST /api/compliance/policies

{
  "userId": "user-123",
  "businessName": "Example Co",
  "websiteUrl": "https://example.com",
  "contactEmail": "legal@example.com",
  "jurisdiction": "US",
  "policyTypes": ["privacy", "terms", "cookies"]
}

Response:
{
  "policy_data_id": "policy-data-123",
  "generated": [
    {
      "id": "generated-policy-1",
      "type": "privacy",
      "version": 1,
      "generated_at": "2026-06-10T13:00:00Z"
    }
  ]
}
```

### GET `/api/compliance/consent?userId={userId}`

Fetch consent logs and data requests for a user.

```
GET /api/compliance/consent?userId=user-123

Response:
{ "consent_logs": [...], "data_requests": [...] }
```

### POST `/api/compliance/consent`

Track consent events or create data requests.

```
POST /api/compliance/consent

{
  "userId": "user-123",
  "type": "log-consent",
  "payload": {
    "userEmail": "user@example.com",
    "consentType": "analytics",
    "action": "accepted",
    "ipAddress": "203.0.113.10"
  }
}

Response: { "ok": true }
```

---

## 3. Security: SSRF Protection

### What is SSRF?

Server-Side Request Forgery (SSRF) is an attack where an attacker tricks your server into making requests to internal systems:

```
Attacker: "Scan http://localhost:8080/admin"
Your Server: Connects to localhost:8080 (internal admin panel!)
Result: Attacker gains access to internal systems
```

### Protection Mechanism

```typescript
// src/app/api/compliance/scan/route.ts

async function validateAndNormalizeScanUrl(input: string): Promise<string> {
  const parsed = new URL(input)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed')
  }
  if (parsed.username || parsed.password) {
    throw new Error('URLs with credentials are not allowed')
  }
  // Blocks localhost/private targets and validates DNS resolves to public IPs
  const records = await dns.lookup(parsed.hostname, { all: true })
  // ...private IPv4/IPv6 checks...
  return parsed.toString()
}

export async function POST(req: NextRequest) {
  const { url, userId } = await req.json()
  const scanUrl = await validateAndNormalizeScanUrl(url)
  const html = await fetchHtml(scanUrl)
  const result = analyze(html)
  // Persist in compliance_scans and trust_score_history
  return NextResponse.json({
    id: inserted[0].id,
    scan_date: inserted[0].scan_date,
    url: scanUrl,
    trust_score: result.trust_score,
    details: result,
  })
}
```

### Testing SSRF Protection

```bash
# ✅ Safe: Public URL
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'

# ❌ Blocked: Localhost
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8080/admin"}'
# Response: 403 Forbidden

# ❌ Blocked: Private IP
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.1"}'
# Response: 403 Forbidden

# ❌ Blocked: AWS Metadata
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
# Response: 403 Forbidden
```

---

## 4. Analysis Results

### Findings Structure

```typescript
{
  page_title: string
  has_privacy_policy: boolean
  has_cookie_banner: boolean
  has_contact_form: boolean
  has_newsletter_signup: boolean
  has_analytics: boolean
  data_collection_points: string[]
  cookie_types: string[]
  consent_mechanisms: string[]
  trust_score: number  // 0-100
}
```

### Trust Score Calculation

| Factor | Points | Condition |
|--------|--------|-----------|
| Base | 50 | Always |
| Privacy Policy | +15 | `has_privacy_policy === true` |
| Cookie Banner | +10 | `has_cookie_banner === true` |
| Contact Form | +5 | `has_contact_form === true` |
| Analytics without consent | -10 | `has_analytics && !has_cookie_banner` |
| **Max** | **100** | Capped at 100 |
| **Min** | **0** | Capped at 0 |

**Example**:
```
Base: 50
+ Privacy Policy: +15 → 65
+ Cookie Banner: +10 → 75
+ Contact Form: +5 → 80
- Analytics penalty (none, has banner): 0
= Final: 80
```

### Data Collection Points

Identified from HTML patterns:

| Type | Detection |
|------|-----------|
| Contact Form | `<form>` with contact-related fields |
| Newsletter Signup | "subscribe", "email", "newsletter" keywords |
| Analytics Tracking | `gtag`, `ga`, `google-analytics` code |
| Social Media Tracking | Facebook Pixel, LinkedIn Insight |
| CRM Integration | HubSpot, Salesforce tracking |

### Cookie Types

Detected from cookie banner analysis:

| Type | Description |
|------|-------------|
| Necessary | Functional cookies (session, security) |
| Analytics | Traffic analysis and behavior tracking |
| Marketing | Advertising and retargeting |
| Preferences | User preferences (language, theme) |

---

## 5. Compliance Policy Mapping

### GDPR (EU)

**Requirements**:
- ✅ Privacy policy (mandatory)
- ✅ Cookie consent banner (Article 7)
- ✅ Right to access data (Article 15)
- ✅ Right to be forgotten (Article 17)
- ✅ Data Processing Agreement with vendors

**Auto-checks**:
- `has_privacy_policy === true` ✓
- `has_cookie_banner === true` ✓
- Analytics requires explicit consent before firing

### CCPA (California)

**Requirements**:
- ✅ Privacy policy (mandatory)
- ✅ "Do Not Sell My Personal Information" link
- ✅ Right to know (consumer can request data)
- ✅ Right to delete (consumer can request deletion)
- ✅ Right to opt-out

**Auto-checks**:
- `has_privacy_policy === true` ✓
- Privacy policy mentions "sale of personal information" ✓

### SOC 2 Type II

**Requirements**:
- ✅ Security audit (annual)
- ✅ Data encryption in transit and at rest
- ✅ Access controls
- ✅ Audit logging
- ✅ Incident response plan

**Auto-checks**:
- HTTPS connection (encrypted in transit) ✓
- Security headers present ✓

---

## 6. Implementation Guide

### Using in Competitor Analysis

```typescript
import { api } from '@/lib/api-client'

async function analyzeCompetitor(competitorUrl: string) {
  try {
    // Scan competitor website
    const results = await api.post('/api/compliance/scan', {
      url: competitorUrl,
      depth: 'full',
      checkPolicies: true
    })
    
    // Save results
    await db.complianceScan.create({
      data: {
        competitorId: competitor.id,
        url: competitorUrl,
        trustScore: results.trust_score,
        findings: results,
        scannedAt: new Date()
      }
    })
    
    // Generate report
    console.log(`${competitor.name}: ${results.trust_score}/100`)
    console.log(`Privacy Policy: ${results.has_privacy_policy ? '✓' : '✗'}`)
    console.log(`Cookie Banner: ${results.has_cookie_banner ? '✓' : '✗'}`)
    console.log(`Data Collection: ${results.data_collection_points.join(', ')}`)
    
  } catch (error) {
    if (error.status === 403) {
      console.error('URL blocked for security reasons')
    } else if (error.status === 504) {
      console.error('Website unreachable')
    } else {
      console.error('Scan failed:', error.message)
    }
  }
}

await analyzeCompetitor('https://competitor.com')
```

### Scheduled Compliance Audits

```typescript
// In workflow or cron job
async function dailyComplianceAudit() {
  const competitors = await db.competitor.findMany({
    where: { userId: currentUser.id }
  })
  
  for (const competitor of competitors) {
    // Scan every 7 days
    const lastScan = await db.complianceScan.findFirst({
      where: { competitorId: competitor.id },
      orderBy: { scannedAt: 'desc' }
    })
    
    const daysSinceLastScan = lastScan 
      ? Math.floor((Date.now() - lastScan.scannedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    if (daysSinceLastScan > 7) {
      await analyzeCompetitor(competitor.website)
    }
  }
}
```

### Building Compliance Dashboard

```tsx
import { ComplianceScanner } from '@/components/guardian-ai/compliance-scanner'

export function ComplianceDashboard() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(false)

  const handleScan = async (url: string) => {
    setLoading(true)
    try {
      const result = await fetch('/api/compliance/scan', {
        method: 'POST',
        body: JSON.stringify({ url })
      }).then(r => r.json())
      
      setScans(prev => [{ ...result, timestamp: new Date() }, ...prev])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ComplianceScanner onScan={handleScan} loading={loading} />
      
      <div className="space-y-4 mt-8">
        {scans.map(scan => (
          <div key={scan.scanId} className="border p-4 rounded">
            <h3>{scan.page_title}</h3>
            <div className="flex gap-4">
              <span>Trust Score: {scan.trust_score}/100</span>
              <span>Privacy Policy: {scan.has_privacy_policy ? '✓' : '✗'}</span>
              <span>Cookie Banner: {scan.has_cookie_banner ? '✓' : '✗'}</span>
            </div>
            <p className="text-sm text-gray-500">
              {scan.data_collection_points.length} data collection points
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 7. Troubleshooting

### Issue: "URL blocked for security reasons"

**Cause**: URL is private IP or localhost

**Fix**:
```bash
# ✅ Use public URL instead
https://www.example.com

# ❌ Don't scan localhost/private IPs
http://localhost:3000
http://192.168.1.1
http://169.254.169.254
```

### Issue: "Failed to fetch URL: connection timeout"

**Cause**: Website is unreachable or slow

**Fix**:
```bash
# 1. Verify URL is accessible from browser
open https://example.com

# 2. Check if website is blocking requests
# Some sites block automated scrapers - add User-Agent header

# 3. Try again later (temporary connectivity issue)

# 4. Check if firewall is blocking outbound connections
# Contact infrastructure team
```

### Issue: "Failed to resolve hostname"

**Cause**: DNS resolution failed

**Diagnosis**:
```bash
# Test DNS resolution locally
nslookup example.com
dig example.com

# If fails, try again (DNS propagation delay)
```

### Issue: Trust Score is Too Low

**Diagnosis**:
```typescript
const results = await api.post('/api/compliance/scan', { url })
console.log(results)

// Check what factors are missing:
// - has_privacy_policy: false → +15 points missing
// - has_cookie_banner: false → +10 points missing
// - has_analytics && !has_cookie_banner: -10 penalty

// If analytics detected without cookie banner, that's the issue
```

**Recommendations**:
```
Score < 50: Critical issues
  → Add privacy policy
  → Add cookie banner with consent mechanism
  → Remove analytics tracking or require consent first

Score 50-75: Some improvements needed
  → Add contact form for user communications
  → Ensure privacy policy covers all data collection
  → Document data retention policies

Score 75+: Generally compliant
  → Add optional: GDPR/CCPA specific language
  → Consider SOC 2 certification for enterprise
```

---

## 8. Best Practices

### 1. Understand Trust Score Limitations

```
Trust Score is NOT a compliance audit. It's a quick heuristic check:
- ✓ Fast: < 2 seconds
- ✓ Good for baseline compliance
- ✗ Not a replacement for legal review
- ✗ Doesn't verify policy content
- ✗ Can't detect policy violations (e.g., not following GDPR)

Always have legal review for compliance-critical decisions.
```

### 2. Respect Rate Limits

```typescript
// ✅ Queue scans to avoid overloading targets
const queue = new WorkflowQueue()
for (const url of urlsToScan) {
  await queue.add({ url }, { delay: 5000 })  // 5 sec between scans
}

// ❌ Don't hammer a single website
for (const url of urlsToScan) {
  await scanUrl(url)  // No delay = DOS-like behavior
}
```

### 3. Handle Scan Failures Gracefully

```typescript
// ✅ Log failures for manual review
try {
  const result = await api.post('/api/compliance/scan', { url })
} catch (error) {
  await db.failedScan.create({
    url,
    reason: error.message,
    timestamp: new Date()
  })
  // Notify user, don't crash
}

// ❌ Don't silently ignore scan errors
const result = await api.post('/api/compliance/scan', { url })
console.log(result)  // Might be undefined!
```

### 4. Cache Scan Results

```typescript
// ✅ Reuse recent scans (URL probably hasn't changed)
const lastScan = await db.complianceScan.findFirst({
  where: {
    url,
    scannedAt: { gte: dayAgo }  // Scan from last 24h
  }
})
if (lastScan) return lastScan.findings

// Fresh scan if not cached
const results = await api.post('/api/compliance/scan', { url })
```

### 5. Monitor Changes Over Time

```typescript
// Track compliance drift
const previous = await db.complianceScan.findFirst({
  where: { competitorId: id },
  orderBy: { scannedAt: 'desc' },
  skip: 1  // Get second-most recent
})
const current = latest

if (current.trust_score < previous.trust_score) {
  // Compliance score decreased
  alert(`Competitor ${name} compliance score dropped from ${previous} to ${current}`)
}

if (!current.has_privacy_policy && previous.has_privacy_policy) {
  // Privacy policy was removed!
  alert(`Competitor ${name} removed privacy policy`)
}
```

---

## 9. Related Documentation

- [Security Guide](SECURITY.md) — Security best practices including SSRF
- [Compliance Dashboard](../src/app/compliance/page.tsx) — UI component
- [Compliance Policies API](../src/app/api/compliance/policies/route.ts) — Custom policies
- [User Privacy](../SECURITY.md) — User data and privacy considerations
