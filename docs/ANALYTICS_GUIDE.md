# Analytics System — SoloSuccess AI

The analytics system tracks user behavior, engagement metrics, and platform performance. This guide covers architecture, event tracking, metrics calculation, and operational monitoring.

## 1. Overview

The platform collects **behavioral events** and **system metrics** to understand user engagement, product performance, and business KPIs.

### 1.1 What Gets Tracked

**User Behavior Events:**
- Account lifecycle (signup, login, logout, deletion)
- Feature usage (AI interactions, task creation, file uploads)
- Content consumption (page views, template usage)
- Errors and performance issues

**System Metrics:**
- Page load times, API response times
- Error rates, uptime
- Memory and CPU usage
- Database query performance

**Business Metrics:**
- MRR, ARR, churn rate
- New user acquisition
- User retention and engagement scores
- Revenue attribution by feature

## 2. Architecture

### 2.1 Event Pipeline

```
User Action (Click, Submit, etc.)
    ↓
Event Handler (React component / API route)
    ↓
Event Queue (in-memory or Upstash)
    ↓
Event Processor (batch or real-time)
    ↓
Database Storage (analyticsEvents table)
    ↓
Metrics Calculator (aggregation)
    ↓
Dashboard / Reports / Alerts
```

### 2.2 Data Model

```typescript
interface AnalyticsEventData {
  event: AnalyticsEvent                    // Type of event
  userId?: string                          // User ID (optional for anonymous)
  sessionId?: string                       // Session ID for correlation
  timestamp: Date                          // When it happened
  properties: Record<string, any>          // Event-specific data
  metadata?: {
    userAgent?: string                     // Browser info
    ip?: string                            // Client IP
    referrer?: string                      // Source
    url?: string                           // Current page URL
  }
}
```

### 2.3 Metrics Calculation

**User Metrics** (aggregated per user):
- Sessions and page views
- AI interactions and goals completed
- Retention score (0-100)
- Revenue contribution

**Business Metrics** (platform-wide):
- DAU, MAU, new user counts
- Churn rate (% of users inactive)
- Engagement metrics
- Revenue metrics (MRR, ARR)

## 3. Event Types

### 3.1 Core Events

| Event | Fired When | Properties |
|-------|-----------|-----------|
| `user_signup` | Account created | email, source |
| `user_login` | User logs in | method (email/oauth) |
| `user_logout` | User logs out | reason |
| `page_view` | Page loads | pageTitle, path |
| `ai_agent_interaction` | User chats with AI | agentId, duration |
| `goal_created` | User creates goal | goalType, dueDate |
| `goal_completed` | User completes goal | goalId, daysToComplete |
| `task_created` | Task created | taskType, projectId |
| `task_completed` | Task marked done | taskId, daysOpen |
| `file_uploaded` | User uploads file | fileName, fileSize, type |
| `template_saved` | Template saved/used | templateId, category |
| `dashboard_viewed` | Dashboard opened | section |
| `feature_used` | Any feature interaction | featureName, context |
| `error_occurred` | Client-side error | errorType, message, stack |
| `performance_metric` | Performance data | metric, value, context |

### 3.2 Custom Events

Applications can track custom events:

```typescript
import { trackEvent } from '@/lib/analytics'

// In a React component
await trackEvent('premium_feature_accessed', {
  featureName: 'advanced_analytics',
  userTier: 'pro',
  context: { pageUrl: window.location.href }
})

// In an API route
import { db } from '@/db/index'
import { analyticsEvents } from '@/shared/db/schema'

await db.insert(analyticsEvents).values({
  event: 'custom_event',
  userId: user.id,
  timestamp: new Date(),
  properties: { customField: 'value' }
})
```

## 4. Tracking Implementation

### 4.1 Client-Side Tracking (React)

```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function usePageView(pageName: string) {
  useEffect(() => {
    trackEvent('page_view', {
      pageTitle: pageName,
      path: window.location.pathname,
      url: window.location.href
    })
  }, [pageName])
}

// Usage in component
function Dashboard() {
  usePageView('Dashboard')
  
  return <div>...</div>
}
```

### 4.2 Server-Side Tracking (API Routes)

```typescript
import { db } from '@/db/index'
import { analyticsEvents } from '@/shared/db/schema'

export async function POST(request: Request) {
  const session = await auth()
  
  // Track API usage
  await db.insert(analyticsEvents).values({
    event: 'feature_used',
    userId: session.user.id,
    timestamp: new Date(),
    properties: { featureName: 'export_pdf' }
  })

  // Process request...
}
```

### 4.3 Batch Tracking

For high-volume events, batch them to reduce database load:

```typescript
import { db } from '@/db/index'
import { analyticsEvents } from '@/shared/db/schema'

// Collect events in memory
const eventBatch: AnalyticsEventData[] = []

// Periodically flush to database
setInterval(async () => {
  if (eventBatch.length === 0) return
  
  const toInsert = [...eventBatch]
  eventBatch.length = 0  // Clear

  await db.insert(analyticsEvents).values(toInsert)
  logInfo(`Flushed ${toInsert.length} analytics events`)
}, 30000)  // Every 30 seconds
```

## 5. Metrics API

### 5.1 User Metrics

```typescript
import { getUserMetrics } from '@/lib/analytics'

const metrics = await getUserMetrics(userId)
console.log({
  sessions: metrics.totalSessions,
  engagement: metrics.retentionScore,   // 0-100
  revenue: metrics.revenue,             // USD
  mrr: metrics.mrr                      // Monthly recurring revenue
})
```

**Retention Score Calculation:**
```
Score = (Days Active Last 30 / 30) * (Features Used / Max Features) * 100
- Range: 0-100
- 90+ = highly engaged
- 50-89 = moderately engaged
- <50 = at risk of churn
```

### 5.2 Business Metrics

```typescript
import { getBusinessMetrics } from '@/lib/analytics'

const metrics = await getBusinessMetrics()
console.log({
  dau: metrics.activeUsers,             // Daily active users
  mau: metrics.totalUsers,              // Total registered
  newToday: metrics.newUsersToday,
  churnRate: metrics.churnRate,         // % inactive
  mrr: metrics.totalMRR,
  runway: metrics.runway                // Months until $0 (if negative)
})
```

### 5.3 Performance Metrics

```typescript
import { getPerformanceMetrics } from '@/lib/analytics'

const perf = await getPerformanceMetrics()
console.log({
  pageLoad: perf.pageLoadTime,          // ms
  apiResponse: perf.apiResponseTime,    // ms
  errorRate: perf.errorRate,            // %
  uptime: perf.uptime                   // % (last 30 days)
})
```

## 6. Revenue Tracking

The analytics system integrates with the billing system to track revenue metrics.

### 6.1 Revenue Events

```typescript
import { recordRevenue } from '@/lib/analytics'

// On subscription creation
await recordRevenue({
  userId: user.id,
  type: 'subscription',
  amount: 29.99,
  tier: 'pro',
  event: 'upgrade'
})

// On payment received
await recordRevenue({
  userId: user.id,
  type: 'payment',
  amount: 29.99,
  orderId: 'or_123'
})
```

### 6.2 Churn Tracking

```typescript
// On subscription cancellation
await recordRevenue({
  userId: user.id,
  type: 'churn',
  amount: -29.99,  // Negative to reduce MRR
  tier: 'pro',
  event: 'downgrade',
  reason: 'user_requested'
})
```

## 7. Monitoring & Dashboards

### 7.1 Health Metrics

Monitor these KPIs continuously:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time | <200ms | >500ms |
| Error Rate | <0.1% | >1% |
| Uptime | 99.9% | <99% |
| Churn Rate | <5% | >10% |
| MRR Growth | >10% month-over-month | Negative growth |

### 7.2 Querying Analytics

```typescript
// Find active users in the last 7 days
const activeUsers = await db
  .select()
  .from(analyticsEvents)
  .where(
    and(
      gte(analyticsEvents.timestamp, new Date(Date.now() - 7 * 86400000)),
      notInArray(analyticsEvents.userId, getInactiveUserIds())
    )
  )

// Get top features by usage
const topFeatures = await db
  .select({
    feature: analyticsEvents.properties.featureName,
    count: count()
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.event, 'feature_used'))
  .groupBy(analyticsEvents.properties.featureName)
  .orderBy(desc(count()))
  .limit(10)
```

### 7.3 Time-Series Analysis

```typescript
// Track revenue over time
const revenueTimeSeries = await db
  .select({
    date: sql<string>`DATE(timestamp)`,
    revenue: sum(analyticsEvents.properties.amount)
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.event, 'payment'))
  .groupBy(sql<string>`DATE(timestamp)`)
  .orderBy(sql<string>`DATE(timestamp)`)
```

## 8. Best Practices

### 8.1 PII Protection

Never track personally identifiable information:

```typescript
// ❌ Bad: Tracks sensitive data
trackEvent('user_login', {
  email: user.email,        // PII
  password: user.password   // Secret
})

// ✅ Good: Anonymized data
trackEvent('user_login', {
  userId: user.id,
  method: 'password_auth'   // Non-sensitive
})
```

### 8.2 Event Naming Convention

Use consistent, descriptive event names:

```typescript
// ✅ Good: Verb_Object pattern
'goal_created'
'goal_completed'
'ai_agent_interaction'

// ❌ Avoid: Ambiguous names
'event'
'action'
'happened'
```

### 8.3 Batch for Performance

Don't fire individual analytics requests for high-frequency events:

```typescript
// ❌ Bad: Creates request per keystroke
onTextChange = () => {
  await trackEvent('text_input', { text: value })
}

// ✅ Good: Batch or debounce
onTextChange = debounce(() => {
  await trackEvent('text_input', { wordCount: value.split(' ').length })
}, 1000)
```

### 8.4 Include Context

Make events queryable and understandable:

```typescript
// ✅ Good: Rich context
trackEvent('file_uploaded', {
  fileSize: file.size,
  fileType: file.type,
  uploadDuration: endTime - startTime,
  isRetry: attemptNumber > 1
})
```

## 9. Troubleshooting

### Issue: Analytics not appearing in database

**Causes:**
1. Event tracking code not called
2. Database connection failed
3. User not authenticated for userId

**Debug:**
```typescript
import { logInfo } from '@/lib/logger'

logInfo('Tracking event', { event: 'page_view', userId: user?.id })
```

Check logs for tracking messages.

### Issue: Metrics seem incorrect

**Causes:**
1. Event timestamp off (server vs client time)
2. Double-counting (event fired twice)
3. Data not aggregated yet (may take minutes)

**Solution:**
1. Verify event timestamps are UTC
2. Inspect database for duplicate events
3. Wait for aggregation job to complete

### Issue: Revenue metrics not updating

**Causes:**
1. `recordRevenue()` not called during payment
2. Billing integration disconnected
3. Time zone mismatch

**Solution:**
1. Check Stripe webhook logs
2. Verify recordRevenue calls in billing routes
3. Check timezone in revenue tracking

## 10. Future Enhancements

- [ ] Real-time dashboards with WebSocket updates
- [ ] Predictive churn modeling
- [ ] Cohort analysis (compare user groups)
- [ ] Attribution modeling (which features drive revenue)
- [ ] Automated alerts for anomalies
- [ ] Custom dashboard builder for teams

## 11. References

- **Database Schema**: `analyticsEvents` table in `/shared/db/schema.ts`
- **Revenue Tracking**: See `revenue-tracking.ts`
- **Metrics API**: See `analytics.ts`
- **Event Types**: See type definitions in `analytics.ts`
