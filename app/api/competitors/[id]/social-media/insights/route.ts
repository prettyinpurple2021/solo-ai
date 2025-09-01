import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { socialMediaAnalysisEngine } from '@/lib/social-media-analysis-engine';
import { db } from '@/db';
import { competitorProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().transform(Number)
});

const querySchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']).optional(),
  days: z.string().transform(Number).default(30),
  analysis_type: z.enum(['engagement', 'frequency', 'audience', 'campaigns', 'all']).default('all')
});

/**
 * GET /api/competitors/[id]/social-media/insights
 * Get advanced social media insights and analysis for a competitor
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

    // Generate insights based on analysis type
    const insights: any = {
      competitor: {
        id: competitor.id,
        name: competitor.name,
        social_media_handles: competitor.social_media_handles
      },
      analysis_period: {
        days,
        start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end_date: new Date()
      },
      platform_filter: platform || 'all'
    };

    // Run different types of analysis
    if (analysis_type === 'all' || analysis_type === 'engagement') {
      try {
        insights.engagement_patterns = await socialMediaAnalysisEngine.analyzeEngagementPatterns(
          competitorId,
          platform,
          days
        );
      } catch (error) {
        console.error('Error analyzing engagement patterns:', error);
        insights.engagement_patterns = [];
      }
    }

    if (analysis_type === 'all' || analysis_type === 'frequency') {
      try {
        insights.posting_frequency = await socialMediaAnalysisEngine.analyzePostingFrequency(
          competitorId,
          platform,
          days
        );
      } catch (error) {
        console.error('Error analyzing posting frequency:', error);
        insights.posting_frequency = [];
      }
    }

    if (analysis_type === 'all' || analysis_type === 'audience') {
      try {
        insights.audience_analysis = await socialMediaAnalysisEngine.analyzeAudience(
          competitorId,
          platform,
          days
        );
      } catch (error) {
        console.error('Error analyzing audience:', error);
        insights.audience_analysis = [];
      }
    }

    if (analysis_type === 'all' || analysis_type === 'campaigns') {
      try {
        insights.campaign_analysis = await socialMediaAnalysisEngine.analyzeCampaigns(
          competitorId,
          platform,
          days * 3 // Use longer period for campaign detection
        );
      } catch (error) {
        console.error('Error analyzing campaigns:', error);
        insights.campaign_analysis = [];
      }
    }

    // Generate summary insights
    insights.summary = generateSummaryInsights(insights);

    // Generate strategic recommendations
    insights.recommendations = generateStrategicRecommendations(insights);

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error generating social media insights:', error);
    
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
 * Generate summary insights from all analysis types
 */
function generateSummaryInsights(insights: any): any {
  const summary: any = {
    key_findings: [],
    performance_highlights: [],
    competitive_advantages: [],
    areas_for_improvement: [],
    overall_score: 0
  };

  let totalScore = 0;
  let scoreCount = 0;

  // Engagement insights
  if (insights.engagement_patterns && insights.engagement_patterns.length > 0) {
    const engagementData = insights.engagement_patterns[0];
    if (engagementData.patterns.timeOfDay.length > 0) {
      const bestTime = engagementData.patterns.timeOfDay[0];
      summary.key_findings.push(`Peak engagement at ${bestTime.hour}:00 with ${bestTime.avgEngagement.toFixed(0)} interactions`);
    }

    if (engagementData.patterns.contentType.length > 0) {
      const bestContent = engagementData.patterns.contentType[0];
      summary.performance_highlights.push(`${bestContent.type} content drives highest engagement`);
    }

    // Calculate engagement score (0-100)
    const avgEngagement = engagementData.patterns.timeOfDay.reduce((sum: number, pattern: any) => 
      sum + pattern.avgEngagement, 0) / engagementData.patterns.timeOfDay.length;
    const engagementScore = Math.min(100, (avgEngagement / 100) * 100);
    totalScore += engagementScore;
    scoreCount++;
  }

  // Frequency insights
  if (insights.posting_frequency && insights.posting_frequency.length > 0) {
    const frequencyData = insights.posting_frequency[0];
    summary.key_findings.push(`Posts ${frequencyData.frequency.daily.average.toFixed(1)} times daily with ${frequencyData.consistency.score}% consistency`);
    
    if (frequencyData.consistency.score < 70) {
      summary.areas_for_improvement.push('Inconsistent posting schedule');
    } else {
      summary.competitive_advantages.push('Consistent posting schedule');
    }

    totalScore += frequencyData.consistency.score;
    scoreCount++;
  }

  // Audience insights
  if (insights.audience_analysis && insights.audience_analysis.length > 0) {
    const audienceData = insights.audience_analysis[0];
    summary.key_findings.push(`Engagement rate: ${(audienceData.engagement.avgEngagementRate * 100).toFixed(1)}%`);
    
    if (audienceData.engagement.engagementTrend === 'growing') {
      summary.competitive_advantages.push('Growing audience engagement');
    } else if (audienceData.engagement.engagementTrend === 'declining') {
      summary.areas_for_improvement.push('Declining audience engagement');
    }

    // Estimate audience score
    const audienceScore = audienceData.engagement.avgEngagementRate * 1000; // Convert to 0-100 scale
    totalScore += Math.min(100, audienceScore);
    scoreCount++;
  }

  // Campaign insights
  if (insights.campaign_analysis && insights.campaign_analysis.length > 0) {
    const campaignData = insights.campaign_analysis[0];
    if (campaignData.campaigns.length > 0) {
      summary.key_findings.push(`${campaignData.campaigns.length} campaigns detected in analysis period`);
      
      const successfulCampaigns = campaignData.campaigns.filter((c: any) => c.success === 'high').length;
      if (successfulCampaigns > 0) {
        summary.competitive_advantages.push(`${successfulCampaigns} highly successful campaigns`);
      }
    }
  }

  // Calculate overall score
  summary.overall_score = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return summary;
}

/**
 * Generate strategic recommendations based on analysis
 */
function generateStrategicRecommendations(insights: any): any {
  const recommendations: any = {
    immediate_actions: [],
    strategic_moves: [],
    competitive_responses: [],
    content_strategy: [],
    timing_optimization: []
  };

  // Engagement-based recommendations
  if (insights.engagement_patterns && insights.engagement_patterns.length > 0) {
    const engagementData = insights.engagement_patterns[0];
    
    if (engagementData.patterns.timeOfDay.length > 0) {
      const bestTime = engagementData.patterns.timeOfDay[0];
      recommendations.timing_optimization.push(`Schedule posts at ${bestTime.hour}:00 for maximum engagement`);
    }

    if (engagementData.patterns.contentType.length > 0) {
      const bestContent = engagementData.patterns.contentType[0];
      recommendations.content_strategy.push(`Focus on ${bestContent.type} content to increase engagement`);
    }

    if (engagementData.patterns.hashtagPerformance.length > 0) {
      const topHashtags = engagementData.patterns.hashtagPerformance.slice(0, 3);
      recommendations.content_strategy.push(`Use high-performing hashtags: ${topHashtags.map((h: any) => h.hashtag).join(', ')}`);
    }
  }

  // Frequency-based recommendations
  if (insights.posting_frequency && insights.posting_frequency.length > 0) {
    const frequencyData = insights.posting_frequency[0];
    
    if (frequencyData.consistency.score < 70) {
      recommendations.immediate_actions.push('Improve posting consistency to build audience trust');
    }

    if (frequencyData.frequency.daily.average < 0.5) {
      recommendations.strategic_moves.push('Increase posting frequency to maintain audience attention');
    } else if (frequencyData.frequency.daily.average > 3) {
      recommendations.strategic_moves.push('Consider reducing posting frequency to avoid audience fatigue');
    }

    if (frequencyData.optimalTiming.bestDays.length > 0) {
      recommendations.timing_optimization.push(`Focus on ${frequencyData.optimalTiming.bestDays.join(' and ')} for better performance`);
    }
  }

  // Audience-based recommendations
  if (insights.audience_analysis && insights.audience_analysis.length > 0) {
    const audienceData = insights.audience_analysis[0];
    
    if (audienceData.engagement.engagementTrend === 'declining') {
      recommendations.immediate_actions.push('Address declining engagement with fresh content strategy');
    }

    if (audienceData.behavior.contentPreferences.length > 0) {
      recommendations.content_strategy.push(`Align content with audience preferences: ${audienceData.behavior.contentPreferences.join(', ')}`);
    }
  }

  // Campaign-based recommendations
  if (insights.campaign_analysis && insights.campaign_analysis.length > 0) {
    const campaignData = insights.campaign_analysis[0];
    
    if (campaignData.campaignTypes.length > 0) {
      const bestCampaignType = campaignData.campaignTypes.reduce((best: any, current: any) => 
        current.successRate > best.successRate ? current : best
      );
      recommendations.strategic_moves.push(`Focus on ${bestCampaignType.type} campaigns (${bestCampaignType.successRate}% success rate)`);
    }

    if (campaignData.campaigns.length === 0) {
      recommendations.competitive_responses.push('Competitor lacks structured campaign approach - opportunity for differentiation');
    }
  }

  // General competitive recommendations
  recommendations.competitive_responses.push('Monitor competitor posting patterns to identify content gaps');
  recommendations.competitive_responses.push('Analyze competitor engagement drops for counter-positioning opportunities');

  return recommendations;
}