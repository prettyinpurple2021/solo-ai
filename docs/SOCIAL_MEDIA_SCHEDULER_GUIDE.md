# Social Media Scheduler — SoloSuccess AI

The Social Media Scheduler automates monitoring of competitors' social media activity across multiple platforms (LinkedIn, Twitter, Facebook, Instagram). This guide covers architecture, job scheduling, analysis, and integration.

## 1. Overview

The scheduler automatically creates and manages monitoring jobs for each competitor's social media presence. It:

- **Monitors** competitor accounts across 4 major platforms
- **Analyzes** engagement metrics, content themes, audience sentiment
- **Schedules** recurring scans (hourly, daily, weekly)
- **Prioritizes** jobs (high/medium/low) for resource allocation
- **Generates** insights via the Social Media Analysis Engine
- **Triggers** alerts on significant activity (new product, major campaign)

## 2. Architecture

### 2.1 Job Pipeline

```
Schedule Request
    ↓
Create Monitoring Jobs (one per platform)
    ↓
Store in Database (scrapingJobs table)
    ↓
Job Processor Picks Up Job
    ↓
Platform-Specific Scraper Executes
    ↓
Results Stored (scrapingJobResults table)
    ↓
Analysis Engine Processes Results
    ↓
Alert System (if thresholds met)
```

### 2.2 Components

| Component | Purpose |
|-----------|---------|
| `SocialMediaScheduler` | Creates and manages jobs |
| `SocialMediaMonitor` | Executes platform scraping |
| `SocialMediaAnalysisEngine` | Analyzes results |
| `SocialMediaJobProcessor` | Background job runner |
| `competitorAlertSystem` | Triggers alerts |

## 3. Job Configuration

### 3.1 Scheduling a Competitor

```typescript
import { SocialMediaScheduler } from '@/lib/social-media-scheduler'

const scheduler = new SocialMediaScheduler()

// Basic schedule (default config)
const jobIds = await scheduler.scheduleMonitoring(
  competitorId,
  userId
)

// Custom configuration
const jobIds = await scheduler.scheduleMonitoring(
  competitorId,
  userId,
  {
    platforms: ['linkedin', 'twitter'],     // Only these platforms
    frequency: 'hourly',                    // Check every hour
    priority: 'high',                       // Process first
    enabled: true
  }
)
```

### 3.2 Default Configuration

```typescript
{
  platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
  frequency: 'daily',      // Supported: 'hourly', 'daily', 'weekly'
  priority: 'medium',      // Supported: 'low', 'medium', 'high'
  enabled: true
}
```

### 3.3 Job Frequencies

| Frequency | Interval | Use Case |
|-----------|----------|----------|
| `hourly` | Every hour | High-priority competitors, real-time alerts |
| `daily` | Every 24 hours | Most competitors, standard monitoring |
| `weekly` | Every 7 days | Low-priority, research-only |

**Note:** Frequency is stored but requires a background job processor to enforce timing.

## 4. API Reference

### 4.1 SocialMediaScheduler

#### `scheduleMonitoring(competitorId, userId, config?)`

Create monitoring jobs for a competitor.

**Parameters:**
- `competitorId: string` — UUID of competitor profile
- `userId: string` — UUID of current user
- `config?: Partial<SocialMediaJobConfig>` — Override defaults

**Returns:**
```typescript
Promise<string[]>  // Array of created job IDs
```

**Example:**
```typescript
const jobIds = await scheduler.scheduleMonitoring(
  'comp_123',
  'user_456',
  { frequency: 'hourly', priority: 'high' }
)

console.log(`Created ${jobIds.length} monitoring jobs`)
// Output: Created 4 monitoring jobs
```

#### `updateJobConfig(jobId, config)`

Update configuration for an existing job.

**Parameters:**
- `jobId: string` — Job ID
- `config: Partial<SocialMediaJobConfig>` — Updated config

**Example:**
```typescript
await scheduler.updateJobConfig('job_123', {
  frequency: 'weekly',
  enabled: false
})
```

#### `pauseMonitoring(competitorId)`

Temporarily disable all monitoring for a competitor.

**Parameters:**
- `competitorId: string` — Competitor ID

**Example:**
```typescript
await scheduler.pauseMonitoring('comp_123')
// Later...
await scheduler.resumeMonitoring('comp_123')
```

#### `getMonitoringStatus(competitorId)`

Get current status of all jobs for a competitor.

**Returns:**
```typescript
{
  competitorId: string
  totalJobs: number
  activeJobs: number
  lastRunAt: Date | null
  nextRunAt: Date | null
  jobs: {
    id: string
    platform: string
    frequency: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    lastExecutedAt: Date | null
    nextExecutionAt: Date | null
  }[]
}
```

**Example:**
```typescript
const status = await scheduler.getMonitoringStatus('comp_123')
console.log(`${status.activeJobs}/${status.totalJobs} jobs running`)
```

### 4.2 SocialMediaMonitor

#### `monitorPlatform(config)`

Execute a single monitoring job.

**Parameters:**
```typescript
{
  competitorId: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  accountHandle: string  // @handle or LinkedIn profile URL
}
```

**Returns:**
```typescript
{
  platform: string
  accountHandle: string
  timestamp: Date
  metrics: {
    followers: number
    engagement: {
      avgLikes: number
      avgComments: number
      avgShares: number
    }
    postFrequency: number  // posts per week
    sentimentScore: number // -1 to 1
  }
  topPosts: Array<{
    id: string
    content: string
    likes: number
    comments: number
    timestamp: Date
  }>
  themes: string[]  // Detected topics
}
```

## 5. Monitoring Process

### 5.1 What Gets Monitored

**For each platform:**
- Follower count and growth
- Post engagement (likes, comments, shares)
- Content themes and topics
- Posting frequency
- Audience sentiment
- Top-performing posts

### 5.2 Analysis Results

```typescript
interface SocialMediaAnalysisResult {
  competitorId: string
  timestamp: Date
  
  // Aggregate metrics
  overallEngagement: number      // 0-100 score
  contentQuality: number         // 0-100
  audienceSentiment: number      // -100 to 100
  growthRate: number             // % per month
  
  // Per-platform breakdown
  platforms: {
    linkedin: { engagement: number, followers: number }
    twitter: { engagement: number, followers: number }
    // ... etc
  }
  
  // Insights
  topThemes: string[]
  emergingTrends: string[]
  weaknesses: string[]           // Areas lagging
  opportunities: string[]        // Where they're vulnerable
}
```

## 6. Alert System Integration

Social media monitoring triggers competitive alerts:

```typescript
// Automatic alert: New product announcement
{
  competitorId: 'comp_123',
  type: 'product_launch',
  severity: 'high',
  message: 'TechCorp announced new AI feature on LinkedIn',
  source: 'social_media_scheduler',
  metadata: {
    platform: 'linkedin',
    postId: 'post_789',
    content: '...',
    engagement: 1250
  }
}

// Automatic alert: Major engagement spike
{
  competitorId: 'comp_123',
  type: 'engagement_spike',
  severity: 'medium',
  message: 'Post received 5000+ likes (5x normal)',
  metadata: {
    platform: 'twitter',
    normalEngagement: 1000,
    actualEngagement: 5000
  }
}
```

## 7. Implementation Guide

### 7.1 Add a New Competitor to Monitor

```typescript
import { SocialMediaScheduler } from '@/lib/social-media-scheduler'
import { db } from '@/db/index'
import { competitorProfiles } from '@/shared/db/schema'

export async function addCompetitorMonitoring(
  competitorName: string,
  userId: string,
  socialHandles: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
) {
  // 1. Create competitor profile
  const [competitor] = await db
    .insert(competitorProfiles)
    .values({
      name: competitorName,
      userId,
      socialHandles
    })
    .returning()

  // 2. Schedule monitoring
  const scheduler = new SocialMediaScheduler()
  const jobIds = await scheduler.scheduleMonitoring(
    competitor.id,
    userId,
    { frequency: 'daily' }
  )

  return { competitor, jobIds }
}
```

### 7.2 Get Competitor Insights Dashboard

```typescript
import { SocialMediaAnalysisEngine } from '@/lib/social-media-analysis-engine'

export async function getCompetitorDashboard(competitorId: string) {
  const engine = new SocialMediaAnalysisEngine()
  
  // Get latest analysis
  const analysis = await engine.getLatestAnalysis(competitorId)
  
  // Get historical trends
  const trends = await engine.getTrendHistory(competitorId, 30)  // Last 30 days
  
  // Get recent alerts
  const alerts = await engine.getRecentAlerts(competitorId, 10)
  
  return {
    currentMetrics: analysis,
    trends,
    recentActivity: alerts,
    lastUpdated: analysis.timestamp
  }
}
```

### 7.3 Custom Analysis

```typescript
import { db } from '@/db/index'
import { scrapingJobResults } from '@/shared/db/schema'
import { eq, gte } from 'drizzle-orm'

// Find all posts from a competitor mentioning "AI"
const aiPosts = await db
  .select()
  .from(scrapingJobResults)
  .where(
    and(
      eq(scrapingJobResults.competitorId, competitorId),
      gte(scrapingJobResults.timestamp, new Date(Date.now() - 7 * 86400000)),
      like(scrapingJobResults.data.content, '%AI%')
    )
  )
  .orderBy(desc(scrapingJobResults.data.engagement))

console.log(`Found ${aiPosts.length} posts mentioning AI`)
```

## 8. Best Practices

### 8.1 Respectful Scraping

- Respect `robots.txt` and platform ToS
- Use public API endpoints where available (Twitter API, LinkedIn API)
- Don't overload servers with too many requests
- Implement appropriate delays between requests

### 8.2 Data Privacy

- Don't store personal user data (followers' names, emails)
- Anonymize sentiment analysis results
- Comply with GDPR/CCPA for any user data
- Delete old data according to retention policies

### 8.3 Alert Fatigue Prevention

- Set meaningful thresholds (not every post)
- Deduplicate alerts (don't alert on same story twice)
- Use severity levels appropriately
- Let users customize alert preferences

### 8.4 Error Handling

```typescript
try {
  const result = await monitor.monitorPlatform({
    competitorId: 'comp_123',
    platform: 'linkedin',
    accountHandle: '@techcorp'
  })
} catch (error) {
  if (error.code === 'PLATFORM_UNAVAILABLE') {
    logInfo('LinkedIn temporarily unavailable, retrying later')
    // Scheduler will retry
  } else if (error.code === 'ACCOUNT_DELETED') {
    logError(`Account deleted: ${error.message}`)
    // Mark account as inactive
  } else {
    logError(`Unknown error: ${error}`)
    // General error handling
  }
}
```

## 9. Monitoring & Debugging

### 9.1 Check Job Status

```typescript
const scheduler = new SocialMediaScheduler()
const status = await scheduler.getMonitoringStatus(competitorId)

console.log(`Jobs: ${status.activeJobs} active / ${status.totalJobs} total`)
status.jobs.forEach(job => {
  console.log(`${job.platform}: ${job.status}`)
  if (job.lastExecutedAt) {
    const ago = Date.now() - job.lastExecutedAt.getTime()
    console.log(`  Last run: ${ago / 1000 / 60} minutes ago`)
  }
})
```

### 9.2 View Results

```typescript
const results = await db.query.scrapingJobResults.findMany({
  where: and(
    eq(scrapingJobResults.competitorId, competitorId),
    gte(scrapingJobResults.timestamp, new Date(Date.now() - 24 * 3600000))
  ),
  orderBy: desc(scrapingJobResults.timestamp),
  limit: 10
})

results.forEach(r => {
  console.log(`${r.data.platform}: ${r.data.metrics.followers} followers`)
})
```

### 9.3 Manual Job Trigger

```typescript
import { SocialMediaJobProcessor } from '@/lib/social-media-job-processor'

const processor = new SocialMediaJobProcessor()
await processor.processJob(jobId)
```

## 10. Troubleshooting

### Issue: No results being saved

**Causes:**
1. Platform scraper failed (network, rate limit)
2. Account handle incorrect
3. Database write failed

**Debug:**
```typescript
const result = await monitor.monitorPlatform(config)
if (!result) {
  logError('Monitor returned null/undefined')
}
```

### Issue: Old data appearing

**Cause:** Results not being properly timestamped.

**Solution:**
```typescript
// Ensure timestamp is current
const result = {
  ...scrapedData,
  timestamp: new Date()  // Add this
}
```

### Issue: Duplicate alerts

**Causes:**
1. Same event triggering multiple times
2. Job running multiple times concurrently

**Solution:**
1. Implement deduplication in alert system
2. Add job lock to prevent concurrent runs

## 11. Future Improvements

- [ ] Machine learning for content prediction
- [ ] Competitor benchmarking dashboard
- [ ] Automated competitive recommendations
- [ ] Integration with content calendar for counter-campaigns
- [ ] Sentiment analysis with ML models
- [ ] Cross-platform trend analysis
- [ ] Email/Slack alerts for key insights

## 12. References

- **Database Schema**: `competitorProfiles`, `scrapingJobs`, `scrapingJobResults` in schema
- **Analysis Engine**: `social-media-analysis-engine.ts`
- **Monitor Implementation**: `social-media-monitor.ts`
- **Alert System**: `competitor-alert-system.ts`
