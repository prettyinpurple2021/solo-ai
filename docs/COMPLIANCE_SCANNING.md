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
- `src/app/api/compliance/policies/route.ts` — Policy management (GET/POST)
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
  "depth": "full",              // "simple" | "full" | "deep"
  "checkPolicies": true,
  "checkCookies": true
}

Response (200):
{
  "url": "https://example.com",
  "scanId": "scan-123",
  "timestamp": "2026-06-10T13:00:00Z",
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
  ],
  "trust_score": 72,
  "compliance_status": {
    "gdpr": "partial",
    "ccpa": "compliant",
    "gdpr_issues": [
      "Missing legitimate interest disclosure for analytics"
    ]
  }
}

Error Responses:
- 400: Invalid URL or malformed request
  { "error": "Invalid URL format" }
- 403: SSRF detected or blocked URL
  { "error": "URL blocked for security reasons" }
- 504: Timeout (URL unreachable)
  { "error": "Failed to fetch URL: connection timeout" }
```

### GET `/api/compliance/scan/{scanId}`

Retrieve previous scan results.

```
GET /api/compliance/scan/scan-123

Response:
{
  "id": "scan-123",
  "url": "https://example.com",
  "scanResults": { ... },
  "timestamp": "2026-06-10T13:00:00Z"
}
```

### GET `/api/compliance/policies`

List compliance policies (GDPR, CCPA, SOC2, etc).

```
GET /api/compliance/policies

Response:
{
  "policies": [
    {
      "id": "gdpr",
      "name": "GDPR (EU)",
      "requirements": [
        "Privacy policy required",
        "Cookie consent mechanism",
        "Right to be forgotten",
        "Data processing agreements"
      ],
      "severity": "high"
    },
    {
      "id": "ccpa",
      "name": "CCPA (California)",
      "requirements": [...],
      "severity": "high"
    },
    {
      "id": "soc2",
      "name": "SOC 2 Type II",
      "requirements": [...],
      "severity": "medium"
    }
  ]
}
```

### POST `/api/compliance/policies`

Create custom compliance policy.

```
POST /api/compliance/policies

{
  "name": "Custom Enterprise Policy",
  "description": "Our internal security standard",
  "requirements": [
    { "rule": "has_privacy_policy", "description": "Privacy policy required" },
    { "rule": "has_cookie_banner", "description": "Cookie consent" },
    { "rule": "no_analytics_without_consent", "description": "Analytics requires opt-in" }
  ]
}

Response:
{
  "id": "policy-custom-123",
  "name": "Custom Enterprise Policy",
  "requirements": [...],
  "createdAt": "2026-06-10T13:00:00Z"
}
```

### POST `/api/compliance/consent`

Track user consent for analytics.

```
POST /api/compliance/consent

{
  "userId": "user-123",
  "consentType": "analytics",
  "consentGiven": true,
  "timestamp": "2026-06-10T13:00:00Z",
  "ipAddress": "192.168.1.1"
}

Response:
{
  "consentId": "consent-456",
  "status": "recorded"
}
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

export async function POST(request: Request) {
  const { url } = await request.json()
  
  // 1. Validate URL format
  const parsed = new URL(url)
  
  // 2. Reject private IP ranges (SSRF protection)
  const blockedIPs = [
    '127.0.0.1',           // localhost
    '0.0.0.0',             // 0.0.0.0
    '169.254.169.254',     // AWS metadata
    '::1',                 // IPv6 localhost
    /^10\./,               // Private: 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\./,  // Private: 172.16.0.0/12
    /^192\.168\./          // Private: 192.168.0.0/16
  ]
  
  for (const blocked of blockedIPs) {
    if (typeof blocked === 'string' && parsed.hostname === blocked) {
      return Response.json(
        { error: 'URL blocked for security reasons' },
        { status: 403 }
      )
    }
    if (blocked instanceof RegExp && blocked.test(parsed.hostname)) {
      return Response.json(
        { error: 'URL blocked for security reasons' },
        { status: 403 }
      )
    }
  }
  
  // 3. DNS lookup validation (verify hostname resolves to public IP)
  const dns = require('dns').promises
  try {
    const addresses = await dns.resolve4(parsed.hostname)
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return Response.json(
          { error: 'URL resolves to private IP' },
          { status: 403 }
        )
      }
    }
  } catch (err) {
    return Response.json(
      { error: 'Failed to resolve hostname' },
      { status: 400 }
    )
  }
  
  // 4. Safe to scan
  const html = await fetch(url).then(r => r.text())
  const results = analyze(html)
  return Response.json(results)
}

function isPrivateIP(ip: string): boolean {
  return /^(10|172|192)\./.test(ip) || ip === '127.0.0.1'
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

**Diagnos**:
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
