# Notification Delivery System — SoloSuccess AI

The notification delivery system handles multi-channel notification delivery (email, push, in-app) with intelligent batching, quiet hours, and user preferences. This guide covers architecture, configuration, and integration.

## 1. Overview

The system intelligently delivers notifications to users across multiple channels while respecting user preferences and timezone-aware quiet hours.

### 1.1 Features

- **Multi-channel delivery** (email, push, in-app, webhook)
- **User preferences** (channel selection, severity filtering)
- **Smart batching** (combine urgent alerts, queue others)
- **Timezone-aware quiet hours** (don't wake users at night)
- **Frequency control** (immediate vs batched delivery)
- **Delivery tracking** (success/failure metrics)

### 1.2 Supported Channels

| Channel | Type | Use Case |
|---------|------|----------|
| Email | Async, tracked | Critical alerts, summaries |
| Push | Real-time | High-priority, time-sensitive |
| In-App | Real-time | Notifications, updates |
| Webhook | Async | Integration with external systems |
| Slack/Discord | Optional | Team notifications |

## 2. Architecture

### 2.1 Delivery Pipeline

```
Notification Triggered
    ↓
Load User Preferences
    ↓
Check Quiet Hours → Skip if enabled
    ↓
Determine Delivery Mode
    ├─ Immediate: Send now
    └─ Batched: Queue for batch
    ↓
Select Channels (user preference)
    ↓
Deliver to Each Channel
    ↓
Track Results
    ├─ Success → Log
    └─ Failure → Retry or Fallback
```

### 2.2 Data Model

```typescript
interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'push' | 'slack' | 'discord' | 'webhook' | 'in_app'
  enabled: boolean
  config: Record<string, any>  // Channel-specific settings
  severityFilter: AlertSeverity[]  // Only deliver these severities
  typeFilter: AlertType[]  // Only deliver these types
}

interface NotificationPreferences {
  userId: string
  channels: NotificationChannel[]
  quietHours: {
    enabled: boolean
    start: string        // HH:MM format (24-hour)
    end: string          // HH:MM format
    timezone: string     // e.g., "America/New_York"
  }
  frequency: {
    immediate: AlertSeverity[]  // Send immediately (critical, high)
    batched: AlertSeverity[]    // Batch and send (medium, low)
    batchInterval: number       // Minutes (30, 60, 120)
  }
}

interface NotificationDeliveryResult {
  channelId: string
  success: boolean
  messageId?: string
  error?: string
  deliveredAt: Date
}
```

## 3. Configuration

### 3.1 User Preferences API

#### Create Default Preferences

```typescript
import { db } from '@/db/index'
import { notificationPreferences } from '@/shared/db/schema'

// Called during user signup
await db.insert(notificationPreferences).values({
  userId: newUser.id,
  channels: [
    {
      id: 'email_ch',
      name: 'Email',
      type: 'email',
      enabled: true,
      config: { address: user.email },
      severityFilter: ['critical', 'high'],
      typeFilter: []  // All types
    },
    {
      id: 'push_ch',
      name: 'Web Push',
      type: 'push',
      enabled: false,
      config: {},
      severityFilter: ['critical'],
      typeFilter: []
    }
  ],
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  },
  frequency: {
    immediate: ['critical'],
    batched: ['high', 'medium', 'low'],
    batchInterval: 60
  }
})
```

#### Load User Preferences

```typescript
import { NotificationDeliverySystem } from '@/lib/notification-delivery-system'

const system = NotificationDeliverySystem.getInstance()
const prefs = await system.getUserPreferences(userId)
```

#### Update Preferences

```typescript
// Allow user to change preferences
await system.updateUserPreferences(userId, {
  quietHours: {
    enabled: true,
    start: '23:00',
    end: '07:00',
    timezone: user.timezone
  },
  frequency: {
    immediate: ['critical'],
    batched: ['high', 'medium'],
    batchInterval: 120  // 2 hours
  }
})
```

### 3.2 Quiet Hours Logic

```typescript
// Check if user is in quiet hours
function isQuietHours(preferences: NotificationPreferences): boolean {
  const { enabled, start, end, timezone } = preferences.quietHours
  if (!enabled) return false

  // Get current time in user's timezone
  const now = new Date()
  const userTime = now.toLocaleString('en-US', { timeZone: timezone })
  const [hours, minutes] = userTime.split(':').map(Number)
  const currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  // Check if within quiet hours
  if (start < end) {
    return currentTime >= start && currentTime < end
  } else {
    // Wraps midnight (e.g., 22:00 to 08:00)
    return currentTime >= start || currentTime < end
  }
}
```

## 4. Delivery Implementation

### 4.1 Send a Notification

```typescript
import { NotificationDeliverySystem } from '@/lib/notification-delivery-system'

const system = NotificationDeliverySystem.getInstance()

const results = await system.deliverNotification(
  alert,  // CompetitorAlert object
  preferences  // NotificationPreferences
)

results.forEach(result => {
  console.log(`${result.channelId}: ${result.success ? 'sent' : result.error}`)
})
```

### 4.2 Email Channel

Email delivery uses **Zoho Mail SMTP** (configured via mail-transport.ts):

```typescript
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Built-in templates
const templates = {
  CRITICAL_ALERT: {
    subject: 'Critical Alert: {{alertType}}',
    html: '<h1>⚠️ {{message}}</h1><p>{{details}}</p>',
    text: 'CRITICAL: {{message}}'
  },
  DAILY_DIGEST: {
    subject: 'Your Daily Competitive Intelligence Summary',
    html: '<h2>Today\'s Alerts</h2>{{alertsList}}',
    text: 'Daily Summary\n{{alertsList}}'
  }
}
```

**Environment variables for email:**
```bash
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@solosuccessai.fun
SMTP_PASSWORD=<app-specific-password>
FROM_EMAIL="SoloSuccess AI <support@solosuccessai.fun>"
```

### 4.3 Push Notification Channel

Web push notifications for real-time alerts:

```typescript
// Requires user opt-in and service worker
interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string  // Prevent duplicates
  data?: Record<string, any>
}

// Send push
const result = await system.deliverViaChannel(
  'push_ch',
  {
    title: 'Competitor Alert',
    body: 'TechCorp launched new product',
    tag: 'competitor_alert_comp_123',  // Deduplicate
    data: { competitorId: 'comp_123', alertId: 'alert_456' }
  }
)
```

### 4.4 Batching Example

```typescript
// Batch medium/low severity alerts
import { NotificationDeliverySystem } from '@/lib/notification-delivery-system'

const system = NotificationDeliverySystem.getInstance()

// Track batched alerts in memory
private batchedNotifications: Map<string, CompetitorAlert[]> = new Map()

// Add to batch
for (const alert of mediumSeverityAlerts) {
  const batch = batchedNotifications.get(userId) || []
  batch.push(alert)
  batchedNotifications.set(userId, batch)
}

// Flush batch every N minutes
setInterval(async () => {
  for (const [userId, alerts] of batchedNotifications) {
    if (alerts.length === 0) continue

    await system.sendBatch(userId, alerts)
    batchedNotifications.delete(userId)
  }
}, preferences.frequency.batchInterval * 60 * 1000)
```

## 5. Integration with Systems

### 5.1 Competitor Alert Integration

```typescript
import { competitorAlertSystem } from '@/lib/competitor-alert-system'
import { NotificationDeliverySystem } from '@/lib/notification-delivery-system'

// When a competitor alert is triggered
export async function handleCompetitorAlert(alert: CompetitorAlert) {
  // 1. Store alert in database
  await db.insert(competitorAlerts).values(alert)

  // 2. Get user preferences
  const prefs = await system.getUserPreferences(alert.userId)

  // 3. Deliver notification
  const results = await system.deliverNotification(alert, prefs)

  // 4. Log delivery
  logInfo(`Alert ${alert.id} delivered to ${results.length} channels`)
}
```

### 5.2 Workflow Engine Integration

```typescript
// Send notifications as part of workflow
export async function executeNotificationNode(
  node: WorkflowNode,
  context: ExecutionContext
) {
  const system = NotificationDeliverySystem.getInstance()
  
  const recipients = await resolveRecipients(node.config.recipients)
  
  for (const userId of recipients) {
    const prefs = await system.getUserPreferences(userId)
    await system.deliverNotification(
      {
        type: node.config.alertType,
        severity: node.config.severity,
        message: node.config.message,
        userId
      },
      prefs
    )
  }
}
```

### 5.3 Database Events

```typescript
// Send notifications on important database events
export async function onSubscriptionUpgrade(user: User, newTier: string) {
  const system = NotificationDeliverySystem.getInstance()
  const prefs = await system.getUserPreferences(user.id)
  
  await system.deliverNotification(
    {
      type: 'subscription_upgrade',
      severity: 'low',
      message: `Welcome to ${newTier}! Check out new features.`,
      userId: user.id
    },
    prefs
  )
}
```

## 6. API Reference

### `NotificationDeliverySystem.getInstance()`

Get singleton instance.

```typescript
const system = NotificationDeliverySystem.getInstance()
```

### `deliverNotification(alert, preferences)`

Deliver alert to all active channels.

**Parameters:**
- `alert: CompetitorAlert` — Alert to deliver
- `preferences: NotificationPreferences` — User preferences

**Returns:**
```typescript
Promise<NotificationDeliveryResult[]>  // One per channel
```

### `getUserPreferences(userId)`

Load user notification preferences.

**Returns:**
```typescript
Promise<NotificationPreferences>
```

### `updateUserPreferences(userId, updates)`

Update user preferences (channels, quiet hours, frequency).

**Parameters:**
- `userId: string`
- `updates: Partial<NotificationPreferences>`

### `sendBatch(userId, alerts)`

Send batched notification (combined summary).

**Parameters:**
- `userId: string`
- `alerts: CompetitorAlert[]`

## 7. Best Practices

### 7.1 Respect User Preferences

```typescript
// ✅ Good: Check preferences before sending
const prefs = await system.getUserPreferences(userId)
if (!prefs.channels.some(c => c.enabled)) {
  // User has disabled all notifications
  return
}

// ❌ Bad: Ignore preferences
await system.sendEmail(userId, message)
```

### 7.2 Use Appropriate Severity Levels

```typescript
// Critical: Security breach, payment failed, account compromised
severity: 'critical'

// High: New product launch, major feature, urgent deadline
severity: 'high'

// Medium: Engagement spike, competitor mention, minor update
severity: 'medium'

// Low: Scheduled post, routine activity, FYI
severity: 'low'
```

### 7.3 Prevent Spam

```typescript
// ❌ Bad: Send notification for every action
onMouseClick: () => sendNotification('User clicked')

// ✅ Good: Batch or debounce low-priority events
const debouncedNotify = debounce(
  () => sendNotification('User activity'),
  30000  // Send at most once per 30 seconds
)
```

### 7.4 Handle Failures Gracefully

```typescript
const results = await system.deliverNotification(alert, prefs)

for (const result of results) {
  if (!result.success) {
    // Log but don't crash
    logError(`Failed to deliver via ${result.channelId}: ${result.error}`)
    
    // Implement retry logic
    if (result.error.includes('TEMPORARY')) {
      await scheduleRetry(alert, result.channelId)
    }
  }
}
```

## 8. Monitoring & Debugging

### 8.1 Delivery Metrics

```typescript
// Track delivery success rates
const results = await Promise.all(
  alerts.map(a => system.deliverNotification(a, prefs))
)

const successCount = results.flat().filter(r => r.success).length
const totalCount = results.flat().length
const successRate = (successCount / totalCount) * 100

console.log(`Delivery success rate: ${successRate.toFixed(1)}%`)
```

### 8.2 Check User Preferences

```typescript
const prefs = await system.getUserPreferences(userId)
console.log('Notification Channels:')
prefs.channels.forEach(ch => {
  console.log(`- ${ch.name}: ${ch.enabled ? 'enabled' : 'disabled'}`)
})
```

### 8.3 Test Notification

```typescript
// Send test notification to verify setup
const testResult = await system.deliverNotification(
  {
    type: 'test',
    severity: 'low',
    message: 'This is a test notification',
    userId
  },
  prefs
)

console.log('Test results:', testResult)
```

## 9. Troubleshooting

### Issue: Notifications not reaching users

**Causes:**
1. User disabled notifications
2. Channel disabled
3. Quiet hours active
4. Email SMTP not configured

**Debug:**
```typescript
const prefs = await system.getUserPreferences(userId)
console.log('Preferences:', JSON.stringify(prefs, null, 2))
console.log('In quiet hours?', system.isQuietHours(prefs))
```

### Issue: Email not sending

**Cause:** SMTP credentials missing or incorrect.

**Check:**
```bash
# Verify environment variables
echo $SMTP_HOST $SMTP_PORT $SMTP_USER
# Should print: smtp.zoho.com 587 support@solosuccessai.fun

# Check mail transport
node -e "
const { isEmailConfigured } = require('@/lib/mail-transport');
console.log('Email configured:', isEmailConfigured());
"
```

### Issue: Duplicate notifications

**Cause:** Event triggered multiple times or batch processing issue.

**Solution:**
1. Add deduplication (tag-based for push)
2. Check for duplicate database entries
3. Ensure idempotent processing

### Issue: High latency on delivery

**Cause:** Sending to many channels sequentially.

**Solution:**
```typescript
// ✅ Good: Parallel delivery
const results = await Promise.all(
  activeChannels.map(ch => deliverToChannel(ch))
)
```

## 10. Future Enhancements

- [ ] ML-powered optimal send time prediction
- [ ] Channel-specific message templates
- [ ] Advanced scheduling (cron patterns)
- [ ] Notification preferences learning
- [ ] SMS channel integration
- [ ] Telegram/WhatsApp support
- [ ] Delivery analytics dashboard
- [ ] A/B testing for message variations

## 11. References

- **Mail Transport**: `mail-transport.ts` (Zoho SMTP)
- **Database Schema**: `notificationPreferences`, `notificationDeliveries`
- **Alert System**: `competitor-alert-system.ts`
- **Workflow Engine**: `workflow-engine.ts`
- **Deployment Setup**: `docs/deployment/ZOHO_MAIL_SMTP_SETUP.md`
