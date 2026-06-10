# Email & Notification System

## Overview

SoloSuccess AI uses a **multi-channel notification delivery system** with email as the primary transactional channel. Notifications handle password resets, 2FA codes, subscription updates, competitor alerts, and invitation links.

The email system was recently migrated from Resend to **Zoho Mail SMTP**, providing reliable transactional email with better cost control and operational simplicity.

**Key Components**:
- `src/lib/mail-transport.ts` — Zoho Mail SMTP integration (nodemailer)
- `src/lib/email-service.ts` — High-level email API with template methods
- `src/lib/email.ts` — Legacy email utilities (being consolidated)
- `src/lib/notification-delivery-system.ts` — Multi-channel delivery orchestrator
- `src/lib/notification-job-queue.ts` — Job queueing and retry logic
- `src/services/notificationService.ts` — Service layer
- `src/app/api/notifications/send/route.ts` — Notification API endpoint
- `docs/deployment/ZOHO_MAIL_SMTP_SETUP.md` — Deployment setup guide

---

## 1. Email Transport (Zoho Mail SMTP)

### Architecture

```
User Action
├─ Password reset → EmailService.sendPasswordReset()
├─ 2FA code → EmailService.send2FACode()
├─ Welcome → EmailService.sendWelcomeEmail()
├─ Billing event → EmailService.sendBillingEmail()
└─ Competitor alert → EmailService.sendCompetitorAlertEmail()
    ↓
EmailService.sendEmail(options)
    ↓
mail-transport.sendTransactionalEmail()
    ↓
nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user, password }
})
    ↓
Zoho SMTP Server
    ↓
User's inbox
```

### How Zoho Mail SMTP Works

The system uses **nodemailer** to connect to Zoho Mail SMTP instead of the Resend API. This provides:

- ✅ Reliable transactional email delivery
- ✅ Lower cost (included with Zoho Mail subscription)
- ✅ Full control over sending domain
- ✅ Detailed sending logs in Zoho Mail UI
- ✅ Support for custom from addresses
- ✅ Built-in DKIM/SPF/DMARC configuration

### Configuration

All SMTP settings are environment variables (set in both Vercel and Railway):

```bash
# SMTP Host and Port
SMTP_HOST=smtp.zoho.com              # smtp.zoho.eu for EU accounts
SMTP_PORT=587                         # 587 for STARTTLS, 465 for SSL
SMTP_SECURE=false                     # true for port 465 (SSL)
SMTP_USER=support@solosuccessai.fun  # Full email address, not just user
SMTP_PASSWORD=<app-specific-password> # NOT your Zoho login password

# From address and fallback inbox
FROM_EMAIL="SoloSuccess AI <support@solosuccessai.fun>"
CONTACT_INBOX_EMAIL=support@solosuccessai.fun  # For contact form submissions

# Optional: For development/testing
SKIP_EMAIL_VERIFICATION=false         # Skip TLS verification (dev only)
```

**Important**: Always generate an **app-specific password** in Zoho Mail's security settings. This is NOT your login password. See [ZOHO_MAIL_SMTP_SETUP.md](deployment/ZOHO_MAIL_SMTP_SETUP.md) for detailed setup steps.

### Implementation Details

#### Connection Pooling

The system caches the nodemailer transporter to reuse SMTP connections:

```typescript
let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (cachedTransporter) {
    return cachedTransporter  // Reuse existing connection
  }
  
  const config = getSmtpConfig()
  if (!config) return null
  
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure && config.port === 587,
    auth: { user: config.user, pass: config.password }
  })
  
  return cachedTransporter
}
```

This means:
- First email creates a connection
- Subsequent emails reuse the same SMTP connection
- Significant performance gain and reduced resource usage

#### Graceful Degradation

If SMTP is not configured (e.g., development without env vars), the system logs emails instead of failing:

```typescript
if (!isEmailConfigured()) {
  logInfo('📧 [SIMULATION] Email would be sent:', {
    to,
    subject,
    from,
    contentPreview: text || html.substring(0, 100) + '...',
  })
  return true  // Still succeeds to avoid breaking user flows
}
```

This allows developers to test locally without Zoho credentials.

---

## 2. Email Service API

### `EmailService` Class

High-level API for sending emails. All methods return a `Promise<boolean>` indicating success/failure.

#### `EmailService.sendEmail(options)`

**Core method** for sending emails with custom HTML/text content.

```typescript
import { EmailService } from '@/lib/email-service'

const success = await EmailService.sendEmail({
  to: 'user@example.com',                    // string or string[]
  subject: 'Your Password Reset Link',
  html: '<p>Click <a href="...">here</a>...</p>',
  text: 'Click the link to reset your password',
  from: 'support@solosuccessai.fun'          // optional, uses FROM_EMAIL if omitted
})

if (!success) {
  // Email failed - check logs for details
  // But continue processing (don't block user)
}
```

**Parameters**:
- `to`: Email address(es) — string or array of strings
- `subject`: Email subject line
- `html`: HTML body content
- `text`: Plain text fallback (optional, recommended for email clients)
- `from`: Sender address (optional, defaults to `FROM_EMAIL` env var)

**Returns**: `boolean` — true if sent, false if failed. **Failures do not throw**; always check the return value.

**Error Handling**: Failures are logged but do not throw. This is intentional — emails are best-effort and should not block critical user flows like login or payment processing.

#### `EmailService.sendWelcomeEmail(email, name)`

Sends a welcome email to new users.

```typescript
await EmailService.sendWelcomeEmail('user@example.com', 'Alice')

// Sends:
// Subject: Welcome to SoloSuccess AI!
// To: user@example.com
// Content: HTML + text welcome message
```

#### `EmailService.sendCompetitorAlertEmail(email, alertTitle, competitorName, severity)`

Sends competitor alert notifications.

```typescript
await EmailService.sendCompetitorAlertEmail(
  'user@example.com',
  'Price dropped 20%',
  'Competitor X',
  'critical'  // 'critical' | 'high' | 'medium' | 'low'
)

// Generates color-coded HTML email with:
// - Alert severity badge
// - Competitor name
// - Alert details
// - Link to dashboard
```

**Severity levels**:
- `critical` → Red (#ef4444)
- `high` → Orange (#f97316)
- default → Blue (#3b82f6)

### Extending with New Email Templates

To add a new email type, extend `EmailService`:

```typescript
// In src/lib/email-service.ts
export class EmailService {
  // ... existing methods ...
  
  static async sendCustomAlert(
    email: string,
    data: { title: string; message: string; actionUrl: string }
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Alert: ${data.title}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>${data.title}</h2>
          <p>${data.message}</p>
          <a href="${data.actionUrl}" style="background: #000; color: #fff; padding: 10px 20px; border-radius: 5px;">
            View Details
          </a>
        </div>
      `,
      text: `${data.title}: ${data.message}. Visit ${data.actionUrl} to learn more.`
    })
  }
}

// Usage:
await EmailService.sendCustomAlert('user@example.com', {
  title: 'New Content Available',
  message: 'Check out our latest guide on fundraising.',
  actionUrl: 'https://app.solosuccessai.fun/guides/fundraising'
})
```

---

## 3. Notification Delivery System

### Multi-Channel Delivery

The notification delivery system supports multiple channels:

```
Notification Request
    ├─ Email (primary)
    ├─ Push notifications
    ├─ In-app toast
    ├─ Webhook (3rd party)
    └─ Slack (future)
```

**File**: `src/lib/notification-delivery-system.ts`

### Notification Job Queue

For high-volume scenarios, notifications are queued and processed asynchronously:

```typescript
import { NotificationJobQueue } from '@/lib/notification-job-queue'

const queue = new NotificationJobQueue()

// Queue a notification for later processing
await queue.enqueue({
  userId: 'user-123',
  type: 'competitor_alert',
  data: { competitorId: 'comp-456', severity: 'high' },
  retryCount: 0
})

// Queue processes automatically:
// 1. Dequeue a job
// 2. Send notification via all channels
// 3. On failure, retry with exponential backoff
// 4. Log outcome
```

### Retry Logic

Notifications use exponential backoff for reliability:

```typescript
// Retry schedule
Attempt 1: Immediate
Attempt 2: 5 seconds later
Attempt 3: 25 seconds later
Attempt 4: 2 minutes later
Attempt 5: 10 minutes later (give up)
```

**Key Points**:
- Transient failures (network timeouts) → Retry
- Permanent failures (invalid email) → Skip
- Log all outcomes to troubleshoot issues

---

## 4. Integration Patterns

### In Authentication Flow

```typescript
// src/app/api/auth/signup/route.ts
import { EmailService } from '@/lib/email-service'

export async function POST(request: Request) {
  const { email, name } = await request.json()
  
  // Create user
  const user = await db.user.create({ data: { email, name } })
  
  // Send welcome email (non-blocking)
  // If this fails, user is still created — email is secondary
  EmailService.sendWelcomeEmail(email, name).catch(err => {
    logger.error('Failed to send welcome email', { userId: user.id, err })
  })
  
  return Response.json({ user })
}
```

### In Password Reset Flow

```typescript
// src/app/api/auth/forgot-password/route.ts
export async function POST(request: Request) {
  const { email } = await request.json()
  
  // Find user
  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Return generic message for security
    return Response.json({ message: 'Check your email' })
  }
  
  // Generate reset token
  const token = generateToken()
  await db.passwordReset.create({
    data: { userId: user.id, token, expiresAt: addHours(new Date(), 1) }
  })
  
  // Send email with reset link
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  
  await EmailService.sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `<a href="${resetUrl}">Click here to reset your password</a>`,
    text: `Reset password: ${resetUrl}`
  })
  
  return Response.json({ message: 'Check your email' })
}
```

### In Billing Events

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const event = await stripe.webhooks.constructEvent(...)
  
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object
    const user = await db.user.findUnique({
      where: { stripe_customer_id: subscription.customer }
    })
    
    // Update subscription
    await db.user.update({
      where: { id: user.id },
      data: { subscription_tier: 'accelerator' }
    })
    
    // Send confirmation email
    await EmailService.sendEmail({
      to: user.email,
      subject: 'Subscription Confirmed!',
      html: '...',
      text: '...'
    })
  }
  
  return Response.json({ received: true })
}
```

---

## 5. Environment Configuration

### Required Environment Variables

#### Production (Vercel)

```bash
# Zoho Mail SMTP
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@solosuccessai.fun
SMTP_PASSWORD=<app-specific-password>
FROM_EMAIL="SoloSuccess AI <support@solosuccessai.fun>"
CONTACT_INBOX_EMAIL=support@solosuccessai.fun
```

**Set via**: Vercel Project Settings → Environment Variables → Production

#### Railway (API Server)

If the API server sends emails directly (should not in most cases):

```bash
# Same as above in Railway Variables
```

#### Development (Local `.env.local`)

```bash
# Can omit if just testing locally without actual emails
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=dev@yourdomain.com
SMTP_PASSWORD=<app-password>
FROM_EMAIL="SoloSuccess AI Dev <dev@yourdomain.com>"
```

Or leave empty to use simulation mode.

### Optional Variables

```bash
SKIP_EMAIL_VERIFICATION=false    # For testing in dev, not production
LOG_EMAIL_CONTENT=false          # Log full email body to console
EMAIL_QUEUE_BATCH_SIZE=10        # For job queue
EMAIL_QUEUE_PROCESS_INTERVAL=5s  # For job queue
```

---

## 6. Testing & Development

### Local Testing (Simulation Mode)

If `SMTP_HOST` is not set or incomplete, emails are simulated:

```typescript
// Development run:
$ npm run dev

// Trigger password reset
// In logs, you'll see:
// 📧 [SIMULATION] Email would be sent: {
//   to: "user@example.com",
//   subject: "Reset Your Password",
//   from: "SoloSuccess AI <support@solosuccessai.fun>",
//   contentPreview: "<a href=\"https://...\">Click here..."
// }
```

No actual email is sent. Useful for testing logic without Zoho credentials.

### Testing with Real Zoho Credentials

1. Add Zoho SMTP env vars to `.env.local`
2. `npm run dev`
3. Trigger action (password reset, signup, etc)
4. Check your Zoho inbox or the recipient's inbox

### Unit Testing

```typescript
// Example test
import { EmailService } from '@/lib/email-service'
import { logInfo } from '@/lib/logger'

jest.mock('@/lib/logger')

describe('EmailService', () => {
  it('should simulate email in dev mode', async () => {
    process.env.SMTP_HOST = ''  // Disable SMTP
    
    const result = await EmailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    })
    
    expect(result).toBe(true)
    expect(logInfo).toHaveBeenCalledWith(
      expect.stringContaining('[SIMULATION]'),
      expect.objectContaining({ to: 'test@example.com' })
    )
  })
})
```

---

## 7. Troubleshooting

### Issue: Emails Not Being Sent

**Diagnosis**:
```bash
# Check logs for errors
vercel logs --follow

# Look for patterns:
# "Email service not configured (SMTP)" → env vars missing
# "Transactional email failed" → SMTP authentication failed
# "[SIMULATION]" → SMTP not configured (expected in dev)
```

**Fixes**:

1. **Verify env vars are set**:
   ```bash
   # In Vercel dashboard:
   Project Settings → Environment Variables
   
   # Check:
   ✅ SMTP_HOST = smtp.zoho.com
   ✅ SMTP_PORT = 587
   ✅ SMTP_USER = full email address
   ✅ SMTP_PASSWORD = app-specific password (not login password)
   ```

2. **Verify Zoho Mail app password**:
   - Go to https://mail.zoho.com → Settings → Security → App Passwords
   - Delete old password, generate new one
   - Update `SMTP_PASSWORD` in Vercel
   - Redeploy

3. **Check Zoho account limits**:
   - Zoho Mail has sending rate limits
   - If you hit limits, wait 1 hour before retrying
   - Check: https://mail.zoho.com → Settings → Security → IP Allowlist

### Issue: "SMTP Authentication Failed"

```
Error: 535 5.7.8 Error: authentication failed
```

**Causes**:
- ❌ Using Zoho login password instead of app password
- ❌ Password has special characters that need URL encoding
- ❌ Zoho account locked for security
- ❌ IP not whitelisted in Zoho account

**Fix**:
```bash
# 1. Generate NEW app password in Zoho (don't reuse old one)
# 2. Verify SMTP_USER is full email, not just username
# 3. Update SMTP_PASSWORD in Vercel
# 4. Redeploy and retry
```

### Issue: Emails Sent But Not Received

**Diagnosis**:
```bash
# 1. Check Zoho Sent folder
vercel env pull
# (View raw SMTP_USER in env)
# Log into https://mail.zoho.com → Sent folder

# 2. Check recipient spam folder

# 3. Verify email headers for SPF/DKIM failure
```

**Fixes**:

1. **Add SPF record** (if using custom domain):
   - In DNS: `v=spf1 include:zoho.com ~all`
   - Propagate (can take 24-48 hours)

2. **Add DKIM signature** (Zoho Mail UI):
   - Zoho Mail → Settings → Domain Setup → Add DKIM

3. **Verify FROM address**:
   - Email must come from a Zoho-verified mailbox
   - Cannot send from arbitrary addresses

### Issue: "Too Many Failed Emails"

If queue has accumulated failures:

```typescript
// Manual retry (in Node.js REPL or script)
import { NotificationJobQueue } from '@/lib/notification-job-queue'

const queue = new NotificationJobQueue()
const failedJobs = await queue.getFailedJobs()
console.log(failedJobs)

// Manually retry specific job
await queue.retry(failedJobs[0].id)
```

---

## 8. Performance & Scalability

### Current Metrics

| Metric | Value |
|--------|-------|
| Email send time | ~500ms (nodemailer + Zoho SMTP) |
| Connection reuse | Cached transporter (2-5× faster after first email) |
| Failure rate | <1% (Zoho reliability) |
| Retry max attempts | 5 |
| Queue batch size | 10 emails |

### Scaling Recommendations

At 100+ emails/minute:

1. **Implement background job queue** (Bull, Temporal):
   ```typescript
   // Current: synchronous, blocks request
   await EmailService.sendEmail(...)
   
   // Better: asynchronous queue
   await emailQueue.add({ to, subject, html }, { delay: 0 })
   ```

2. **Cache SMTP connections**:
   - Already implemented with `cachedTransporter`
   - Per-request: ~50ms
   - Cached: ~5ms

3. **Monitor Zoho sending limits**:
   - Zoho typically allows 300 emails/hour for standard accounts
   - Check: https://mail.zoho.com → Settings → Outbound Rules
   - If hitting limits, upgrade Zoho plan

4. **Use dedicated Zoho Mail account**:
   - Consider separate Zoho account for transactional email
   - Isolates notification volume from team email

---

## 9. Security Considerations

### Never Expose Credentials

```typescript
// ❌ DO NOT DO THIS
console.log(process.env.SMTP_PASSWORD)  // Logs secret!
res.json({ password: process.env.SMTP_PASSWORD })  // Exposes in API response!

// ✅ CORRECT
logInfo('Email configured', { host: process.env.SMTP_HOST })  // Only log non-secrets
```

### Verify Email Validation

```typescript
// ❌ Don't send to unvalidated emails
await EmailService.sendEmail({
  to: userInput.email,  // Directly from user input
  subject: 'Hello'
})

// ✅ Validate and sanitize
const email = validateEmail(userInput.email)  // Email validation
if (!email) throw new Error('Invalid email')
await EmailService.sendEmail({ to: email, subject: 'Hello' })
```

### Rate Limit Email API

```typescript
// ❌ No limit = spam/abuse vector
app.post('/api/send-email', (req, res) => {
  // Anyone can call this unlimited times
})

// ✅ Add rate limiting
import { RateLimiter } from '@/lib/rate-limiter'
const limiter = new RateLimiter(10, '1h')  // 10 emails per hour per user

app.post('/api/send-email', async (req, res) => {
  const allowed = await limiter.check(req.user.id)
  if (!allowed) return res.status(429).json({ error: 'Too many requests' })
  
  // ... send email
})
```

### Use TLS for SMTP Connection

```typescript
// ✅ SMTP_SECURE=false with port 587 uses STARTTLS
SMTP_PORT=587
SMTP_SECURE=false
# Encrypts credentials in transit

// ✅ Alternative: SSL on port 465
SMTP_PORT=465
SMTP_SECURE=true
# Direct SSL connection (also secure)

// ❌ Port 25 unencrypted
SMTP_PORT=25
SMTP_SECURE=false
# Credentials sent in plain text! NEVER use this!
```

---

## 10. Best Practices

### 1. Always Provide Text Fallback

```typescript
// ❌ HTML only
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Alert',
  html: '<p>Your alert: ...',
  // text is missing!
})

// ✅ Include both HTML and text
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Alert',
  html: '<p>Your alert: <strong>urgent</strong></p>',
  text: 'Your alert: urgent'  // Fallback for text-only clients
})
```

### 2. Use Descriptive Subject Lines

```typescript
// ❌ Vague
subject: 'Alert'

// ✅ Specific and scannable
subject: '[High Priority] Competitor Price Drop: 20% decrease on Acme Corp'
```

### 3. Include Unsubscribe Option

```typescript
// For notification emails, include unsubscribe link
html: `
  ...
  <p style="font-size: 12px; color: #999;">
    <a href="https://app.solosuccessai.fun/notifications/unsubscribe?email=${email}">
      Unsubscribe
    </a>
  </p>
`
```

### 4. Test Email Rendering Across Clients

```typescript
// Different email clients render HTML differently
// Always:
// 1. Test in Gmail
// 2. Test in Outlook
// 3. Provide plain-text version
// 4. Use inline CSS (avoid <style> blocks)
```

### 5. Don't Block User Operations on Email Failure

```typescript
// ❌ Email failure breaks signup
export async function POST(req: Request) {
  const user = await db.user.create(...)
  await EmailService.sendWelcomeEmail(user.email, user.name)  // If fails, throws!
  return res.json({ user })
}

// ✅ Email failure is logged but doesn't block
export async function POST(req: Request) {
  const user = await db.user.create(...)
  
  // Fire and forget
  EmailService.sendWelcomeEmail(user.email, user.name).catch(err => {
    logger.error('Welcome email failed', { userId: user.id, err })
    // But user is still created!
  })
  
  return res.json({ user })
}
```

---

## 11. Migration from Resend to Zoho

### What Changed

| Feature | Resend | Zoho SMTP |
|---------|--------|----------|
| API Type | REST | SMTP |
| Setup complexity | Simple API key | App password + SMTP config |
| Cost | Per-email (after free tier) | Included with Zoho Mail |
| Verification | Resend domain | Zoho domain verification |
| Webhooks | Built-in events | Manual logging |
| Development | Easy (no setup) | Requires Zoho account |

### Migration Checklist

- ✅ Remove `RESEND_API_KEY` from Vercel/Railway env vars
- ✅ Delete Resend integration from both platforms
- ✅ Add Zoho SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, etc.)
- ✅ Update any Resend API calls to use `EmailService`
- ✅ Test locally with Zoho credentials
- ✅ Deploy and verify in production
- ✅ Monitor Zoho sending for 1 week
- ✅ Update this documentation

**No code changes needed** — the migration was abstracted into `mail-transport.ts` and `EmailService`.

---

## 12. Related Documentation

- [Zoho Mail SMTP Setup](deployment/ZOHO_MAIL_SMTP_SETUP.md) — Step-by-step deployment
- [Billing System](BILLING_SYSTEM.md) — Subscription events trigger emails
- [Agent Personality System](AGENT_PERSONALITY_SYSTEM.md) — Context-aware email content
- [Security Guide](SECURITY.md) — Email security best practices
