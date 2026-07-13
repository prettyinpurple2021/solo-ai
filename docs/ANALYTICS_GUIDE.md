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

### 3.2 Feature-Specific Events

Applications can attach feature-specific details to the supported analytics event types:

```typescript
import { analytics } from '@/lib/analytics'

// In a React component
await analytics.trackEvent('feature_used', {
  userId: user.id,
  featureName: 'advanced_analytics',
  userTier: 'pro',
  context: { pageUrl: window.location.href }
})

// In an API route
import { db } from '@/db/index'
import { analyticsEvents } from '@/shared/db/schema'

await db.insert(analyticsEvents).values({
  event: 'feature_used',
  user_id: user.id,
  timestamp: new Date(),
  properties: { featureName: 'advanced_analytics', source: 'api' }
})
```

Use `userId` when calling the `analytics` service and `user_id` when inserting rows directly
through the Drizzle schema.

## 4. Tracking Implementation

### 4.1 Client-Side Tracking (React)

```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'

export function usePageView(userId: string, pageName: string) {
  useEffect(() => {
    void trackPageView(userId, window.location.pathname, {
      pageTitle: pageName,
      url: window.location.href
    })
  }, [pageName, userId])
}

// Usage in component
function Dashboard() {
  usePageView(user.id, 'Dashboard')
  
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
    user_id: session.user.id,
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

  try {
    await db.insert(analyticsEvents).values(toInsert)
    logInfo("Flushed " + toInsert.length + " analytics events")
  } catch (error) {
    logError("Failed to flush analytics events, restoring to batch", error)
    eventBatch.unshift(...toInsert)
  }
}, 30000)  // Every 30 seconds
```

## 5. Metrics API

### 5.1 User Metrics

```typescript
import { analytics } from '@/lib/analytics'

const metrics = await analytics.getUserMetrics(userId)
if (!metrics) {
  return
}

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
import { analytics } from '@/lib/analytics'

const metrics = await analytics.calculateBusinessMetrics()
console.log({
  dau: metrics.activeUsers,             // Daily active users
  mau: metrics.totalUsers,              // Total registered
  newToday: metrics.newUsersToday,
  churnRate: metrics.churnRate,         // % inactive
  retention: metrics.userRetentionRate, // % active users
  revenue: metrics.revenue,
  mrr: metrics.mrr
})
```

### 5.3 Performance Metrics

```typescript
import { analytics } from '@/lib/analytics'

const [perf] = await analytics.getPerformanceMetrics()
console.log({
  pageLoad: perf?.pageLoadTime ?? 0,       // ms
  apiResponse: perf?.apiResponseTime ?? 0, // ms
  errorRate: perf?.errorRate ?? 0,         // %
  uptime: perf?.uptime ?? 0                // % (last 30 days)
})
```

## 6. Revenue Tracking

The analytics layer reads revenue metrics from connected billing providers through
`RevenueTrackingService`.

### 6.1 User Revenue Metrics

```typescript
import { RevenueTrackingService } from '@/lib/revenue-tracking'

const revenue = await RevenueTrackingService.calculateRevenue(
  user.id,
  new Date(Date.now() - 30 * 86400000),
  new Date()
)

const mrr = await RevenueTrackingService.calculateMRR(user.id)
```

### 6.2 Platform Revenue Metrics

```typescript
import { RevenueTrackingService } from '@/lib/revenue-tracking'

const totalRevenue = await RevenueTrackingService.calculateGlobalRevenue(
  new Date(Date.now() - 30 * 86400000),
  new Date()
)

const totalMrr = await RevenueTrackingService.calculateGlobalMRR()
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
const featureName = sql<string>`(${analyticsEvents.properties}->>'featureName')`
const eventCount = sql<number>`count(*)`

const activeUsers = await db
  .selectDistinct({ userId: analyticsEvents.user_id })
  .from(analyticsEvents)
  .where(
    and(
      gte(analyticsEvents.timestamp, new Date(Date.now() - 7 * 86400000)),
      isNotNull(analyticsEvents.user_id)
    )
  )

// Get top features by usage
const topFeatures = await db
  .select({
    feature: featureName.as('feature'),
    count: eventCount.as('count')
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.event, 'feature_used'))
  .groupBy(featureName)
  .orderBy(desc(eventCount))
  .limit(10)
```

### 7.3 Time-Series Analysis

```typescript
const eventDate = sql<string>`date(${analyticsEvents.timestamp})`

// Track feature usage over time
const featureUsageTimeSeries = await db
  .select({
    date: eventDate.as('date'),
    count: sql<number>`count(*)`.as('count')
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.event, 'feature_used'))
  .groupBy(eventDate)
  .orderBy(eventDate)
```

## 8. Best Practices

### 8.1 PII Protection

Never track personally identifiable information:

```typescript
// ❌ Bad: Tracks sensitive data
analytics.trackEvent('user_login', {
  email: user.email,        // PII
  password: user.password   // Secret
})

// ✅ Good: Anonymized data
analytics.trackEvent('user_login', {
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
onTextChange = async () => {
  await analytics.trackEvent('feature_used', {
    userId: user.id,
    featureName: 'editor_typing',
    textPreview: value
  })
}

// ✅ Good: Batch or debounce
onTextChange = debounce(async () => {
  await analytics.trackEvent('feature_used', {
    userId: user.id,
    featureName: 'editor_typing',
    wordCount: value.split(' ').length
  })
}, 1000)
```

### 8.4 Include Context

Make events queryable and understandable:

```typescript
// ✅ Good: Rich context
analytics.trackEvent('file_uploaded', {
  userId: user.id,
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
1. Revenue provider connection not active
2. Billing integration disconnected
3. Time window mismatch

**Solution:**
1. Check Stripe webhook logs
2. Verify payment provider connections are active
3. Check the date range passed to `RevenueTrackingService`

## 10. Future Enhancements

- [ ] Real-time dashboards with WebSocket updates
- [ ] Predictive churn modeling
- [ ] Cohort analysis (compare user groups)
- [ ] Attribution modeling (which features drive revenue)
- [ ] Automated alerts for anomalies
- [ ] Custom dashboard builder for teams

## 11. References

- **Database Schema**: `analyticsEvents` table in `src/lib/shared/db/schema/business.ts`
- **Revenue Tracking**: See `revenue-tracking.ts`
- **Metrics API**: See `analytics.ts`
- **Event Types**: See type definitions in `analytics.ts`
