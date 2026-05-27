# Compliance & Security Scanning

## Overview

The **Compliance Scanner** is an internal API endpoint that analyzes external websites for legal compliance, security issues, and best practices. It performs **SSRF-resistant validation**, fetches HTML, and runs automated checks.

**Key Components**:
- `src/app/api/compliance/scan/route.ts` — Scan endpoint (134 lines)
- `src/lib/compliance-analyzer.ts` — Analysis logic
- DNS validation (prevents attacks on private networks)

---

## 1. Security Model

### SSRF (Server-Side Request Forgery) Protection

The compliance scanner must prevent attackers from using it to scan internal networks. Protection layers:

#### 1) IP Address Validation

**Private IPv4 Ranges** (blocked):
- `10.0.0.0/8` (10.0.0.0 - 10.255.255.255)
- `172.16.0.0/12` (172.16.0.0 - 172.31.255.255)
- `192.168.0.0/16` (192.168.0.0 - 192.168.255.255)
- `127.0.0.0/8` (127.0.0.1 - localhost)
- `169.254.0.0/16` (link-local / APIPA)
- `0.0.0.0/8` (current network)

**Private IPv6 Ranges** (blocked):
- `::1` (loopback)
- `fc00::/7` (unique local)
- `fe80::/10` (link-local)

#### 2) DNS Lookup Validation

When a hostname is provided (not an IP):

```typescript
const records = await dns.lookup(hostname, { all: true })

// Check ALL resolved addresses (hostname may return multiple IPs)
for (const record of records) {
  if (record.family === 4 && isPrivateIPv4(record.address)) {
    throw new Error('Target resolves to a private network address')
  }
  if (record.family === 6 && isPrivateIPv6(record.address)) {
    throw new Error('Target resolves to a private network address')
  }
}
```

This prevents DNS rebinding attacks where a hostname initially resolves to a public IP but later resolves to a private IP.

#### 3) Credential Stripping

URLs containing credentials are rejected:

```typescript
if (parsed.username || parsed.password) {
  throw new Error('URLs with credentials are not allowed')
}
```

Prevents: `http://username:password@localhost/admin`

#### 4) Localhost Aliases

```typescript
if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
  throw new Error('Local addresses are not allowed')
}
```

Prevents: `http://localhost`, `http://app.localhost`

#### 5) Protocol Restriction

```typescript
if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
  throw new Error('Only http and https URLs are allowed')
}
```

Prevents: `file://`, `ftp://`, `gopher://`, etc.

---

## 2. API Endpoint

### POST /api/compliance/scan

**Request**:
```json
{
  "url": "https://example.com",
  "checkType": "security" | "privacy" | "accessibility" | "performance"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "url": "https://example.com/",
  "checks": [
    {
      "name": "SSL/TLS Certificate",
      "status": "pass",
      "message": "Valid SSL certificate"
    },
    {
      "name": "GDPR Cookie Consent",
      "status": "warning",
      "message": "No visible privacy policy"
    }
  ],
  "scannedAt": "2026-05-27T13:00:00Z"
}
```

**Response (SSRF Blocked)**:
```json
{
  "success": false,
  "error": "Private network addresses are not allowed"
}
```

**Response (Invalid URL)**:
```json
{
  "success": false,
  "error": "Invalid URL"
}
```

---

## 3. Usage Examples

### From Frontend

```typescript
// src/components/compliance-checker.tsx
const handleScan = async (url: string) => {
  try {
    const response = await fetch('/api/compliance/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, checkType: 'security' })
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('Scan results:', data.checks)
    } else {
      console.error('Scan failed:', data.error)
    }
  } catch (error) {
    console.error('Request failed:', error)
  }
}
```

### From Backend

```typescript
// Server action or API route
export async function scanWebsite(url: string) {
  const response = await fetch('http://localhost:3000/api/compliance/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, checkType: 'security' })
  })

  if (!response.ok) {
    throw new Error(`Scan failed: ${response.statusText}`)
  }

  return await response.json()
}
```

---

## 4. Compliance Checks

The analyzer runs multiple checks based on `checkType`:

### Security Checks
- SSL/TLS certificate validity
- Mixed content (HTTP resources on HTTPS page)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Vulnerable dependencies (checks package.json if available)
- CSP (Content Security Policy) presence

### Privacy Checks
- Privacy policy visibility
- Cookie consent banner
- GDPR/CCPA compliance signals
- Data retention policy
- Third-party tracking scripts

### Accessibility Checks
- WCAG 2.1 compliance (automated subset)
- Alt text for images
- Form labels
- Keyboard navigation
- Color contrast ratios

### Performance Checks
- Page load time
- Resource compression (gzip)
- Image optimization
- Caching headers
- Bundle size

---

## 5. Implementing New Checks

### Add a Security Check

```typescript
// src/lib/compliance-analyzer.ts

export async function analyze(html: string, checkType: string) {
  const results: ComplianceCheck[] = []

  if (checkType === 'security') {
    // Add your check
    results.push({
      name: 'Custom Security Check',
      status: checkResult ? 'pass' : 'fail',
      message: 'Description of finding'
    })
  }

  return results
}

// Example: Check for X-XSS-Protection header
const hasXssProtection = html.includes('X-XSS-Protection')

results.push({
  name: 'XSS Protection Header',
  status: hasXssProtection ? 'pass' : 'warning',
  message: hasXssProtection 
    ? 'X-XSS-Protection header present'
    : 'X-XSS-Protection header not found'
})
```

---

## 6. Runtime Configuration

### Edge Function Compatibility

**Status**: The compliance scan route uses **Node.js runtime**, not Edge.

```typescript
// src/app/api/compliance/scan/route.ts
export const dynamic = 'force-dynamic'
// NO `runtime = 'edge'` because:
// - dns.lookup() requires Node.js
// - Edge runtime (Cloudflare Workers, etc.) doesn't support dns module
```

If you need to migrate to Edge:
1. Replace `dns.lookup()` with external DNS API call
2. Use fetch-based HTTP client (already compatible)
3. Update runtime: `export const runtime = 'edge'`

### Environment Variables

No environment variables required for basic operation. Optional:

```bash
# Rate limiting (if added in future)
COMPLIANCE_SCAN_RATE_LIMIT=10  # per minute
COMPLIANCE_SCAN_TIMEOUT=30     # seconds
```

---

## 7. Testing

### Local Testing

```bash
# Valid public website
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","checkType":"security"}'

# Response:
# {"success":true,"url":"https://example.com/","checks":[...]}
```

### SSRF Testing (Should Block)

```bash
# Private IP address (should reject)
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.1","checkType":"security"}'

# Response:
# {"success":false,"error":"Private network addresses are not allowed"}

# Localhost (should reject)
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8000","checkType":"security"}'

# Response:
# {"success":false,"error":"Local addresses are not allowed"}

# Hostname that resolves to private IP (should reject)
curl -X POST http://localhost:3000/api/compliance/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://internal.company.com","checkType":"security"}'

# Response (if internal.company.com resolves to 10.0.0.1):
# {"success":false,"error":"Target resolves to a private network address"}
```

---

## 8. Performance Considerations

### Timeout

Each scan has a **30-second timeout** (serverless function constraint):

```typescript
const signal = AbortSignal.timeout(30000)
const response = await fetch(url, { signal })
```

For large sites, this may timeout. Solutions:
1. Implement lazy checks (run subset immediately, queue full scan)
2. Add user feedback: "Large site detected, scan may take 30+ seconds"
3. Cache results if same URL scanned recently

### DNS Lookup Performance

DNS lookups can add 100-500ms per hostname. Optimization:

```typescript
// Cache DNS results
const dnsCache = new Map<string, { family: number; address: string }[]>()

async function cachedDnsLookup(hostname: string) {
  if (dnsCache.has(hostname)) {
    return dnsCache.get(hostname)!
  }

  const records = await dns.lookup(hostname, { all: true })
  dnsCache.set(hostname, records)
  
  return records
}
```

---

## 9. Troubleshooting

### "Private network addresses are not allowed"

**Problem**: Legitimate public service is being blocked.

**Check**:
1. **Verify it's actually public**: `nslookup example.com`
2. **Check DNS resolution**: Ensure it doesn't resolve to 10.x, 172.16-31.x, 192.168.x
3. **Check CDN/proxy**: If behind CloudFlare, DNS may show different IPs

### "Fetch failed: 403"

**Problem**: Website is blocking the user agent.

**Solution**:
1. Update user agent string in `fetchHtml()`:
   ```typescript
   const res = await fetch(url, {
     headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
   })
   ```
2. Add referer header if needed
3. Implement retry with exponential backoff

### Scan Times Out

**Problem**: Large website scan times out at 30 seconds.

**Solution**:
1. Fetch only first 1MB of HTML (set Content-Length limit)
2. Async checks: Run non-blocking checks immediately, queue heavy checks
3. Inform user of timeout: Return partial results with `scannedAt` timestamp

---

## 10. Security Audit Checklist

- [ ] All private IP ranges tested (IPv4 and IPv6)
- [ ] DNS rebinding tested (hostname → private IP)
- [ ] Localhost aliases tested (`localhost`, `*.localhost`)
- [ ] Credential extraction tested (`http://user:pass@host`)
- [ ] Protocol restriction tested (file://, ftp://, etc.)
- [ ] Rate limiting in place (prevent abuse)
- [ ] User input validation (URL format, length)
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging for all scans
- [ ] Regular dependency updates (esp. fetch/dns libraries)

---

## 11. Related Documentation

- [SECURITY.md](SECURITY.md) — General security policy
- [ARCHITECTURE.md](ARCHITECTURE.md) — System overview
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) — API development
