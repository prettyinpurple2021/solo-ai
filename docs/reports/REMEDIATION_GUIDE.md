# Production Readiness Remediation Guide

This guide provides detailed remediation steps with code examples for fixing the critical and high-priority issues identified in the Production Readiness Report.

---

## Critical Issue Remediations

### Issue #1 & #2: Learning Analytics Mock Data

**Current State:** API and frontend both use hardcoded mock data

**Files to Fix:**

- `app/api/learning/analytics/route.ts`
- `app/dashboard/learning/page.tsx`

**Remediation Steps:**

1. **Create Database Schema for Learning** (if not exists):

```sql
-- Add to schema if missing
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT,
  duration_minutes INTEGER,
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES learning_modules(id),
  completion_percentage INTEGER,
  time_spent INTEGER,
  last_accessed TIMESTAMP,
  started_at TIMESTAMP
);

CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  skill_name TEXT,
  current_level INTEGER,
  target_level INTEGER,
  gap_score INTEGER,
  assessed_at TIMESTAMP
);
```

1. **Fix `getLearningOverview()` Function:**

Replace lines 80-142 in `app/api/learning/analytics/route.ts`:

```typescript
async function getLearningOverview(db: any, userId: string, startDate: Date) {
  try {
    // Get total completed modules
    const completedModules = await db
      .select({ count: count() })
      .from(learningModules)
      .where(
        and(
          eq(learningModules.userId, userId),
          isNotNull(learningModules.completedAt),
          gte(learningModules.completedAt, startDate)
        )
      );

    // Get total time spent
    const timeSpentResult = await db
      .select({ totalTime: sum(userProgress.timeSpent) })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          gte(userProgress.lastAccessed, startDate)
        )
      );

    // Calculate average quiz scores (add quiz_scores table if needed)
    const avgQuizScore = await db
      .select({ avgScore: avg(quizScores.score) })
      .from(quizScores)
      .where(
        and(
          eq(quizScores.userId, userId),
          gte(quizScores.completedAt, startDate)
        )
      );

    // Get skills improved count
    const skillsImproved = await db
      .select({ count: count() })
      .from(skillAssessments)
      .where(
        and(
          eq(skillAssessments.userId, userId),
          sql`${skillAssessments.currentLevel} > ${skillAssessments.previousLevel}`,
          gte(skillAssessments.assessedAt, startDate)
        )
      );

    // Calculate current streak
    const streakData = await calculateLearningStreak(db, userId);

    // Get top categories
    const topCategories = await db
      .select({
        category: learningModules.category,
        time_spent: sum(userProgress.timeSpent),
        modules_completed: count(learningModules.id)
      })
      .from(learningModules)
      .innerJoin(userProgress, eq(learningModules.id, userProgress.moduleId))
      .where(
        and(
          eq(learningModules.userId, userId),
          isNotNull(learningModules.completedAt),
          gte(learningModules.completedAt, startDate)
        )
      )
      .groupBy(learningModules.category)
      .orderBy(desc(sum(userProgress.timeSpent)))
      .limit(4);

    return {
      total_modules_completed: completedModules[0]?.count || 0,
      total_time_spent: timeSpentResult[0]?.totalTime || 0,
      average_quiz_score: avgQuizScore[0]?.avgScore || 0,
      skills_improved: skillsImproved[0]?.count || 0,
      current_streak: streakData.currentStreak,
      learning_velocity: streakData.velocity,
      certifications_earned: await getCertificationCount(db, userId),
      peer_rank: await calculatePeerRank(db, userId),
      weekly_goal_progress: await getWeeklyGoalProgress(db, userId),
      top_categories: topCategories
    };
  } catch (error) {
    logError('Error getting learning overview:', error);
    throw error;
  }
}

// Helper functions
async function calculateLearningStreak(db: any, userId: string) {
  // Implement streak calculation logic
  const recentActivity = await db
    .select({ date: learningModules.completedAt })
    .from(learningModules)
    .where(
      and(
        eq(learningModules.userId, userId),
        isNotNull(learningModules.completedAt)
      )
    )
    .orderBy(desc(learningModules.completedAt));

  // Calculate consecutive days
  let currentStreak = 0;
  let previousDate = null;
  
  for (const activity of recentActivity) {
    const activityDate = new Date(activity.date);
    if (!previousDate) {
      currentStreak = 1;
    } else {
      const dayDiff = Math.floor((previousDate - activityDate) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    previousDate = activityDate;
  }

  return {
    currentStreak,
    velocity: recentActivity.length / 7 // modules per week
  };
}
```

1. **Fix Frontend to Use Real API:**

Replace lines 115-226 in `app/dashboard/learning/page.tsx`:

```typescript
useEffect(() => {
  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [analyticsRes, skillGapsRes, recommendationsRes, progressRes] = await Promise.all([
        fetch('/api/learning/analytics?type=overview'),
        fetch('/api/learning/analytics?type=skill-gaps'),
        fetch('/api/learning/analytics?type=recommendations'),
        fetch('/api/learning/analytics?type=progress')
      ]);

      if (!analyticsRes.ok || !skillGapsRes.ok || !recommendationsRes.ok || !progressRes.ok) {
        throw new Error('Failed to fetch learning data');
      }

      const analyticsData = await analyticsRes.json();
      const skillGapsData = await skillGapsRes.json();
      const recommendationsData = await recommendationsRes.json();
      const progressData = await progressRes.json();

      setAnalytics(analyticsData);
      setSkillGaps(skillGapsData);
      setRecommendations(recommendationsData);
      setProgress(progressData);
      
      logInfo('Learning data loaded successfully');
    } catch (error) {
      logError('Error loading learning data:', error);
      toast.error('Failed to load learning data', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  loadLearningData();
}, []);
```

---

### Issue #3: Competitive Intelligence Mock Data

**Current State:** Intelligence dashboard shows fake competitive insights

**File to Fix:** `app/dashboard/competitors/intelligence/page.tsx`

**Remediation Steps:**

1. **Create Real Intelligence API Endpoint:**

Create new file: `app/api/competitors/intelligence/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { getDb } from '@/lib/database-client';
import { competitiveAlerts, competitors } from '@/db/schema';
import { eq, and, desc, count, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest();
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const userId = authResult.user.id;

    // Get recent intelligence insights from competitive alerts
    const insights = await db
      .select({
        id: competitiveAlerts.id,
        type: competitiveAlerts.alertType,
        title: competitiveAlerts.title,
        description: competitiveAlerts.description,
        importance: competitiveAlerts.severity,
        confidence: competitiveAlerts.confidenceScore,
        source: competitiveAlerts.source,
        timestamp: competitiveAlerts.detectedAt,
        competitor: competitors.name,
        impact_score: competitiveAlerts.impactScore,
        action_required: competitiveAlerts.actionRequired,
        recommendations: competitiveAlerts.recommendations
      })
      .from(competitiveAlerts)
      .leftJoin(competitors, eq(competitiveAlerts.competitorId, competitors.id))
      .where(eq(competitiveAlerts.userId, userId))
      .orderBy(desc(competitiveAlerts.detectedAt))
      .limit(50);

    // Get intelligence statistics
    const stats = await getIntelligenceStats(db, userId);

    return NextResponse.json({
      success: true,
      insights,
      stats
    });
  } catch (error) {
    logError('Error fetching intelligence data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intelligence data' },
      { status: 500 }
    );
  }
}

async function getIntelligenceStats(db: any, userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalInsights, criticalAlerts, opportunities, threats] = await Promise.all([
    db.select({ count: count() })
      .from(competitiveAlerts)
      .where(eq(competitiveAlerts.userId, userId)),
    
    db.select({ count: count() })
      .from(competitiveAlerts)
      .where(
        and(
          eq(competitiveAlerts.userId, userId),
          eq(competitiveAlerts.severity, 'critical')
        )
      ),
    
    db.select({ count: count() })
      .from(competitiveAlerts)
      .where(
        and(
          eq(competitiveAlerts.userId, userId),
          eq(competitiveAlerts.alertType, 'opportunity')
        )
      ),
    
    db.select({ count: count() })
      .from(competitiveAlerts)
      .where(
        and(
          eq(competitiveAlerts.userId, userId),
          eq(competitiveAlerts.alertType, 'threat')
        )
      )
  ]);

  return {
    total_insights: totalInsights[0]?.count || 0,
    critical_alerts: criticalAlerts[0]?.count || 0,
    opportunities_identified: opportunities[0]?.count || 0,
    threats_monitored: threats[0]?.count || 0,
    market_trends_tracked: 0, // Implement based on your trend tracking
    competitive_moves_detected: 0 // Implement based on your move detection
  };
}
```

1. **Update Frontend to Use Real API:**

Replace lines 82-160 in `app/dashboard/competitors/intelligence/page.tsx`:

```typescript
useEffect(() => {
  const loadIntelligenceData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/competitors/intelligence');
      
      if (!response.ok) {
        throw new Error('Failed to fetch intelligence data');
      }

      const data = await response.json();
      
      setInsights(data.insights);
      setStats(data.stats);
      
      logInfo('Intelligence data loaded successfully');
    } catch (error) {
      logError('Error loading intelligence data:', error);
      toast.error('Failed to load intelligence data', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  loadIntelligenceData();
}, []);
```

---

### Issue #4: Calendar Integration Mock Events

**Current State:** Shows fake calendar events instead of real calendar data

**File to Fix:** `components/integrations/calendar-integration.tsx`

**Remediation Steps:**

1. **Install Calendar Integration Libraries:**

```bash
npm install @googleapis/calendar microsoft-graph-client
```

1. **Create OAuth Configuration Service:**

Create new file: `lib/calendar-oauth.ts`

```typescript
import { google } from '@googleapis/calendar';
import { Client } from '@microsoft/microsoft-graph-client';

export class CalendarOAuthService {
  // Google Calendar OAuth
  static getGoogleOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
  }

  // Microsoft Graph OAuth
  static getMicrosoftGraphClient(accessToken: string) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  // Generate OAuth URL for user authorization
  static getGoogleAuthUrl() {
    const oauth2Client = this.getGoogleOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });
  }

  // Exchange authorization code for tokens
  static async getGoogleTokens(code: string) {
    const oauth2Client = this.getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }
}
```

1. **Create Calendar API Service:**

Create new file: `lib/calendar-service.ts`

```typescript
import { google } from '@googleapis/calendar';
import { CalendarEvent } from '@/types/calendar';

export class CalendarService {
  // Fetch Google Calendar events
  static async fetchGoogleCalendarEvents(
    accessToken: string,
    refreshToken: string
  ): Promise<CalendarEvent[]> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return (response.data.items || []).map(event => ({
      id: event.id!,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      startTime: event.start?.dateTime || event.start?.date || '',
      endTime: event.end?.dateTime || event.end?.date || '',
      calendarId: 'primary',
      calendarName: 'Google Calendar',
      isRecurring: !!event.recurrence,
      attendees: event.attendees?.map(a => a.email!) || []
    }));
  }

  // Fetch Outlook Calendar events
  static async fetchOutlookCalendarEvents(
    accessToken: string
  ): Promise<CalendarEvent[]> {
    const client = Client.init({
      authProvider: (done) => done(null, accessToken)
    });

    const events = await client
      .api('/me/calendar/events')
      .select('subject,start,end,isAllDay,attendees,recurrence')
      .top(50)
      .get();

    return events.value.map((event: any) => ({
      id: event.id,
      title: event.subject,
      description: event.bodyPreview || '',
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      calendarId: 'outlook',
      calendarName: 'Outlook Calendar',
      isRecurring: !!event.recurrence,
      attendees: event.attendees?.map((a: any) => a.emailAddress.address) || []
    }));
  }
}
```

1. **Create Calendar API Endpoints:**

Create `app/api/calendar/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CalendarOAuthService } from '@/lib/calendar-oauth';

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (provider === 'google') {
      const authUrl = CalendarOAuthService.getGoogleAuthUrl();
      return NextResponse.json({ success: true, authUrl });
    }

    return NextResponse.json(
      { error: 'Unsupported provider' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
```

Create `app/api/calendar/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CalendarOAuthService } from '@/lib/calendar-oauth';
import { getDb } from '@/lib/database-client';
import { calendarConnections } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Contains userId

    if (!code || !state) {
      return NextResponse.redirect('/dashboard/integrations?error=missing_params');
    }

    // Exchange code for tokens
    const tokens = await CalendarOAuthService.getGoogleTokens(code);

    // Store tokens in database
    const db = getDb();
    await db.insert(calendarConnections).values({
      userId: state,
      provider: 'google',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600) * 1000)
    });

    return NextResponse.redirect('/dashboard/integrations?success=calendar_connected');
  } catch (error) {
    return NextResponse.redirect('/dashboard/integrations?error=oauth_failed');
  }
}
```

Create `app/api/calendar/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { getDb } from '@/lib/database-client';
import { calendarConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CalendarService } from '@/lib/calendar-service';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest();
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const connections = await db
      .select()
      .from(calendarConnections)
      .where(eq(calendarConnections.userId, authResult.user.id));

    let allEvents = [];

    for (const connection of connections) {
      try {
        if (connection.provider === 'google') {
          const events = await CalendarService.fetchGoogleCalendarEvents(
            connection.accessToken,
            connection.refreshToken
          );
          allEvents.push(...events);
        } else if (connection.provider === 'outlook') {
          const events = await CalendarService.fetchOutlookCalendarEvents(
            connection.accessToken
          );
          allEvents.push(...events);
        }
      } catch (error) {
        logError(`Failed to fetch ${connection.provider} calendar events:`, error);
      }
    }

    return NextResponse.json({ success: true, events: allEvents });
  } catch (error) {
    logError('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
```

1. **Update Calendar Integration Component:**

Replace `loadCalendarEvents()` function in `components/integrations/calendar-integration.tsx`:

```typescript
const loadCalendarEvents = async () => {
  if (!connected) return;
  
  try {
    setLoading(true);
    
    const response = await fetch('/api/calendar/events');
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    setEvents(data.events);
  } catch (error) {
    logError('Failed to load calendar events:', error);
    toast.error('Failed to load calendar events');
  } finally {
    setLoading(false);
  }
};
```

---

### Issue #5: Social Media Monitor Mock Data Fallback

**Current State:** Returns fake posts when API calls fail

**File to Fix:** `lib/social-media-monitor.ts`

**Remediation Steps:**

1. **Remove Mock Data Fallback:**

**Current code (Apr 2026):** LinkedIn data is fetched via **authorized APIs** using stored access tokens (see `fetchLinkedInCompanyPosts`, `transformLinkedInPosts`, and related methods in `src/lib/social-media-monitor.ts`). Legacy `scrapeLinkedInPosts(handle)` is a **stub that throws** (`Direct scraping not supported. Use monitorLinkedInActivity with userId.`) so callers cannot fall back to fake or scraped data.

If you are maintaining an older branch, replace any mock fallback with:

```typescript
private async scrapeLinkedInPosts(handle: string): Promise<SocialMediaPost[]> {
  throw new Error('Direct scraping not supported. Use monitorLinkedInActivity with userId.');
}
```

…and route LinkedIn monitoring through the token-based `fetchLinkedInCompanyPosts` / UGC and organization endpoints already implemented in the same file.

1. **Implement Real LinkedIn API Integration:**

```typescript
private async fetchLinkedInCompanyPosts(handle: string): Promise<SocialMediaPost[]> {
  try {
    const accessToken = await this.getLinkedInAccessToken();
    
    const response = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=urn:li:organization:${handle}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.elements.map((post: any) => ({
      id: post.id,
      platform: 'linkedin',
      content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      author: handle,
      authorFollowers: 0, // Fetch from company profile
      publishedAt: new Date(post.created.time),
      engagementMetrics: {
        likes: post.statistics?.numLikes || 0,
        comments: post.statistics?.numComments || 0,
        shares: post.statistics?.numShares || 0
      },
      url: `https://www.linkedin.com/feed/update/${post.id}/`,
      mediaType: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media ? 'image' : 'text'
    }));
  } catch (error) {
    logError('Error fetching LinkedIn posts:', error);
    throw error;
  }
}

private async getLinkedInAccessToken(): Promise<string> {
  // Implement OAuth 2.0 token retrieval
  // Store and refresh tokens as needed
  const db = getDb();
  const tokenRecord = await db
    .select()
    .from(socialMediaTokens)
    .where(eq(socialMediaTokens.platform, 'linkedin'))
    .limit(1);

  if (!tokenRecord[0] || isTokenExpired(tokenRecord[0])) {
    // Refresh token
    const newToken = await refreshLinkedInToken(tokenRecord[0]?.refreshToken);
    return newToken.access_token;
  }

  return tokenRecord[0].accessToken;
}
```

1. **Remove Mock Data Generator:**

Delete lines 754-765 and all references to `generateMockPosts()` function.

1. **Add Proper Error Handling:**

```typescript
// In the calling function, handle empty results gracefully
const posts = await this.scrapeLinkedInPosts(handle);

if (posts.length === 0) {
  // Log warning and notify user
  logWarn(`No social media data available for ${handle}`);
  
  // Store in database that scraping failed
  await db.insert(scrapingFailures).values({
    competitorHandle: handle,
    platform: 'linkedin',
    failureReason: 'No posts found or API unavailable',
    failedAt: new Date()
  });
  
  // Return empty result, not mock data
  return {
    posts: [],
    analysisAvailable: false,
    message: 'Social media data temporarily unavailable'
  };
}
```

---

### Issue #6: Revenue and MRR Tracking

**Current State:** Revenue and MRR always return 0

**File to Fix:** `lib/analytics.ts`

**Remediation Steps:**

1. **Create Revenue Tracking Service:**

Create new file: `lib/revenue-tracking.ts`

```typescript
import { getDb } from '@/lib/database-client';
import { subscriptions, payments } from '@/db/schema';
import { eq, and, gte, lte, sum, count } from 'drizzle-orm';

export class RevenueTrackingService {
  /**
   * Calculate Monthly Recurring Revenue
   */
  static async calculateMRR(): Promise<number> {
    const db = getDb();
    
    // Get all active subscriptions
    const activeSubscriptions = await db
      .select({
        plan: subscriptions.plan,
        billingCycle: subscriptions.billingCycle,
        amount: subscriptions.amount
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptions.cancelAtPeriodEnd, false)
        )
      );

    // Calculate MRR by normalizing all subscriptions to monthly
    let mrr = 0;
    
    for (const sub of activeSubscriptions) {
      if (sub.billingCycle === 'monthly') {
        mrr += sub.amount;
      } else if (sub.billingCycle === 'yearly') {
        // Convert annual to monthly
        mrr += sub.amount / 12;
      }
    }

    return Math.round(mrr * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate total revenue for a time period
   */
  static async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const db = getDb();
    
    const result = await db
      .select({ totalRevenue: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          eq(payments.status, 'succeeded'),
          gte(payments.createdAt, startDate),
          lte(payments.createdAt, endDate)
        )
      );

    return result[0]?.totalRevenue || 0;
  }

  /**
   * Get revenue breakdown by plan
   */
  static async getRevenueByPlan(startDate: Date, endDate: Date) {
    const db = getDb();
    
    return await db
      .select({
        plan: subscriptions.plan,
        revenue: sum(payments.amount),
        subscriptionCount: count()
      })
      .from(payments)
      .innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
      .where(
        and(
          eq(payments.status, 'succeeded'),
          gte(payments.createdAt, startDate),
          lte(payments.createdAt, endDate)
        )
      )
      .groupBy(subscriptions.plan);
  }

  /**
   * Calculate churn rate
   */
  static async calculateChurnRate(period: 'month' | 'quarter' = 'month'): Promise<number> {
    const db = getDb();
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    // Count active at start of period
    const activeAtStart = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lte(subscriptions.createdAt, startDate)
        )
      );

    // Count churned during period
    const churned = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'canceled'),
          gte(subscriptions.canceledAt, startDate),
          lte(subscriptions.canceledAt, now)
        )
      );

    const churnRate = (churned[0]?.count || 0) / (activeAtStart[0]?.count || 1);
    return Math.round(churnRate * 10000) / 100; // Percentage with 2 decimals
  }

  /**
   * Get revenue growth rate
   */
  static async calculateRevenueGrowth(): Promise<number> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthRevenue = await this.calculateRevenue(lastMonth, lastMonthEnd);
    const thisMonthRevenue = await this.calculateRevenue(thisMonth, now);

    if (lastMonthRevenue === 0) return 0;
    
    const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return Math.round(growth * 100) / 100;
  }
}
```

1. **Update Analytics Service:**

Replace lines 298-299 in `lib/analytics.ts`:

```typescript
import { RevenueTrackingService } from './revenue-tracking';

// Inside getBusinessMetrics() method:
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const mrr = await RevenueTrackingService.calculateMRR();
const revenue = await RevenueTrackingService.calculateRevenue(thirtyDaysAgo, new Date());

const businessMetrics = {
  activeUsers,
  newUsersToday,
  newUsersThisWeek,
  newUsersThisMonth,
  userRetentionRate,
  featureAdoptionRate,
  conversionRate,
  churnRate,
  revenue,
  mrr
};
```

1. **Create Stripe Webhook Handler for Revenue Tracking:**

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/database-client';
import { payments, subscriptions } from '@/db/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getDb();

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Record payment
      await db.insert(payments).values({
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: 'succeeded',
        subscriptionId: paymentIntent.metadata.subscriptionId,
        userId: paymentIntent.metadata.userId,
        createdAt: new Date(paymentIntent.created * 1000)
      });
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      
      await db.insert(subscriptions).values({
        stripeSubscriptionId: subscription.id,
        userId: subscription.metadata.userId,
        plan: subscription.metadata.plan,
        status: subscription.status,
        billingCycle: subscription.items.data[0].plan.interval as 'monthly' | 'yearly',
        amount: subscription.items.data[0].plan.amount / 100,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
      }).onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      
      await db.update(subscriptions)
        .set({
          status: 'canceled',
          canceledAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, deletedSubscription.id));
      break;
  }

  return NextResponse.json({ received: true });
}
```

1. **Add Database Schema for Payments:**

Add to `db/schema.ts` if not present:

```typescript
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripePaymentId: text('stripe_payment_id').notNull().unique(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'succeeded', 'failed', 'pending'
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

---

## Additional Recommendations

### Environment Variables Documentation

Create `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
GOOGLE_CALENDAR_REDIRECT_URI=https://yourdomain.com/api/calendar/callback

# LinkedIn API
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Analytics
GA_TRACKING_ID=G-XXXXXXXXXX
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# reCAPTCHA
RECAPTCHA_SECRET_KEY=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...

# Feature Flags
FEATURE_ENABLE_NOTIFICATIONS=true
FEATURE_ENABLE_SCRAPING=true
ENABLE_SESSION_CLEANUP=true
ENABLE_NOTIFICATION_PROCESSOR=true
ENABLE_AGENT_MESSAGE_PUMP=true

# Rate Limits
NOTIF_DAILY_CAP=500
SCRAPING_USER_HOURLY_CAP=20

# Internal
INTERNAL_API_KEY=your-internal-api-key
```

---

## Testing Checklist

After implementing fixes, test the following:

- [ ] Learning analytics API returns real data
- [ ] Learning dashboard displays user's actual progress
- [ ] Competitive intelligence shows real competitor insights
- [ ] Calendar integration connects to Google/Outlook
- [ ] Calendar events sync correctly
- [ ] Social media monitoring uses real APIs
- [ ] Revenue tracking calculates correct MRR
- [ ] Stripe webhooks update payment records
- [ ] No mock data fallbacks in production
- [ ] All environment variables documented
- [ ] Error handling shows appropriate messages
- [ ] Rate limiting works correctly
- [ ] Authentication required for all endpoints
- [ ] Data privacy and security maintained

---

## Deployment Validation

Before deploying to production:

1. Run full test suite: `npm test`
2. Run E2E tests: `npm run e2e`
3. Verify all environment variables are set
4. Test Stripe webhook integration in test mode
5. Verify calendar OAuth flows work end-to-end
6. Test social media API integrations with real accounts
7. Validate revenue calculations match Stripe dashboard
8. Load test critical endpoints
9. Security audit all API endpoints
10. Review error logging and monitoring setup

---

**Last Updated:** December 30, 2025
