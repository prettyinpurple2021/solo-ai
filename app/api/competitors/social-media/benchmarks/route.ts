import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { socialMediaAnalysisEngine } from '@/lib/social-media-analysis-engine';
import { db } from '@/db';
import { competitorProfiles } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  competitor_ids: z.string().transform(str => str.split(',').map(Number)),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']).optional(),
  days: z.coerce.number().default(30),
  metrics: z.string().default('engagement,frequency,reach,sentiment').transform(str => str.split(','))
});

/**
 * GET /api/competitors/social-media/benchmarks
 * Generate competitive benchmarking analysis across multiple competitors
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const { user, error } = await authenticateRequest();
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate query parameters
    const url = new URL(request.url);
    const { competitor_ids, platform, days, metrics } = querySchema.parse({
      competitor_ids: url.searchParams.get('competitor_ids') || '',
      platform: url.searchParams.get('platform'),
      days: url.searchParams.get('days') || '30',
      metrics: url.searchParams.get('metrics') || 'engagement,frequency,reach,sentiment'
    });

    if (competitor_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one competitor ID is required' },
        { status: 400 }
      );
    }

    if (competitor_ids.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 competitors allowed for benchmarking' },
        { status: 400 }
      );
    }

    // Verify all competitors exist and belong to user
    const competitors = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          inArray(competitorProfiles.id, competitor_ids),
          eq(competitorProfiles.user_id, user.id)
        )
      );

    if (competitors.length !== competitor_ids.length) {
      const foundIds = competitors.map(c => c.id);
      const missingIds = competitor_ids.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        {
          error: 'Some competitors not found or not accessible',
          missing_competitor_ids: missingIds
        },
        { status: 404 }
      );
    }

    // Generate competitive benchmarks
    const benchmarks = await socialMediaAnalysisEngine.createCompetitiveBenchmarks(
      competitor_ids,
      platform,
      days
    );

    // Process and enhance the benchmark data
    const processedBenchmarks = await processBenchmarkData(benchmarks, competitors, metrics);

    // Generate comparative insights
    const comparativeInsights = generateComparativeInsights(processedBenchmarks);

    // Generate strategic recommendations
    const strategicRecommendations = generateStrategicRecommendations(processedBenchmarks);

    return NextResponse.json({
      success: true,
      data: {
        analysis_period: {
          days,
          start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          end_date: new Date()
        },
        platform_filter: platform || 'all',
        metrics_analyzed: metrics,
        competitors: competitors.map(c => ({
          id: c.id,
          name: c.name,
          threat_level: c.threat_level,
          social_media_handles: c.social_media_handles
        })),
        benchmarks: processedBenchmarks,
        comparative_insights: comparativeInsights,
        strategic_recommendations: strategicRecommendations,
        summary: generateBenchmarkSummary(processedBenchmarks)
      }
    });

  } catch (error) {
    logError('Error generating competitive benchmarks:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors },
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
 * POST /api/competitors/social-media/benchmarks
 * Create a custom benchmark analysis with specific parameters
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const { user, error } = await authenticateRequest();
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const requestSchema = z.object({
      competitor_ids: z.array(z.number()).min(1).max(10),
      platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']).optional(),
      days: z.number().min(7).max(365).default(30),
      metrics: z.array(z.enum(['engagement', 'frequency', 'reach', 'sentiment', 'growth'])).default(['engagement', 'frequency']),
      benchmark_type: z.enum(['performance', 'content', 'timing', 'audience']).default('performance'),
      include_industry_averages: z.boolean().default(false)
    });

    const {
      competitor_ids,
      platform,
      days,
      metrics,
      benchmark_type,
      include_industry_averages
    } = requestSchema.parse(body);

    // Verify competitors exist and belong to user
    const competitors = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          inArray(competitorProfiles.id, competitor_ids),
          eq(competitorProfiles.user_id, user.id)
        )
      );

    if (competitors.length !== competitor_ids.length) {
      return NextResponse.json(
        { error: 'Some competitors not found or not accessible' },
        { status: 404 }
      );
    }

    // Generate custom benchmarks based on type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let benchmarkResults: any;

    switch (benchmark_type) {
      case 'performance':
        benchmarkResults = await generatePerformanceBenchmarks(competitor_ids, platform, days, metrics);
        break;
      case 'content':
        benchmarkResults = await generateContentBenchmarks(competitor_ids, platform, days);
        break;
      case 'timing':
        benchmarkResults = await generateTimingBenchmarks(competitor_ids, platform, days);
        break;
      case 'audience':
        benchmarkResults = await generateAudienceBenchmarks(competitor_ids, platform, days);
        break;
      default:
        benchmarkResults = await generatePerformanceBenchmarks(competitor_ids, platform, days, metrics);
    }

    // Include industry averages if requested
    if (include_industry_averages) {
      benchmarkResults.industry_averages = await getIndustryAverages(competitors[0].industry || '', platform);
    }

    return NextResponse.json({
      success: true,
      data: {
        benchmark_type,
        analysis_period: { days, start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000), end_date: new Date() },
        platform_filter: platform || 'all',
        metrics_analyzed: metrics,
        competitors: competitors.map(c => ({ id: c.id, name: c.name, threat_level: c.threat_level })),
        results: benchmarkResults
      }
    });

  } catch (error) {
    logError('Error creating custom benchmark:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBenchmarkData(benchmarks: any[], competitors: any[], metrics: string[]) {
  return benchmarks.map(benchmark => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const competitor = competitors.find((c: any) => c.id === benchmark.competitorId);

    return {
      competitor: {
        id: competitor.id,
        name: competitor.name,
        threat_level: competitor.threat_level
      },
      platform: benchmark.platform,
      metrics: filterMetrics(benchmark.benchmarks, metrics),
      positioning: benchmark.positioning,
      comparisons: benchmark.comparison,
      insights: benchmark.insights,
      recommendations: benchmark.recommendations,
      analyzed_at: benchmark.analyzedAt
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterMetrics(benchmarks: any, requestedMetrics: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered: any = {};

  requestedMetrics.forEach(metric => {
    if (benchmarks[metric]) {
      filtered[metric] = benchmarks[metric];
    }
  });

  return filtered;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateComparativeInsights(benchmarks: any[]) {
  const insights = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    top_performers: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    underperformers: [] as any[],
    key_differentiators: [] as string[],
    market_trends: [] as string[]
  };

  if (benchmarks.length === 0) return insights;

  // Group by platform for comparison
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformGroups: Record<string, any[]> = {};
  benchmarks.forEach(benchmark => {
    if (!platformGroups[benchmark.platform]) {
      platformGroups[benchmark.platform] = [];
    }
    platformGroups[benchmark.platform].push(benchmark);
  });

  // Analyze each platform
  Object.entries(platformGroups).forEach(([platform, platformBenchmarks]) => {
    // Find top performers
    const sortedByEngagement = platformBenchmarks.sort((a, b) =>
      (b.metrics.engagement?.value || 0) - (a.metrics.engagement?.value || 0)
    );

    if (sortedByEngagement.length > 0) {
      insights.top_performers.push({
        platform,
        competitor: sortedByEngagement[0].competitor,
        metric: 'engagement',
        value: sortedByEngagement[0].metrics.engagement?.value || 0
      });
    }

    // Identify underperformers (bottom 25%)
    const bottomQuartile = Math.ceil(sortedByEngagement.length * 0.25);
    const underperformers = sortedByEngagement.slice(-bottomQuartile);

    underperformers.forEach(underperformer => {
      insights.underperformers.push({
        platform,
        competitor: underperformer.competitor,
        areas: underperformer.positioning.weaknesses || []
      });
    });

    // Identify key differentiators
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strengths = platformBenchmarks.flatMap((b: any) => b.positioning.strengths || []);
    const strengthCounts: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strengths.forEach((strength: any) => {
      strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
    });

    const commonStrengths = Object.entries(strengthCounts)
      .filter(([_, count]) => count > 1)
      .map(([strength]) => strength);

    insights.key_differentiators.push(...commonStrengths);
  });

  // Generate market trends
  insights.market_trends.push('Social media engagement varies significantly by platform');
  if (insights.top_performers.length > 0) {
    const topPlatform = insights.top_performers[0].platform;
    insights.market_trends.push(`${topPlatform} shows highest competitive activity`);
  }

  return insights;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateStrategicRecommendations(benchmarks: any[]) {
  const recommendations = {
    immediate_actions: [] as string[],
    strategic_initiatives: [] as string[],
    competitive_moves: [] as string[],
    platform_specific: {} as Record<string, string[]>
  };

  benchmarks.forEach(benchmark => {
    const platform = benchmark.platform;

    if (!recommendations.platform_specific[platform]) {
      recommendations.platform_specific[platform] = [];
    }

    // Add platform-specific recommendations
    if (benchmark.recommendations && benchmark.recommendations.length > 0) {
      recommendations.platform_specific[platform].push(...benchmark.recommendations);
    }

    // Generate strategic recommendations based on positioning
    if (benchmark.positioning.rank > benchmark.positioning.totalCompetitors * 0.7) {
      recommendations.immediate_actions.push(`Improve ${platform} performance - currently ranked ${benchmark.positioning.rank}/${benchmark.positioning.totalCompetitors}`);
    }

    if (benchmark.positioning.opportunities.length > 0) {
      recommendations.strategic_initiatives.push(...benchmark.positioning.opportunities.map((opp: string) => `${platform}: ${opp}`));
    }

    // Competitive moves based on comparisons
    if (benchmark.comparisons && benchmark.comparisons.length > 0) {
      const topCompetitor = benchmark.comparisons[0];
      if (topCompetitor.advantages.length > 0) {
        recommendations.competitive_moves.push(`Counter ${topCompetitor.competitorName}'s advantages on ${platform}: ${topCompetitor.advantages.join(', ')}`);
      }
    }
  });

  // Remove duplicates
  recommendations.immediate_actions = [...new Set(recommendations.immediate_actions)];
  recommendations.strategic_initiatives = [...new Set(recommendations.strategic_initiatives)];
  recommendations.competitive_moves = [...new Set(recommendations.competitive_moves)];

  return recommendations;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateBenchmarkSummary(benchmarks: any[]) {
  const summary = {
    total_competitors: benchmarks.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    platforms_analyzed: [...new Set(benchmarks.map((b: any) => b.platform))],
    avg_market_position: 0,
    top_performing_platform: '',
    key_insights: [] as string[]
  };

  if (benchmarks.length === 0) return summary;

  // Calculate average market position
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const positions = benchmarks.map((b: any) => b.positioning.rank / b.positioning.totalCompetitors);
  summary.avg_market_position = Math.round((positions.reduce((sum: number, pos: number) => sum + pos, 0) / positions.length) * 100);

  // Find top performing platform
  const platformPerformance: Record<string, number> = {};
  benchmarks.forEach(benchmark => {
    const engagementValue = benchmark.metrics.engagement?.value || 0;
    platformPerformance[benchmark.platform] = (platformPerformance[benchmark.platform] || 0) + engagementValue;
  });

  const topPlatform = Object.entries(platformPerformance).reduce((top, [platform, value]) =>
    value > top[1] ? [platform, value] : top
  );
  summary.top_performing_platform = topPlatform[0];

  // Generate key insights
  summary.key_insights.push(`Analyzed ${summary.total_competitors} competitors across ${summary.platforms_analyzed.length} platforms`);
  summary.key_insights.push(`Average market position: ${summary.avg_market_position}th percentile`);
  summary.key_insights.push(`Strongest performance on ${summary.top_performing_platform}`);

  return summary;
}

// Placeholder functions for different benchmark types
async function generatePerformanceBenchmarks(_competitorIds: number[], _platform?: string, _days: number = 30, metrics: string[] = []) {
  // Implementation for performance benchmarks
  return {
    type: 'performance',
    metrics: metrics,
    data: []
  };
}

async function generateContentBenchmarks(_competitorIds: number[], _platform?: string, _days: number = 30) {
  // Implementation for content benchmarks
  return {
    type: 'content',
    data: []
  };
}

async function generateTimingBenchmarks(_competitorIds: number[], _platform?: string, _days: number = 30) {
  // Implementation for timing benchmarks
  return {
    type: 'timing',
    data: []
  };
}

async function generateAudienceBenchmarks(_competitorIds: number[], _platform?: string, _days: number = 30) {
  // Implementation for audience benchmarks
  return {
    type: 'audience',
    data: []
  };
}

async function getIndustryAverages(_industry?: string, _platform?: string) {
  // Implementation for industry averages
  // In a real implementation, this would fetch from industry benchmark databases
  return {
    engagement_rate: 0.03,
    posting_frequency: 1.2,
    follower_growth_rate: 0.05,
    sentiment_score: 0.1
  };
}