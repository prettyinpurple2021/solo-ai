import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { db } from '@/db';
import { competitorProfiles, intelligenceData } from '@/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().transform(Number)
});

const querySchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']).optional(),
  days: z.string().transform(Number).default(30),
  analysis_type: z.enum(['engagement', 'sentiment', 'content', 'frequency', 'all']).default('all')
});

/**
 * GET /api/competitors/[id]/social-media/analysis
 * Get comprehensive social media analysis for a competitor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate params
    const { id: competitorId } = paramsSchema.parse(params);
    
    // Validate query parameters
    const url = new URL(request.url);
    const { platform, days, analysis_type } = querySchema.parse({
      platform: url.searchParams.get('platform'),
      days: url.searchParams.get('days') || '30',
      analysis_type: url.searchParams.get('analysis_type') || 'all'
    });

    // Verify competitor exists and belongs to user
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Calculate date range
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build query conditions
    let whereConditions = and(
      eq(intelligenceData.competitor_id, competitorId),
      eq(intelligenceData.user_id, authResult.user.id),
      eq(intelligenceData.source_type, 'social_media'),
      gte(intelligenceData.collected_at, dateThreshold)
    );

    if (platform) {
      whereConditions = and(
        whereConditions,
        eq(intelligenceData.data_type, `${platform}_analysis`)
      );
    }

    // Fetch social media intelligence data
    const socialMediaData = await db
      .select()
      .from(intelligenceData)
      .where(whereConditions)
      .orderBy(desc(intelligenceData.collected_at));

    if (socialMediaData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          competitor: {
            id: competitor.id,
            name: competitor.name
          },
          analysis: {
            summary: 'No social media data available for the specified period',
            platforms: [],
            date_range: { start: dateThreshold, end: new Date(), days }
          }
        }
      });
    }

    // Process and analyze the data
    const analysis = await generateSocialMediaAnalysis(socialMediaData, analysis_type, platform);

    return NextResponse.json({
      success: true,
      data: {
        competitor: {
          id: competitor.id,
          name: competitor.name,
          social_media_handles: competitor.social_media_handles
        },
        analysis: {
          ...analysis,
          date_range: { start: dateThreshold, end: new Date(), days },
          data_points: socialMediaData.length
        }
      }
    });

  } catch (error) {
    console.error('Error generating social media analysis:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate comprehensive social media analysis from intelligence data
 */
async function generateSocialMediaAnalysis(
  data: any[],
  analysisType: string,
  platform?: string
) {
  const platformData: Record<string, any[]> = {};
  
  // Group data by platform
  data.forEach(item => {
    const platformName = item.data_type?.replace('_analysis', '') || 'unknown';
    if (!platformData[platformName]) {
      platformData[platformName] = [];
    }
    platformData[platformName].push(item);
  });

  const analysis: any = {
    platforms: Object.keys(platformData),
    platform_count: Object.keys(platformData).length
  };

  // Generate analysis based on type
  if (analysisType === 'all' || analysisType === 'engagement') {
    analysis.engagement_analysis = generateEngagementAnalysis(platformData);
  }

  if (analysisType === 'all' || analysisType === 'sentiment') {
    analysis.sentiment_analysis = generateSentimentAnalysis(platformData);
  }

  if (analysisType === 'all' || analysisType === 'content') {
    analysis.content_analysis = generateContentAnalysis(platformData);
  }

  if (analysisType === 'all' || analysisType === 'frequency') {
    analysis.frequency_analysis = generateFrequencyAnalysis(platformData);
  }

  // Generate summary insights
  analysis.summary = generateSummaryInsights(platformData, analysis);

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
}

function generateEngagementAnalysis(platformData: Record<string, any[]>) {
  const engagement: any = {
    by_platform: {},
    overall: {
      total_posts: 0,
      total_engagement: 0,
      avg_engagement_rate: 0
    },
    top_performing_platforms: [],
    engagement_trends: []
  };

  let totalPosts = 0;
  let totalEngagement = 0;

  Object.entries(platformData).forEach(([platform, items]) => {
    let platformPosts = 0;
    let platformEngagement = 0;
    let platformEngagementRate = 0;

    items.forEach(item => {
      const extractedData = item.extracted_data || {};
      const posts = item.raw_content || [];
      
      if (Array.isArray(posts)) {
        platformPosts += posts.length;
        
        posts.forEach((post: any) => {
          if (post.engagement) {
            const postEngagement = (post.engagement.likes || 0) + 
                                 (post.engagement.shares || 0) + 
                                 (post.engagement.comments || 0);
            platformEngagement += postEngagement;
          }
        });
      }

      if (extractedData.audienceInsights?.engagementRate) {
        platformEngagementRate += extractedData.audienceInsights.engagementRate;
      }
    });

    const avgEngagementRate = items.length > 0 ? platformEngagementRate / items.length : 0;

    engagement.by_platform[platform] = {
      posts: platformPosts,
      total_engagement: platformEngagement,
      avg_engagement_per_post: platformPosts > 0 ? platformEngagement / platformPosts : 0,
      engagement_rate: avgEngagementRate
    };

    totalPosts += platformPosts;
    totalEngagement += platformEngagement;
  });

  engagement.overall = {
    total_posts: totalPosts,
    total_engagement: totalEngagement,
    avg_engagement_per_post: totalPosts > 0 ? totalEngagement / totalPosts : 0
  };

  // Sort platforms by engagement
  engagement.top_performing_platforms = Object.entries(engagement.by_platform)
    .sort((a: any, b: any) => b[1].total_engagement - a[1].total_engagement)
    .slice(0, 3)
    .map(([platform, data]: any) => ({ platform, ...data }));

  return engagement;
}

function generateSentimentAnalysis(platformData: Record<string, any[]>) {
  const sentiment: any = {
    by_platform: {},
    overall: {
      score: 0,
      label: 'neutral',
      confidence: 0
    },
    trends: [],
    sentiment_distribution: {
      positive: 0,
      neutral: 0,
      negative: 0
    }
  };

  let totalScore = 0;
  let totalConfidence = 0;
  let totalItems = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  Object.entries(platformData).forEach(([platform, items]) => {
    let platformScore = 0;
    let platformConfidence = 0;
    let platformItems = 0;

    items.forEach(item => {
      const extractedData = item.extracted_data || {};
      if (extractedData.sentiment?.overall) {
        const sentimentData = extractedData.sentiment.overall;
        platformScore += sentimentData.score || 0;
        platformConfidence += sentimentData.confidence || 0;
        platformItems++;

        // Count sentiment labels
        switch (sentimentData.label) {
          case 'positive':
            positiveCount++;
            break;
          case 'negative':
            negativeCount++;
            break;
          default:
            neutralCount++;
        }
      }
    });

    if (platformItems > 0) {
      const avgScore = platformScore / platformItems;
      sentiment.by_platform[platform] = {
        score: avgScore,
        confidence: platformConfidence / platformItems,
        label: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
        data_points: platformItems
      };

      totalScore += platformScore;
      totalConfidence += platformConfidence;
      totalItems += platformItems;
    }
  });

  if (totalItems > 0) {
    const overallScore = totalScore / totalItems;
    sentiment.overall = {
      score: overallScore,
      confidence: totalConfidence / totalItems,
      label: overallScore > 0.1 ? 'positive' : overallScore < -0.1 ? 'negative' : 'neutral'
    };
  }

  const totalSentimentItems = positiveCount + neutralCount + negativeCount;
  if (totalSentimentItems > 0) {
    sentiment.sentiment_distribution = {
      positive: Math.round((positiveCount / totalSentimentItems) * 100),
      neutral: Math.round((neutralCount / totalSentimentItems) * 100),
      negative: Math.round((negativeCount / totalSentimentItems) * 100)
    };
  }

  return sentiment;
}

function generateContentAnalysis(platformData: Record<string, any[]>) {
  const content: any = {
    themes: {},
    top_themes: [],
    content_types: {},
    hashtag_analysis: {},
    posting_patterns: {}
  };

  const allThemes: Record<string, { count: number; engagement: number; platforms: Set<string> }> = {};
  const allHashtags: Record<string, number> = {};

  Object.entries(platformData).forEach(([platform, items]) => {
    items.forEach(item => {
      const extractedData = item.extracted_data || {};
      
      // Analyze content themes
      if (extractedData.contentThemes) {
        extractedData.contentThemes.forEach((theme: any) => {
          if (!allThemes[theme.theme]) {
            allThemes[theme.theme] = { count: 0, engagement: 0, platforms: new Set() };
          }
          allThemes[theme.theme].count += theme.frequency || 0;
          allThemes[theme.theme].engagement += theme.avgEngagement || 0;
          allThemes[theme.theme].platforms.add(platform);
        });
      }

      // Analyze hashtags from posts
      const posts = item.raw_content || [];
      if (Array.isArray(posts)) {
        posts.forEach((post: any) => {
          if (post.hashtags) {
            post.hashtags.forEach((hashtag: string) => {
              allHashtags[hashtag] = (allHashtags[hashtag] || 0) + 1;
            });
          }
        });
      }
    });
  });

  // Process themes
  content.top_themes = Object.entries(allThemes)
    .sort((a: any, b: any) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([theme, data]: any) => ({
      theme,
      frequency: data.count,
      avg_engagement: data.engagement / data.count,
      platforms: Array.from(data.platforms)
    }));

  // Process hashtags
  content.hashtag_analysis = {
    top_hashtags: Object.entries(allHashtags)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 20)
      .map(([hashtag, count]) => ({ hashtag, count })),
    total_unique_hashtags: Object.keys(allHashtags).length
  };

  return content;
}

function generateFrequencyAnalysis(platformData: Record<string, any[]>) {
  const frequency: any = {
    by_platform: {},
    overall_patterns: {
      peak_days: [],
      peak_hours: [],
      avg_posts_per_day: 0
    }
  };

  const allPeakDays: Record<string, number> = {};
  const allPeakHours: Record<string, number> = {};
  let totalDailyFreq = 0;
  let platformCount = 0;

  Object.entries(platformData).forEach(([platform, items]) => {
    let platformDailyFreq = 0;
    let platformWeeklyFreq = 0;
    let platformMonthlyFreq = 0;
    const platformPeakDays: string[] = [];
    const platformPeakHours: string[] = [];

    items.forEach(item => {
      const extractedData = item.extracted_data || {};
      if (extractedData.postingFrequency) {
        const freq = extractedData.postingFrequency;
        platformDailyFreq += freq.daily || 0;
        platformWeeklyFreq += freq.weekly || 0;
        platformMonthlyFreq += freq.monthly || 0;
        
        if (freq.peakDays) platformPeakDays.push(...freq.peakDays);
        if (freq.peakHours) platformPeakHours.push(...freq.peakHours);
      }
    });

    if (items.length > 0) {
      frequency.by_platform[platform] = {
        avg_daily: platformDailyFreq / items.length,
        avg_weekly: platformWeeklyFreq / items.length,
        avg_monthly: platformMonthlyFreq / items.length,
        peak_days: [...new Set(platformPeakDays)],
        peak_hours: [...new Set(platformPeakHours)]
      };

      totalDailyFreq += platformDailyFreq / items.length;
      platformCount++;

      // Aggregate peak times
      platformPeakDays.forEach(day => {
        allPeakDays[day] = (allPeakDays[day] || 0) + 1;
      });
      platformPeakHours.forEach(hour => {
        allPeakHours[hour] = (allPeakHours[hour] || 0) + 1;
      });
    }
  });

  frequency.overall_patterns = {
    avg_posts_per_day: platformCount > 0 ? totalDailyFreq / platformCount : 0,
    peak_days: Object.entries(allPeakDays)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day),
    peak_hours: Object.entries(allPeakHours)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour)
  };

  return frequency;
}

function generateSummaryInsights(platformData: Record<string, any[]>, analysis: any) {
  const insights: string[] = [];
  const platforms = Object.keys(platformData);

  // Platform insights
  if (platforms.length > 1) {
    insights.push(`Active on ${platforms.length} social media platforms: ${platforms.join(', ')}`);
  } else if (platforms.length === 1) {
    insights.push(`Primarily active on ${platforms[0]}`);
  }

  // Engagement insights
  if (analysis.engagement_analysis) {
    const topPlatform = analysis.engagement_analysis.top_performing_platforms[0];
    if (topPlatform) {
      insights.push(`Highest engagement on ${topPlatform.platform} with ${topPlatform.total_engagement} total interactions`);
    }
  }

  // Sentiment insights
  if (analysis.sentiment_analysis) {
    const sentiment = analysis.sentiment_analysis.overall;
    insights.push(`Overall sentiment is ${sentiment.label} (score: ${sentiment.score.toFixed(2)})`);
  }

  // Content insights
  if (analysis.content_analysis?.top_themes?.length > 0) {
    const topTheme = analysis.content_analysis.top_themes[0];
    insights.push(`Most discussed topic: ${topTheme.theme} (${topTheme.frequency} mentions)`);
  }

  // Frequency insights
  if (analysis.frequency_analysis) {
    const avgDaily = analysis.frequency_analysis.overall_patterns.avg_posts_per_day;
    if (avgDaily > 1) {
      insights.push(`Posts ${avgDaily.toFixed(1)} times per day on average`);
    } else if (avgDaily > 0.5) {
      insights.push(`Posts approximately every other day`);
    } else {
      insights.push(`Posts infrequently (${avgDaily.toFixed(1)} times per day)`);
    }
  }

  return insights;
}

function generateRecommendations(analysis: any) {
  const recommendations: Array<{ type: string; priority: string; action: string; rationale: string }> = [];

  // Engagement recommendations
  if (analysis.engagement_analysis) {
    const topPlatform = analysis.engagement_analysis.top_performing_platforms[0];
    if (topPlatform) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        action: `Focus competitive response on ${topPlatform.platform}`,
        rationale: `Competitor has highest engagement (${topPlatform.total_engagement} interactions) on this platform`
      });
    }
  }

  // Content recommendations
  if (analysis.content_analysis?.top_themes?.length > 0) {
    const topTheme = analysis.content_analysis.top_themes[0];
    recommendations.push({
      type: 'content',
      priority: 'medium',
      action: `Create content around ${topTheme.theme}`,
      rationale: `Competitor frequently discusses this topic with good engagement`
    });
  }

  // Sentiment recommendations
  if (analysis.sentiment_analysis) {
    const sentiment = analysis.sentiment_analysis.overall;
    if (sentiment.label === 'negative') {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        action: 'Capitalize on competitor\'s negative sentiment',
        rationale: `Competitor has negative overall sentiment (${sentiment.score.toFixed(2)})`
      });
    }
  }

  // Frequency recommendations
  if (analysis.frequency_analysis) {
    const peakDays = analysis.frequency_analysis.overall_patterns.peak_days;
    if (peakDays.length > 0) {
      recommendations.push({
        type: 'timing',
        priority: 'low',
        action: `Consider posting on ${peakDays.join(', ')} to compete for attention`,
        rationale: 'These are competitor\'s most active posting days'
      });
    }
  }

  return recommendations;
}