# Rate Limiting System — SoloSuccess AI

Rate limiting protects the platform from abuse and ensures fair resource allocation across all users. This guide covers the rate limiting architecture, configuration, and implementation.

## 1. Overview

The rate limiting system uses a **time-window bucket algorithm** (sliding window with fixed intervals) to track request counts per user/IP and enforce limits across multiple dimensions:

- **Authentication endpoints** (sign-up, login, password reset)
- **API endpoints** (general rate limit)
- **Social media monitoring** (hourly caps per user)
- **Notification delivery** (daily caps per user)

## 2. Architecture

### 2.1 Request Flow

```
HTTP Request
    ↓
Rate Limit Check (middleware)
    ↓
├─ Allowed? → Continue to handler → Response
│
└─ Rate limited? → 429 Too Many Requests
                  → Retry-After header
```

### 2.2 Storage

Rate limiting uses **in-memory storage with global state** for request counts:

```typescript
// Per-bucket tracking (e.g., endpoint, IP)
type RateLimitEntry = { count: number; ts: number }
type RateLimitStore = Map<string, Map<string, RateLimitEntry>>

// Stored in globalThis[Symbol.for('solosuccess.rateLimitStore')]
```

**Why in-memory?**
- Fast, zero-latency enforcement
- No external dependencies (Redis optional for multi-instance)
- Sufficient for most use cases on Vercel's stateful functions

**For distributed deployments**, Redis integration is available via Upstash but not currently enabled.

### 2.3 IP Detection

The system extracts client IP from headers in order of preference:

```typescript
1. x-forwarded-for (most common - proxy chains)
2. x-real-ip (Nginx, Apache)
3. cf-connecting-ip (Cloudflare)
4. 127.0.0.1 (fallback for development)
```

This ensures accuracy even behind reverse proxies and CDNs.

## 3. Configuration

### 3.1 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Time window for auth endpoints |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | `5` | Max requests per window |
| `API_RATE_LIMIT_WINDOW_MS` | `60000` (1 min) | Time window for general API |
| `API_RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per minute |
| `SCRAPING_USER_HOURLY_CAP` | `20` | Max scraping jobs per user/hour |
| `NOTIF_DAILY_CAP` | `500` | Max notifications per day |

### 3.2 Per-Endpoint Limits

Configure in API route handlers:

```typescript
// Sign-up endpoint - strict limit
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const { allowed, remaining } = await checkRateLimit(request, {
    window: 900, // 15 minutes in seconds
    requests: 5
  })

  if (!allowed) {
    return new Response('Too many sign-up attempts', { status: 429 })
  }

  // Process sign-up...
}
```

## 4. API Reference

### `checkRateLimit(request, options)`

Check if a request is within rate limits.

**Parameters:**
- `request: Request` — HTTP request object (used to extract IP)
- `options: { window: number, requests: number }` — Time window in seconds and max requests

**Returns:**
```typescript
{
  allowed: boolean      // true if request should proceed
  remaining: number     // requests left in current window
  success?: boolean     // deprecated, use 'allowed'
}
```

**Example:**
```typescript
const { allowed, remaining } = await checkRateLimit(request, {
  window: 60,
  requests: 100
})

if (!allowed) {
  return new Response('Rate limit exceeded', {
    status: 429,
    headers: { 'Retry-After': '30' }
  })
}

// Log remaining for monitoring
console.log(`${remaining} requests remaining`)
```

### `clearRateLimitBucket(bucketName)`

Manually clear rate limit entries for a bucket (e.g., during tests or manual reset).

**Parameters:**
- `bucketName: string` — Bucket identifier (usually request URL)

**Example:**
```typescript
// Clear rate limits for testing
import { clearRateLimitBucket } from '@/lib/rate-limit'

clearRateLimitBucket('/api/auth/signup')
```

## 5. Implementation Guide

### 5.1 Adding Rate Limiting to an Endpoint

```typescript
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Step 1: Check rate limit
  const { allowed } = await checkRateLimit(request, {
    window: 60,        // 60 seconds
    requests: 50       // 50 requests max
  })

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '30' } }
    )
  }

  // Step 2: Process request
  // ...

  return Response.json({ success: true })
}
```

### 5.2 User-Specific Rate Limits

For limits tied to a specific user (e.g., scraping jobs, notifications):

```typescript
import { db } from '@/db/index'
import { scrapingJobs } from '@/shared/db/schema'
import { eq, and, gte } from 'drizzle-orm'

export async function checkUserJobCap(
  userId: string,
  cap: number,
  window: 'hourly' | 'daily'
): Promise<{ allowed: boolean, count: number }> {
  const now = new Date()
  const cutoff = new Date(
    window === 'hourly' ? now.getTime() - 3600000 : now.getTime() - 86400000
  )

  const jobs = await db.query.scrapingJobs.findMany({
    where: and(
      eq(scrapingJobs.userId, userId),
      gte(scrapingJobs.createdAt, cutoff)
    )
  })

  const count = jobs.length
  return { allowed: count < cap, count }
}
```

**Usage:**
```typescript
const { allowed, count } = await checkUserJobCap(userId, 20, 'hourly')

if (!allowed) {
  return Response.json(
    { error: `Hourly limit reached (20/hour). You've submitted ${count}. Try again in 1 hour.` },
    { status: 429 }
  )
}
```

## 6. Monitoring & Debugging

### 6.1 Log Rate Limit Events

```typescript
import { logInfo } from '@/lib/logger'

const { allowed, remaining } = await checkRateLimit(request, {
  window: 60,
  requests: 100
})

if (!allowed) {
  logInfo(`Rate limit exceeded for IP: ${getClientIP(request)}`)
}
```

### 6.2 Identify Rate-Limited IPs

If you see spikes in 429 responses:

1. Check logs for repeated `getClientIP()` patterns
2. Verify header extraction (proxy misconfiguration?)
3. Consider banning persistent abusers at CDN level (Cloudflare, Vercel)

### 6.3 Test Rate Limits Locally

```bash
# Simulate 10 requests in quick succession
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"..."}' \
    -H "X-Forwarded-For: 192.168.1.100"
  sleep 0.1
done

# Should see 429 after 5 requests (default auth limit)
```

## 7. Best Practices

### 7.1 Prevent Account Enumeration

Don't leak whether an email exists via rate limit behavior:

```typescript
// ❌ Bad: Different limits for valid vs invalid email
if (emailExists) {
  // Stricter limit
} else {
  // Looser limit
}

// ✅ Good: Same limit for all sign-up attempts
await checkRateLimit(request, { window: 900, requests: 5 })
// Rate limit equally regardless of email validity
```

### 7.2 Add Retry-After Headers

Always include `Retry-After` so clients know when to retry:

```typescript
if (!allowed) {
  return new Response('Rate limit exceeded', {
    status: 429,
    headers: {
      'Retry-After': '30', // seconds
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': remaining.toString()
    }
  })
}
```

### 7.3 Distinguish Abuse from Legitimate Traffic

Some patterns to watch for:

| Pattern | Likely Cause | Action |
|---------|--------------|--------|
| Many 429s from one IP | Brute force attack | Block at firewall |
| Distributed 429s (many IPs) | Botnet | Implement CAPTCHA |
| Legitimate app hammering one endpoint | Client misconfiguration | Contact user |
| Rate limit hits during load test | Expected | Adjust limits or increase capacity |

### 7.4 Scale Limits with Usage

If legitimate users hit limits, update environment variables:

```bash
# Increase API limit from 100 to 200 req/min
VERCEL_PROJECT_SETTINGS: API_RATE_LIMIT_MAX_REQUESTS=200
```

Redeploy without code changes via Vercel dashboard.

## 8. Troubleshooting

### Issue: Legitimate users getting 429 errors

**Cause:** Limits too strict for traffic pattern.

**Solution:**
1. Check `remaining` value in logs
2. Increase `API_RATE_LIMIT_MAX_REQUESTS` 
3. Or increase `API_RATE_LIMIT_WINDOW_MS` to give more time per request

### Issue: Sign-up spam not being blocked

**Cause:** Attackers using VPN/proxy IPs (different IP per request).

**Solution:**
1. Add CAPTCHA to sign-up form
2. Implement email verification before account activation
3. Block known VPN IP ranges (GeoIP database)

### Issue: Rate limits resetting unexpectedly

**Cause:** Server restart clears in-memory state.

**Solution:**
1. Expected behavior — in-memory limits don't survive restarts
2. For persistent limits across deployments, use Redis
3. Or increase limits/windows if false positives during deployments

### Issue: Rate limit not working on distributed endpoints

**Cause:** Each serverless function has separate memory — IP seen by different instances.

**Solution:**
1. Use Upstash Redis for shared state (currently disabled)
2. Or use API Gateway/WAF rules (Vercel, Cloudflare)
3. Current implementation suitable for single-instance deployments

## 9. Future Improvements

- [ ] Redis integration for distributed rate limiting
- [ ] Per-user UUID-based limits (vs IP-based)
- [ ] Adaptive limits based on historical traffic
- [ ] Dashboard to monitor rate limit metrics
- [ ] Automatic threshold tuning using ML

## 10. References

- **Time-Window Algorithm**: [Wikipedia](https://en.wikipedia.org/wiki/Token_bucket)
- **Rate Limiting Best Practices**: [OWASP](https://owasp.org/www-community/attacks/Brute_force_attack)
- **Vercel Limits**: https://vercel.com/docs/edge-network/usage-and-limits
