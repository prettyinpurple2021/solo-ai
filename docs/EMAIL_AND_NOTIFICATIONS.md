# Email & Notification System

## Overview

SoloSuccess AI uses a **multi-channel notification delivery system** with email as the primary transactional channel. Notifications handle password resets, 2FA codes, subscription updates, competitor alerts, and invitation links.

**Key Components**:
- `src/lib/mail-transport.ts` — Zoho Mail SMTP integration (nodemailer)
- `src/lib/email-service.ts` — High-level email API
- `src/lib/notification-delivery-system.ts` — Multi-channel delivery (email, Slack, webhooks, in-app)
- `src/app/api/alerts/notifications/route.ts` — Notification API endpoint
- `docs/deployment/ZOHO_MAIL_SMTP_SETUP.md` — Deployment guide

---

## 1. Email Transport (Zoho Mail SMTP)

### How It Works

The system uses **nodemailer** with Zoho Mail SMTP instead of Resend. This provides reliable transactional email with lower operational overhead.

```
User Action (password reset, 2FA, etc)
    ↓
EmailService.sendEmail()
    ↓
mail-transport.sendTransactionalEmail()
    ↓
nodemailer via Zoho SMTP
    ↓
User's inbox
```

### Configuration

All SMTP settings are environment variables:

```bash
SMTP_HOST=smtp.zoho.com          # (or smtp.zoho.eu for EU)
SMTP_PORT=587                     # 587 for TLS, 465 for SSL
SMTP_SECURE=false                 # true for port 465 (SSL)
SMTP_USER=support@yourdomain.com  # Zoho mailbox
SMTP_PASSWORD=<app-password>      # App-specific password (not login password)
FROM_EMAIL="SoloSuccess AI <support@yourdomain.com>"
CONTACT_INBOX_EMAIL=support@yourdomain.com  # Fallback for contact form
```

See [ZOHO_MAIL_SMTP_SETUP.md](deployment/ZOHO_MAIL_SMTP_SETUP.md) for detailed setup.

### Sending Emails

**Direct usage** (rarely needed):

```typescript
import { EmailService } from '@/lib/email-service'

await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Your Password Reset Code',
  html: '<p>Click <a href="...">here</a> to reset your password</p>',
  text: 'Click the link to reset your password',
  from: 'support@solosuccessai.fun' // optional
})
```

**Graceful fallback**: If SMTP is not configured (e.g., development), the system logs the email instead of failing:

```
📧 [SIMULATION] Email would be sent: {
  to: "user@example.com",
  subject: "Your Password Reset Code",
  from: "support@solosuccessai.fun",
  contentPreview: "<p>Click <a href="...">here</a> to reset..."
}
```

### Error Handling

Transactional emails are **best-effort** — they do not block user operations. If email fails:

1. Error is logged to the project logger (structured)
2. User is informed via API response (e.g., 200 OK with `emailSent: false`)
3. Retry mechanism: None built-in (relies on manual retry or alternative contact)

**Example** (forgot-password endpoint):

```typescript
// src/app/api/auth/forgot-password/route.ts
const emailSent = await EmailService.sendEmail({
  to: user.email,
  subject: 'Password Reset Code',
  html: resetTemplate
})

return Response.json({
  success: true,
  emailSent, // true if sent, false if failed
  message: 'Password reset code sent' // works even if email failed
})
```

---

## 2. Notification Delivery System

### Overview

The **NotificationDeliverySystem** (singleton) routes alerts and notifications to multiple channels:

- **Email** (Zoho SMTP)
- **Slack** (webhook or OAuth)
- **Discord** (webhook)
- **In-app** (database records)
- **Webhooks** (custom)

Supports:
- **Immediate delivery** for critical alerts
- **Batched delivery** for lower-severity alerts (configurable intervals)
- **Quiet hours** (timezone-aware, respects user preferences)
- **Severity and type filtering** per channel

### Architecture

```typescript
// User's notification preferences (stored in DB)
interface NotificationPreferences {
  userId: string
  channels: NotificationChannel[] // email, slack, discord, webhook, in_app
  quietHours: {
    enabled: boolean
    start: '09:00' // HH:MM format
    end: '17:00'
    timezone: 'America/New_York'
  }
  frequency: {
    immediate: ['critical', 'high'] // deliver immediately
    batched: ['medium', 'low']       // batch and send hourly
    batchInterval: 60 // minutes
  }
}

// Trigger an alert
const alert: CompetitorAlert = {
  id: 'alert-123',
  severity: 'high',
  alert_type: 'price_change',
  title: 'Competitor Price Drop Detected',
  description: 'Acme Corp dropped prices 15%...'
}

// System delivers based on user's preferences
await NotificationDeliverySystem.getInstance().deliverNotification(alert, userPrefs)
```

### Quiet Hours (Timezone-Aware)

Users can configure a time window where non-critical alerts are queued:

```typescript
quietHours: {
  enabled: true,
  start: '22:00',     // 10 PM
  end: '08:00',       // 8 AM
  timezone: 'America/New_York'
}
```

- **Critical** alerts bypass quiet hours
- **Lower severity** alerts are batched and delivered after quiet hours end

### Channel Routing

Each channel can have **severity and type filters**:

```typescript
// Example: Slack channel only for high/critical price changes
const slackChannel: NotificationChannel = {
  id: 'slack-channel-1',
  name: 'Price Alerts to #alerts',
  type: 'slack',
  enabled: true,
  config: {
    webhookUrl: 'https://hooks.slack.com/services/...'
  },
  severityFilter: ['high', 'critical'], // Only these severities
  typeFilter: ['price_change'] // Only these alert types
}

// Example: Email gets everything
const emailChannel: NotificationChannel = {
  id: 'email-1',
  name: 'All notifications to email',
  type: 'email',
  enabled: true,
  config: { to: 'user@example.com' },
  severityFilter: [], // Empty = all severities
  typeFilter: []      // Empty = all types
}
```

### Batch Processing

Lower-severity alerts are batched:

```typescript
frequency: {
  immediate: ['critical', 'high'],
  batched: ['medium', 'low'],
  batchInterval: 60 // Send batch every 60 minutes
}
```

If a user has 10 "low" severity alerts in an hour, they receive **one email** with all 10, not 10 separate emails.

### Usage Example

```typescript
import { NotificationDeliverySystem } from '@/lib/notification-delivery-system'

const system = NotificationDeliverySystem.getInstance()

const results = await system.deliverNotification(alert, userPreferences)

// results[0] = { 
//   channelId: 'email-1',
//   success: true,
//   messageId: '...',
//   deliveredAt: Date
// }
```

---

## 3. Common Workflows

### Sending a Password Reset Email

```typescript
// src/app/api/auth/forgot-password/route.ts

import { EmailService } from '@/lib/email-service'

export async function POST(request: Request) {
  const { email } = await request.json()
  
  // Generate reset token and save
  const resetToken = crypto.randomUUID()
  await db.insert(passwordResets).values({
    email,
    token: resetToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
  })
  
  // Send email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset?token=${resetToken}`
  const sent = await EmailService.sendEmail({
    to: email,
    subject: 'Reset Your SoloSuccess AI Password',
    html: `
      <p>Click the link below to reset your password.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
    text: `Reset your password: ${resetUrl}`
  })
  
  return Response.json({
    success: true,
    emailSent: sent,
    message: 'Password reset email sent (check spam if not received)'
  })
}
```

### Setting Up Competitor Alert Notifications

```typescript
// User configures notification preferences in settings
const preferences: NotificationPreferences = {
  userId: 'user-123',
  channels: [
    {
      id: 'email-alerts',
      name: 'Email',
      type: 'email',
      enabled: true,
      config: { to: 'user@example.com' },
      severityFilter: ['critical', 'high'],
      typeFilter: [] // All alert types
    },
    {
      id: 'slack-critical',
      name: 'Slack #critical',
      type: 'slack',
      enabled: true,
      config: { webhookUrl: process.env.SLACK_WEBHOOK_CRITICAL },
      severityFilter: ['critical'],
      typeFilter: ['price_change', 'market_entry']
    }
  ],
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
    timezone: 'America/New_York'
  },
  frequency: {
    immediate: ['critical'],
    batched: ['high', 'medium', 'low'],
    batchInterval: 60
  }
}

// When a price drop is detected:
const alert: CompetitorAlert = {
  severity: 'high',
  alert_type: 'price_change',
  title: 'Competitor Price Drop',
  description: '...'
}

const system = NotificationDeliverySystem.getInstance()
await system.deliverNotification(alert, preferences)
```

---

## 4. Troubleshooting

### Email Not Sent

**Check**:

1. **Is SMTP configured?**
   ```bash
   # In logs, should NOT see "[SIMULATION]"
   grep "SIMULATION" logs.txt
   ```

2. **Are environment variables set in production?**
   - Vercel: Project Settings → Environment Variables
   - Railway: Variables tab
   - Check that `SMTP_PASSWORD` is the **app-specific password**, not your login password

3. **Is the recipient email valid?**
   - Check for typos
   - Verify spam folder

4. **Check Zoho Sent folder:**
   - Log into Zoho Mail
   - Verify the email appears in **Sent** (means it left our server)
   - If not in Sent, check the error in project logs

5. **Check project logs:**
   ```
   logError('Failed to send email:', result.error)
   ```
   Look for this message and the error details.

### Notifications Not Batched

**Check**:

1. **Is batch interval set correctly?**
   ```typescript
   frequency: {
     immediate: ['critical'],
     batched: ['high', 'medium', 'low'],
     batchInterval: 60 // minutes
   }
   ```

2. **Are alerts marked as low-severity?**
   Only `immediate` severities bypass batching.

3. **Are quiet hours active?**
   Non-critical alerts queue during quiet hours. Check user's timezone.

### Slack/Discord Webhook Failing

1. **Verify webhook URL:**
   ```bash
   curl -X POST https://hooks.slack.com/... \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test"}'
   ```

2. **Check channel permissions:**
   - Ensure the bot has `chat:write` permission
   - Ensure the channel exists and bot can post

---

## 5. Adding a New Notification Channel

To add a new channel (e.g., Telegram):

1. **Update NotificationChannel type:**
   ```typescript
   // src/lib/notification-delivery-system.ts
   export interface NotificationChannel {
     type: 'email' | 'slack' | 'discord' | 'webhook' | 'telegram' | 'in_app'
     config: Record<string, any> // Telegram: { botToken, chatId }
   }
   ```

2. **Implement channel delivery:**
   ```typescript
   private async deliverToChannel(alert, channel) {
     if (channel.type === 'telegram') {
       return await this.deliverToTelegram(alert, channel)
     }
     // ... other channels
   }

   private async deliverToTelegram(alert, channel) {
     const { botToken, chatId } = channel.config
     const message = `${alert.title}\n${alert.description}`
     
     const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ chat_id: chatId, text: message })
     })
     
     if (!response.ok) {
       return {
         channelId: channel.id,
         success: false,
         error: `Telegram API error: ${response.statusText}`,
         deliveredAt: new Date()
       }
     }
     
     return {
       channelId: channel.id,
       success: true,
       messageId: (await response.json()).result.message_id,
       deliveredAt: new Date()
     }
   }
   ```

3. **Update UI** to let users configure the new channel.

---

## 6. Environment Checklist

### Development

```bash
# .env.local or .env.development.local
# Leave empty or use test values (email will simulate)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=
```

### Staging / Preview

```bash
# Vercel Preview Deployment
# Set SMTP_* vars in "Preview" environment
SMTP_HOST=smtp.zoho.com
SMTP_USER=<staging-email>
SMTP_PASSWORD=<app-specific-password>
FROM_EMAIL="SoloSuccess (Staging) <staging-email>"
```

### Production

```bash
# Vercel Production
SMTP_HOST=smtp.zoho.com
SMTP_USER=support@solosuccessai.fun
SMTP_PASSWORD=<app-specific-password>
FROM_EMAIL="SoloSuccess AI <support@solosuccessai.fun>"
CONTACT_INBOX_EMAIL=support@solosuccessai.fun
```

---

## 7. Code References

- **Email sending**: `src/lib/email-service.ts` (120 lines)
- **SMTP transport**: `src/lib/mail-transport.ts` (95 lines)
- **Notification system**: `src/lib/notification-delivery-system.ts` (660 lines)
- **Alerts API**: `src/app/api/alerts/notifications/route.ts`
- **Password reset**: `src/app/api/auth/forgot-password/route.ts`
- **Contact form**: `src/app/api/contact/route.ts`

---

## 8. Related Documentation

- [ZOHO_MAIL_SMTP_SETUP.md](deployment/ZOHO_MAIL_SMTP_SETUP.md) — Setup guide for Zoho credentials
- [BILLING_SYSTEM.md](BILLING_SYSTEM.md) — Subscription email templates
- [ARCHITECTURE.md](ARCHITECTURE.md) — System overview
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) — Local development setup
