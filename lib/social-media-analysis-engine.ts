import { db } from '@/db';
import { intelligenceData, competitorProfiles } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import type { SocialMediaPost, EngagementMetrics, SentimentScore } from './social-media-monitor';

// Analysis result interfaces
export interface EngagementPatternAnalysis {
  platform: string;
  competitorId: number;
  patterns: {
    timeOfDay: EngagementTimePattern[];
    dayOfWeek: EngagementDayPattern[];
    contentType: ContentTypePattern[];
    hashtagPerformance: HashtagPattern[];
  };
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface EngagementTimePattern {
  hour: number;
  avgEngagement: number;
  postCount: number;
  engagementRate: number;
  bestContent: string[];
}

export interface EngagementDayPattern {
  day: string;
  avgEngagement: number;
  postCount: number;
  engagementRate: number;
  peakHours: number[];
}

export interface ContentTypePattern {
  type: 'text' | 'image' | 'video' | 'link' | 'carousel';
  count: number;
  avgEngagement: number;
  engagementRate: number;
  examples: string[];
}

export interface HashtagPattern {
  hashtag: string;
  usage: number;
  avgEngagement: number;
  engagementBoost: number;
  relatedHashtags: string[];
}

export interface PostingFrequencyAnalysis {
  platform: string;
  competitorId: number;
  frequency: {
    daily: FrequencyMetrics;
    weekly: FrequencyMetrics;
    monthly: FrequencyMetrics;
  };
  consistency: {
    score: number; // 0-100
    pattern: 'regular' | 'irregular' | 'sporadic' | 'burst';
    gaps: DateGap[];
  };
  optimalTiming: {
    bestDays: string[];
    bestHours: number[];
    worstDays: string[];
    worstHours: number[];
  };
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface FrequencyMetrics {
  average: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface DateGap {
  start: Date;
  end: Date;
  duration: number; // days
  possibleReason?: string;
}

export interface AudienceAnalysis {
  platform: string;
  competitorId: number;
  engagement: {
    totalReach: number;
    avgEngagementRate: number;
    engagementTrend: 'growing' | 'declining' | 'stable';
    topEngagers: string[];
  };
  demographics: {
    estimatedAgeGroups: Record<string, number>;
    estimatedGender: Record<string, number>;
    estimatedLocations: Record<string, number>;
    professionalBackground: string[];
  };
  behavior: {
    peakActivityTimes: string[];
    contentPreferences: string[];
    interactionTypes: Record<string, number>;
    loyaltyScore: number; // 0-100
  };
  growth: {
    followerGrowthRate: number;
    engagementGrowthRate: number;
    contentGrowthRate: number;
  };
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface SocialMediaCampaignAnalysis {
  platform: string;
  competitorId: number;
  campaigns: DetectedCampaign[];
  campaignTypes: CampaignTypeAnalysis[];
  performance: CampaignPerformanceMetrics;
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface DetectedCampaign {
  id: string;
  name: string;
  type: 'product_launch' | 'brand_awareness' | 'engagement' | 'recruitment' | 'event' | 'seasonal';
  startDate: Date;
  endDate?: Date;
  posts: SocialMediaPost[];
  performance: {
    totalEngagement: number;
    avgEngagementRate: number;
    reach: number;
    impressions: number;
  };
  content: {
    themes: string[];
    hashtags: string[];
    mentions: string[];
    mediaTypes: string[];
  };
  success: 'high' | 'medium' | 'low';
}

export interface CampaignTypeAnalysis {
  type: string;
  frequency: number;
  avgDuration: number;
  avgPerformance: number;
  successRate: number;
  bestPractices: string[];
}

export interface CampaignPerformanceMetrics {
  totalCampaigns: number;
  avgCampaignDuration: number;
  avgCampaignEngagement: number;
  mostSuccessfulType: string;
  leastSuccessfulType: string;
  seasonalTrends: Record<string, number>;
}

export interface CompetitiveBenchmarkingMetrics {
  competitorId: number;
  platform: string;
  benchmarks: {
    engagement: BenchmarkMetric;
    frequency: BenchmarkMetric;
    reach: BenchmarkMetric;
    sentiment: BenchmarkMetric;
  };
  positioning: {
    rank: number;
    totalCompetitors: number;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  comparison: CompetitorComparison[];
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface BenchmarkMetric {
  value: number;
  percentile: number;
  industryAverage: number;
  trend: 'above' | 'below' | 'at' | 'unknown';
}

export interface CompetitorComparison {
  competitorId: number;
  competitorName: string;
  metrics: {
    engagement: number;
    frequency: number;
    reach: number;
    sentiment: number;
  };
  advantages: string[];
  disadvantages: string[];
}

/**
 * Social Media Analysis Engine
 * Provides advanced analytics and insights for competitor social media activities
 */
export class SocialMediaAnalysisEngine {
  
  /**
   * Analyze engagement patterns to identify successful content strategies
   */
  async analyzeEngagementPatterns(
    competitorId: number,
    platform?: string,
    days: number = 30
  ): Promise<EngagementPatternAnalysis[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get social media data
    const socialMediaData = await this.getSocialMediaData(competitorId, platform, dateThreshold);
    
    const analyses: EngagementPatternAnalysis[] = [];

    // Group by platform
    const platformData = this.groupDataByPlatform(socialMediaData);

    for (const [platformName, data] of Object.entries(platformData)) {
      const posts = this.extractPostsFromData(data);
      
      if (posts.length === 0) continue;

      const analysis: EngagementPatternAnalysis = {
        platform: platformName,
        competitorId,
        patterns: {
          timeOfDay: this.analyzeTimeOfDayPatterns(posts),
          dayOfWeek: this.analyzeDayOfWeekPatterns(posts),
          contentType: this.analyzeContentTypePatterns(posts),
          hashtagPerformance: this.analyzeHashtagPatterns(posts)
        },
        insights: [],
        recommendations: [],
        analyzedAt: new Date()
      };

      // Generate insights and recommendations
      analysis.insights = this.generateEngagementInsights(analysis.patterns);
      analysis.recommendations = this.generateEngagementRecommendations(analysis.patterns);

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Analyze posting frequency and timing patterns
   */
  async analyzePostingFrequency(
    competitorId: number,
    platform?: string,
    days: number = 30
  ): Promise<PostingFrequencyAnalysis[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const socialMediaData = await this.getSocialMediaData(competitorId, platform, dateThreshold);
    const analyses: PostingFrequencyAnalysis[] = [];

    const platformData = this.groupDataByPlatform(socialMediaData);

    for (const [platformName, data] of Object.entries(platformData)) {
      const posts = this.extractPostsFromData(data);
      
      if (posts.length === 0) continue;

      const analysis: PostingFrequencyAnalysis = {
        platform: platformName,
        competitorId,
        frequency: this.calculateFrequencyMetrics(posts, days),
        consistency: this.analyzePostingConsistency(posts),
        optimalTiming: this.identifyOptimalTiming(posts),
        insights: [],
        recommendations: [],
        analyzedAt: new Date()
      };

      analysis.insights = this.generateFrequencyInsights(analysis);
      analysis.recommendations = this.generateFrequencyRecommendations(analysis);

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Analyze audience based on social media interactions
   */
  async analyzeAudience(
    competitorId: number,
    platform?: string,
    days: number = 30
  ): Promise<AudienceAnalysis[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const socialMediaData = await this.getSocialMediaData(competitorId, platform, dateThreshold);
    const analyses: AudienceAnalysis[] = [];

    const platformData = this.groupDataByPlatform(socialMediaData);

    for (const [platformName, data] of Object.entries(platformData)) {
      const posts = this.extractPostsFromData(data);
      
      if (posts.length === 0) continue;

      const analysis: AudienceAnalysis = {
        platform: platformName,
        competitorId,
        engagement: this.analyzeEngagementMetrics(posts),
        demographics: this.estimateDemographics(posts),
        behavior: this.analyzeAudienceBehavior(posts),
        growth: this.analyzeGrowthMetrics(posts, data),
        insights: [],
        recommendations: [],
        analyzedAt: new Date()
      };

      analysis.insights = this.generateAudienceInsights(analysis);
      analysis.recommendations = this.generateAudienceRecommendations(analysis);

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Detect and analyze social media campaigns
   */
  async analyzeCampaigns(
    competitorId: number,
    platform?: string,
    days: number = 90
  ): Promise<SocialMediaCampaignAnalysis[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const socialMediaData = await this.getSocialMediaData(competitorId, platform, dateThreshold);
    const analyses: SocialMediaCampaignAnalysis[] = [];

    const platformData = this.groupDataByPlatform(socialMediaData);

    for (const [platformName, data] of Object.entries(platformData)) {
      const posts = this.extractPostsFromData(data);
      
      if (posts.length === 0) continue;

      const campaigns = this.detectCampaigns(posts);
      const campaignTypes = this.analyzeCampaignTypes(campaigns);
      const performance = this.calculateCampaignPerformance(campaigns);

      const analysis: SocialMediaCampaignAnalysis = {
        platform: platformName,
        competitorId,
        campaigns,
        campaignTypes,
        performance,
        insights: this.generateCampaignInsights(campaigns, performance),
        recommendations: this.generateCampaignRecommendations(campaigns, performance),
        analyzedAt: new Date()
      };

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Create competitive benchmarking metrics
   */
  async createCompetitiveBenchmarks(
    competitorIds: number[],
    platform?: string,
    days: number = 30
  ): Promise<CompetitiveBenchmarkingMetrics[]> {
    const benchmarks: CompetitiveBenchmarkingMetrics[] = [];

    for (const competitorId of competitorIds) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const socialMediaData = await this.getSocialMediaData(competitorId, platform, dateThreshold);
      const platformData = this.groupDataByPlatform(socialMediaData);

      for (const [platformName, data] of Object.entries(platformData)) {
        const posts = this.extractPostsFromData(data);
        
        if (posts.length === 0) continue;

        // Calculate metrics for this competitor
        const metrics = this.calculateBenchmarkMetrics(posts);
        
        // Compare with other competitors
        const comparisons = await this.createCompetitorComparisons(
          competitorId,
          competitorIds.filter(id => id !== competitorId),
          platformName,
          days
        );

        const benchmark: CompetitiveBenchmarkingMetrics = {
          competitorId,
          platform: platformName,
          benchmarks: metrics,
          positioning: this.calculateMarketPositioning(metrics, comparisons),
          comparison: comparisons,
          insights: this.generateBenchmarkInsights(metrics, comparisons),
          recommendations: this.generateBenchmarkRecommendations(metrics, comparisons),
          analyzedAt: new Date()
        };

        benchmarks.push(benchmark);
      }
    }

    return benchmarks;
  }

  // Private helper methods

  private async getSocialMediaData(
    competitorId: number,
    platform?: string,
    dateThreshold?: Date
  ) {
    let whereConditions = and(
      eq(intelligenceData.competitor_id, competitorId),
      eq(intelligenceData.source_type, 'social_media')
    );

    if (platform) {
      whereConditions = and(
        whereConditions,
        eq(intelligenceData.data_type, `${platform}_analysis`)
      );
    }

    if (dateThreshold) {
      whereConditions = and(
        whereConditions,
        gte(intelligenceData.collected_at, dateThreshold)
      );
    }

    return await db
      .select()
      .from(intelligenceData)
      .where(whereConditions)
      .orderBy(desc(intelligenceData.collected_at));
  }

  private groupDataByPlatform(data: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    data.forEach(item => {
      const platform = item.data_type?.replace('_analysis', '') || 'unknown';
      if (!grouped[platform]) {
        grouped[platform] = [];
      }
      grouped[platform].push(item);
    });

    return grouped;
  }

  private extractPostsFromData(data: any[]): SocialMediaPost[] {
    const posts: SocialMediaPost[] = [];
    
    data.forEach(item => {
      const rawContent = item.raw_content;
      if (Array.isArray(rawContent)) {
        posts.push(...rawContent);
      }
    });

    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  private analyzeTimeOfDayPatterns(posts: SocialMediaPost[]): EngagementTimePattern[] {
    const hourlyData: Record<number, { engagement: number; count: number; content: string[] }> = {};

    posts.forEach(post => {
      const hour = new Date(post.publishedAt).getHours();
      const engagement = this.calculateTotalEngagement(post.engagement);

      if (!hourlyData[hour]) {
        hourlyData[hour] = { engagement: 0, count: 0, content: [] };
      }

      hourlyData[hour].engagement += engagement;
      hourlyData[hour].count += 1;
      hourlyData[hour].content.push(post.content.substring(0, 100));
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      avgEngagement: data.engagement / data.count,
      postCount: data.count,
      engagementRate: data.engagement / (data.count * 1000), // Normalized rate
      bestContent: data.content.slice(0, 3)
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private analyzeDayOfWeekPatterns(posts: SocialMediaPost[]): EngagementDayPattern[] {
    const dailyData: Record<string, { engagement: number; count: number; hours: number[] }> = {};

    posts.forEach(post => {
      const date = new Date(post.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const engagement = this.calculateTotalEngagement(post.engagement);

      if (!dailyData[day]) {
        dailyData[day] = { engagement: 0, count: 0, hours: [] };
      }

      dailyData[day].engagement += engagement;
      dailyData[day].count += 1;
      dailyData[day].hours.push(hour);
    });

    return Object.entries(dailyData).map(([day, data]) => {
      const hourCounts: Record<number, number> = {};
      data.hours.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      return {
        day,
        avgEngagement: data.engagement / data.count,
        postCount: data.count,
        engagementRate: data.engagement / (data.count * 1000),
        peakHours
      };
    }).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private analyzeContentTypePatterns(posts: SocialMediaPost[]): ContentTypePattern[] {
    const typeData: Record<string, { count: number; engagement: number; examples: string[] }> = {};

    posts.forEach(post => {
      const type = this.detectContentType(post);
      const engagement = this.calculateTotalEngagement(post.engagement);

      if (!typeData[type]) {
        typeData[type] = { count: 0, engagement: 0, examples: [] };
      }

      typeData[type].count += 1;
      typeData[type].engagement += engagement;
      typeData[type].examples.push(post.content.substring(0, 100));
    });

    return Object.entries(typeData).map(([type, data]) => ({
      type: type as any,
      count: data.count,
      avgEngagement: data.engagement / data.count,
      engagementRate: data.engagement / (data.count * 1000),
      examples: data.examples.slice(0, 3)
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private analyzeHashtagPatterns(posts: SocialMediaPost[]): HashtagPattern[] {
    const hashtagData: Record<string, { usage: number; engagement: number; related: Set<string> }> = {};

    posts.forEach(post => {
      const engagement = this.calculateTotalEngagement(post.engagement);
      const hashtags = post.hashtags || [];

      hashtags.forEach(hashtag => {
        if (!hashtagData[hashtag]) {
          hashtagData[hashtag] = { usage: 0, engagement: 0, related: new Set() };
        }

        hashtagData[hashtag].usage += 1;
        hashtagData[hashtag].engagement += engagement;

        // Add related hashtags
        hashtags.forEach(otherTag => {
          if (otherTag !== hashtag) {
            hashtagData[hashtag].related.add(otherTag);
          }
        });
      });
    });

    return Object.entries(hashtagData)
      .filter(([_, data]) => data.usage >= 2) // Only hashtags used at least twice
      .map(([hashtag, data]) => ({
        hashtag,
        usage: data.usage,
        avgEngagement: data.engagement / data.usage,
        engagementBoost: this.calculateEngagementBoost(hashtag, posts),
        relatedHashtags: Array.from(data.related).slice(0, 5)
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private calculateFrequencyMetrics(posts: SocialMediaPost[], days: number): PostingFrequencyAnalysis['frequency'] {
    const dailyPosts = this.groupPostsByDay(posts);
    const weeklyPosts = this.groupPostsByWeek(posts);
    const monthlyPosts = this.groupPostsByMonth(posts);

    return {
      daily: this.calculateFrequencyStats(Object.values(dailyPosts)),
      weekly: this.calculateFrequencyStats(Object.values(weeklyPosts)),
      monthly: this.calculateFrequencyStats(Object.values(monthlyPosts))
    };
  }

  private analyzePostingConsistency(posts: SocialMediaPost[]): PostingFrequencyAnalysis['consistency'] {
    const dailyPosts = this.groupPostsByDay(posts);
    const dates = Object.keys(dailyPosts).sort();
    
    // Calculate consistency score based on regularity
    const gaps = this.findPostingGaps(dates);
    const variance = this.calculatePostingVariance(Object.values(dailyPosts));
    
    const consistencyScore = Math.max(0, 100 - (gaps.length * 10) - (variance * 20));
    
    let pattern: 'regular' | 'irregular' | 'sporadic' | 'burst';
    if (consistencyScore > 80) pattern = 'regular';
    else if (consistencyScore > 60) pattern = 'irregular';
    else if (consistencyScore > 30) pattern = 'sporadic';
    else pattern = 'burst';

    return {
      score: Math.round(consistencyScore),
      pattern,
      gaps: gaps.map(gap => ({
        start: new Date(gap.start),
        end: new Date(gap.end),
        duration: gap.duration,
        possibleReason: this.inferGapReason(gap.duration)
      }))
    };
  }

  private identifyOptimalTiming(posts: SocialMediaPost[]): PostingFrequencyAnalysis['optimalTiming'] {
    const dayPerformance: Record<string, number> = {};
    const hourPerformance: Record<number, number> = {};

    posts.forEach(post => {
      const date = new Date(post.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const engagement = this.calculateTotalEngagement(post.engagement);

      dayPerformance[day] = (dayPerformance[day] || 0) + engagement;
      hourPerformance[hour] = (hourPerformance[hour] || 0) + engagement;
    });

    const sortedDays = Object.entries(dayPerformance).sort((a, b) => b[1] - a[1]);
    const sortedHours = Object.entries(hourPerformance).sort((a, b) => b[1] - a[1]);

    return {
      bestDays: sortedDays.slice(0, 3).map(([day]) => day),
      bestHours: sortedHours.slice(0, 3).map(([hour]) => parseInt(hour)),
      worstDays: sortedDays.slice(-2).map(([day]) => day),
      worstHours: sortedHours.slice(-2).map(([hour]) => parseInt(hour))
    };
  }

  // Additional helper methods for engagement calculations, content type detection, etc.

  private calculateTotalEngagement(engagement: EngagementMetrics): number {
    return (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
  }

  private detectContentType(post: SocialMediaPost): string {
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      if (post.mediaUrls.length > 1) return 'carousel';
      const url = post.mediaUrls[0];
      if (url.includes('video') || url.includes('.mp4')) return 'video';
      if (url.includes('image') || url.includes('.jpg') || url.includes('.png')) return 'image';
    }
    
    if (post.content.includes('http')) return 'link';
    return 'text';
  }

  private calculateEngagementBoost(hashtag: string, posts: SocialMediaPost[]): number {
    const withHashtag = posts.filter(p => p.hashtags?.includes(hashtag));
    const withoutHashtag = posts.filter(p => !p.hashtags?.includes(hashtag));

    if (withoutHashtag.length === 0) return 0;

    const avgWithHashtag = withHashtag.reduce((sum, p) => sum + this.calculateTotalEngagement(p.engagement), 0) / withHashtag.length;
    const avgWithoutHashtag = withoutHashtag.reduce((sum, p) => sum + this.calculateTotalEngagement(p.engagement), 0) / withoutHashtag.length;

    return ((avgWithHashtag - avgWithoutHashtag) / avgWithoutHashtag) * 100;
  }

  private groupPostsByDay(posts: SocialMediaPost[]): Record<string, SocialMediaPost[]> {
    const grouped: Record<string, SocialMediaPost[]> = {};
    
    posts.forEach(post => {
      const date = new Date(post.publishedAt).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(post);
    });

    return grouped;
  }

  private groupPostsByWeek(posts: SocialMediaPost[]): Record<string, SocialMediaPost[]> {
    const grouped: Record<string, SocialMediaPost[]> = {};
    
    posts.forEach(post => {
      const date = new Date(post.publishedAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(post);
    });

    return grouped;
  }

  private groupPostsByMonth(posts: SocialMediaPost[]): Record<string, SocialMediaPost[]> {
    const grouped: Record<string, SocialMediaPost[]> = {};
    
    posts.forEach(post => {
      const date = new Date(post.publishedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(post);
    });

    return grouped;
  }

  private calculateFrequencyStats(postCounts: SocialMediaPost[][]): FrequencyMetrics {
    const counts = postCounts.map(posts => posts.length);
    
    return {
      average: counts.reduce((sum, count) => sum + count, 0) / counts.length,
      min: Math.min(...counts),
      max: Math.max(...counts),
      trend: this.calculateTrend(counts)
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private findPostingGaps(dates: string[]): Array<{ start: string; end: string; duration: number }> {
    const gaps: Array<{ start: string; end: string; duration: number }> = [];
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 3) { // Gap of more than 3 days
        gaps.push({
          start: dates[i - 1],
          end: dates[i],
          duration: daysDiff
        });
      }
    }
    
    return gaps;
  }

  private calculatePostingVariance(postCounts: SocialMediaPost[][]): number {
    const counts = postCounts.map(posts => posts.length);
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private inferGapReason(duration: number): string {
    if (duration >= 7 && duration <= 14) return 'Possible vacation or break';
    if (duration >= 15 && duration <= 30) return 'Possible strategic pause or campaign preparation';
    if (duration > 30) return 'Possible platform strategy change or resource constraints';
    return 'Short break or irregular posting';
  }

  // Insight and recommendation generation methods

  private generateEngagementInsights(patterns: EngagementPatternAnalysis['patterns']): string[] {
    const insights: string[] = [];
    
    // Time of day insights
    const bestHour = patterns.timeOfDay[0];
    if (bestHour) {
      insights.push(`Peak engagement occurs at ${bestHour.hour}:00 with ${bestHour.avgEngagement.toFixed(0)} average interactions`);
    }

    // Day of week insights
    const bestDay = patterns.dayOfWeek[0];
    if (bestDay) {
      insights.push(`${bestDay.day} is the most engaging day with ${bestDay.avgEngagement.toFixed(0)} average interactions`);
    }

    // Content type insights
    const bestContentType = patterns.contentType[0];
    if (bestContentType) {
      insights.push(`${bestContentType.type} content performs best with ${bestContentType.avgEngagement.toFixed(0)} average engagement`);
    }

    // Hashtag insights
    if (patterns.hashtagPerformance.length > 0) {
      const topHashtag = patterns.hashtagPerformance[0];
      insights.push(`Top performing hashtag "${topHashtag.hashtag}" boosts engagement by ${topHashtag.engagementBoost.toFixed(1)}%`);
    }

    return insights;
  }

  private generateEngagementRecommendations(patterns: EngagementPatternAnalysis['patterns']): string[] {
    const recommendations: string[] = [];
    
    // Timing recommendations
    const bestHour = patterns.timeOfDay[0];
    const bestDay = patterns.dayOfWeek[0];
    if (bestHour && bestDay) {
      recommendations.push(`Schedule posts on ${bestDay.day} at ${bestHour.hour}:00 for maximum engagement`);
    }

    // Content type recommendations
    const bestContentType = patterns.contentType[0];
    if (bestContentType && bestContentType.type !== 'text') {
      recommendations.push(`Focus on ${bestContentType.type} content to increase engagement by up to ${((bestContentType.avgEngagement / patterns.contentType[patterns.contentType.length - 1].avgEngagement - 1) * 100).toFixed(0)}%`);
    }

    // Hashtag recommendations
    const topHashtags = patterns.hashtagPerformance.slice(0, 3);
    if (topHashtags.length > 0) {
      recommendations.push(`Use hashtags like ${topHashtags.map(h => h.hashtag).join(', ')} to boost engagement`);
    }

    return recommendations;
  }

  private generateFrequencyInsights(analysis: PostingFrequencyAnalysis): string[] {
    const insights: string[] = [];
    
    insights.push(`Posts ${analysis.frequency.daily.average.toFixed(1)} times per day on average`);
    insights.push(`Posting consistency score: ${analysis.consistency.score}/100 (${analysis.consistency.pattern})`);
    
    if (analysis.optimalTiming.bestDays.length > 0) {
      insights.push(`Most effective posting days: ${analysis.optimalTiming.bestDays.join(', ')}`);
    }

    if (analysis.consistency.gaps.length > 0) {
      insights.push(`${analysis.consistency.gaps.length} significant posting gaps detected`);
    }

    return insights;
  }

  private generateFrequencyRecommendations(analysis: PostingFrequencyAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.consistency.score < 70) {
      recommendations.push('Improve posting consistency to build better audience engagement');
    }

    if (analysis.frequency.daily.average < 0.5) {
      recommendations.push('Consider increasing posting frequency to maintain audience attention');
    } else if (analysis.frequency.daily.average > 3) {
      recommendations.push('Consider reducing posting frequency to avoid audience fatigue');
    }

    recommendations.push(`Focus posting on ${analysis.optimalTiming.bestDays.join(' and ')} for better performance`);

    return recommendations;
  }

  // Placeholder methods for other analysis types
  private analyzeEngagementMetrics(posts: SocialMediaPost[]): AudienceAnalysis['engagement'] {
    // Implementation for engagement metrics analysis
    return {
      totalReach: 0,
      avgEngagementRate: 0,
      engagementTrend: 'stable',
      topEngagers: []
    };
  }

  private estimateDemographics(posts: SocialMediaPost[]): AudienceAnalysis['demographics'] {
    // Implementation for demographic estimation
    return {
      estimatedAgeGroups: {},
      estimatedGender: {},
      estimatedLocations: {},
      professionalBackground: []
    };
  }

  private analyzeAudienceBehavior(posts: SocialMediaPost[]): AudienceAnalysis['behavior'] {
    // Implementation for audience behavior analysis
    return {
      peakActivityTimes: [],
      contentPreferences: [],
      interactionTypes: {},
      loyaltyScore: 0
    };
  }

  private analyzeGrowthMetrics(posts: SocialMediaPost[], data: any[]): AudienceAnalysis['growth'] {
    // Implementation for growth metrics analysis
    return {
      followerGrowthRate: 0,
      engagementGrowthRate: 0,
      contentGrowthRate: 0
    };
  }

  private generateAudienceInsights(analysis: AudienceAnalysis): string[] {
    // Implementation for audience insights generation
    return [];
  }

  private generateAudienceRecommendations(analysis: AudienceAnalysis): string[] {
    // Implementation for audience recommendations generation
    return [];
  }

  private detectCampaigns(posts: SocialMediaPost[]): DetectedCampaign[] {
    // Implementation for campaign detection
    return [];
  }

  private analyzeCampaignTypes(campaigns: DetectedCampaign[]): CampaignTypeAnalysis[] {
    // Implementation for campaign type analysis
    return [];
  }

  private calculateCampaignPerformance(campaigns: DetectedCampaign[]): CampaignPerformanceMetrics {
    // Implementation for campaign performance calculation
    return {
      totalCampaigns: 0,
      avgCampaignDuration: 0,
      avgCampaignEngagement: 0,
      mostSuccessfulType: '',
      leastSuccessfulType: '',
      seasonalTrends: {}
    };
  }

  private generateCampaignInsights(campaigns: DetectedCampaign[], performance: CampaignPerformanceMetrics): string[] {
    // Implementation for campaign insights generation
    return [];
  }

  private generateCampaignRecommendations(campaigns: DetectedCampaign[], performance: CampaignPerformanceMetrics): string[] {
    // Implementation for campaign recommendations generation
    return [];
  }

  private calculateBenchmarkMetrics(posts: SocialMediaPost[]): CompetitiveBenchmarkingMetrics['benchmarks'] {
    // Implementation for benchmark metrics calculation
    return {
      engagement: { value: 0, percentile: 0, industryAverage: 0, trend: 'unknown' },
      frequency: { value: 0, percentile: 0, industryAverage: 0, trend: 'unknown' },
      reach: { value: 0, percentile: 0, industryAverage: 0, trend: 'unknown' },
      sentiment: { value: 0, percentile: 0, industryAverage: 0, trend: 'unknown' }
    };
  }

  private async createCompetitorComparisons(
    competitorId: number,
    otherCompetitorIds: number[],
    platform: string,
    days: number
  ): Promise<CompetitorComparison[]> {
    // Implementation for competitor comparisons
    return [];
  }

  private calculateMarketPositioning(
    metrics: CompetitiveBenchmarkingMetrics['benchmarks'],
    comparisons: CompetitorComparison[]
  ): CompetitiveBenchmarkingMetrics['positioning'] {
    // Implementation for market positioning calculation
    return {
      rank: 0,
      totalCompetitors: 0,
      strengths: [],
      weaknesses: [],
      opportunities: []
    };
  }

  private generateBenchmarkInsights(
    metrics: CompetitiveBenchmarkingMetrics['benchmarks'],
    comparisons: CompetitorComparison[]
  ): string[] {
    // Implementation for benchmark insights generation
    return [];
  }

  private generateBenchmarkRecommendations(
    metrics: CompetitiveBenchmarkingMetrics['benchmarks'],
    comparisons: CompetitorComparison[]
  ): string[] {
    // Implementation for benchmark recommendations generation
    return [];
  }
}

// Export singleton instance
export const socialMediaAnalysisEngine = new SocialMediaAnalysisEngine();