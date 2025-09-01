import { db } from '@/db';
import { competitorProfiles, intelligenceData } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Types for social media data
export interface SocialMediaHandles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface SocialMediaPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube';
  content: string;
  author: string;
  publishedAt: Date;
  engagement: EngagementMetrics;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  url: string;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  views?: number;
  reactions?: Record<string, number>;
  engagementRate?: number;
}

export interface SentimentScore {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface SocialMediaAnalysis {
  platform: string;
  competitorId: number;
  posts: SocialMediaPost[];
  engagementPatterns: EngagementPattern[];
  contentThemes: ContentTheme[];
  postingFrequency: PostingFrequency;
  audienceInsights: AudienceInsights;
  sentiment: SentimentAnalysis;
  analyzedAt: Date;
}

export interface EngagementPattern {
  timeOfDay: string;
  dayOfWeek: string;
  avgEngagement: number;
  postCount: number;
  bestPerformingContent: string[];
}

export interface ContentTheme {
  theme: string;
  frequency: number;
  avgEngagement: number;
  keywords: string[];
}

export interface PostingFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  peakDays: string[];
  peakHours: string[];
}

export interface AudienceInsights {
  estimatedReach: number;
  engagementRate: number;
  topInteractions: string[];
  demographicHints: string[];
}

export interface SentimentAnalysis {
  overall: SentimentScore;
  byPost: Array<{ postId: string; sentiment: SentimentScore }>;
  trends: Array<{ date: string; sentiment: SentimentScore }>;
}

/**
 * Social Media Monitor Service
 * Handles data collection from various social media platforms
 */
export class SocialMediaMonitor {
  private readonly platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] as const;

  /**
   * Monitor all social media platforms for a competitor
   */
  async monitorCompetitor(competitorId: number): Promise<SocialMediaAnalysis[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) {
      throw new Error(`Competitor with ID ${competitorId} not found`);
    }

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const analyses: SocialMediaAnalysis[] = [];

    for (const platform of this.platforms) {
      const handle = handles[platform];
      if (handle) {
        try {
          const analysis = await this.monitorPlatform(platform, handle, competitorId);
          if (analysis) {
            analyses.push(analysis);
            await this.storeIntelligenceData(competitorId, competitor.user_id, analysis);
          }
        } catch (error) {
          console.error(`Error monitoring ${platform} for competitor ${competitorId}:`, error);
        }
      }
    }

    return analyses;
  }

  /**
   * Monitor LinkedIn company page for posts and updates
   */
  async monitorLinkedInActivity(competitorId: number): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const linkedinHandle = handles.linkedin;
    
    if (!linkedinHandle) return [];

    try {
      // In a real implementation, this would use LinkedIn API or web scraping
      // For now, we'll simulate the data collection
      const posts = await this.scrapeLinkedInPosts(linkedinHandle);
      
      // Store the collected data
      await this.storeIntelligenceData(competitorId, competitor.user_id, {
        platform: 'linkedin',
        competitorId,
        posts,
        engagementPatterns: [],
        contentThemes: [],
        postingFrequency: this.calculatePostingFrequency(posts),
        audienceInsights: this.analyzeAudience(posts),
        sentiment: await this.analyzeSentiment(posts),
        analyzedAt: new Date()
      });

      return posts;
    } catch (error) {
      console.error(`Error monitoring LinkedIn for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Twitter/X for mentions, posts, and engagement
   */
  async monitorTwitterActivity(competitorId: number): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const twitterHandle = handles.twitter;
    
    if (!twitterHandle) return [];

    try {
      // In a real implementation, this would use Twitter API v2
      const posts = await this.scrapeTwitterPosts(twitterHandle);
      
      await this.storeIntelligenceData(competitorId, competitor.user_id, {
        platform: 'twitter',
        competitorId,
        posts,
        engagementPatterns: this.analyzeEngagementPatterns(posts),
        contentThemes: this.analyzeContentThemes(posts),
        postingFrequency: this.calculatePostingFrequency(posts),
        audienceInsights: this.analyzeAudience(posts),
        sentiment: await this.analyzeSentiment(posts),
        analyzedAt: new Date()
      });

      return posts;
    } catch (error) {
      console.error(`Error monitoring Twitter for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Facebook business page with post analysis
   */
  async monitorFacebookActivity(competitorId: number): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const facebookHandle = handles.facebook;
    
    if (!facebookHandle) return [];

    try {
      // In a real implementation, this would use Facebook Graph API
      const posts = await this.scrapeFacebookPosts(facebookHandle);
      
      await this.storeIntelligenceData(competitorId, competitor.user_id, {
        platform: 'facebook',
        competitorId,
        posts,
        engagementPatterns: this.analyzeEngagementPatterns(posts),
        contentThemes: this.analyzeContentThemes(posts),
        postingFrequency: this.calculatePostingFrequency(posts),
        audienceInsights: this.analyzeAudience(posts),
        sentiment: await this.analyzeSentiment(posts),
        analyzedAt: new Date()
      });

      return posts;
    } catch (error) {
      console.error(`Error monitoring Facebook for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Instagram business account with content and engagement metrics
   */
  async monitorInstagramActivity(competitorId: number): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const instagramHandle = handles.instagram;
    
    if (!instagramHandle) return [];

    try {
      // In a real implementation, this would use Instagram Basic Display API
      const posts = await this.scrapeInstagramPosts(instagramHandle);
      
      await this.storeIntelligenceData(competitorId, competitor.user_id, {
        platform: 'instagram',
        competitorId,
        posts,
        engagementPatterns: this.analyzeEngagementPatterns(posts),
        contentThemes: this.analyzeContentThemes(posts),
        postingFrequency: this.calculatePostingFrequency(posts),
        audienceInsights: this.analyzeAudience(posts),
        sentiment: await this.analyzeSentiment(posts),
        analyzedAt: new Date()
      });

      return posts;
    } catch (error) {
      console.error(`Error monitoring Instagram for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Analyze sentiment of social media posts using AI
   */
  async analyzeSentiment(posts: SocialMediaPost[]): Promise<SentimentAnalysis> {
    try {
      // In a real implementation, this would use OpenAI or other AI service
      const byPost = await Promise.all(
        posts.map(async (post) => ({
          postId: post.id,
          sentiment: await this.analyzeSinglePostSentiment(post.content)
        }))
      );

      // Calculate overall sentiment
      const avgScore = byPost.reduce((sum, item) => sum + item.sentiment.score, 0) / byPost.length;
      const avgMagnitude = byPost.reduce((sum, item) => sum + item.sentiment.magnitude, 0) / byPost.length;
      const avgConfidence = byPost.reduce((sum, item) => sum + item.sentiment.confidence, 0) / byPost.length;

      const overall: SentimentScore = {
        score: avgScore,
        magnitude: avgMagnitude,
        label: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
        confidence: avgConfidence
      };

      // Generate trends (simplified - would be more sophisticated in real implementation)
      const trends = this.generateSentimentTrends(posts, byPost);

      return {
        overall,
        byPost,
        trends
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        overall: { score: 0, magnitude: 0, label: 'neutral', confidence: 0 },
        byPost: [],
        trends: []
      };
    }
  }

  // Private helper methods

  private async getCompetitor(competitorId: number) {
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(eq(competitorProfiles.id, competitorId))
      .limit(1);
    
    return competitor;
  }

  private async monitorPlatform(
    platform: typeof this.platforms[number], 
    handle: string, 
    competitorId: number
  ): Promise<SocialMediaAnalysis | null> {
    switch (platform) {
      case 'linkedin':
        const linkedinPosts = await this.scrapeLinkedInPosts(handle);
        return this.createAnalysis(platform, competitorId, linkedinPosts);
      case 'twitter':
        const twitterPosts = await this.scrapeTwitterPosts(handle);
        return this.createAnalysis(platform, competitorId, twitterPosts);
      case 'facebook':
        const facebookPosts = await this.scrapeFacebookPosts(handle);
        return this.createAnalysis(platform, competitorId, facebookPosts);
      case 'instagram':
        const instagramPosts = await this.scrapeInstagramPosts(handle);
        return this.createAnalysis(platform, competitorId, instagramPosts);
      case 'youtube':
        const youtubePosts = await this.scrapeYoutubePosts(handle);
        return this.createAnalysis(platform, competitorId, youtubePosts);
      default:
        return null;
    }
  }

  private async createAnalysis(
    platform: string, 
    competitorId: number, 
    posts: SocialMediaPost[]
  ): Promise<SocialMediaAnalysis> {
    return {
      platform,
      competitorId,
      posts,
      engagementPatterns: this.analyzeEngagementPatterns(posts),
      contentThemes: this.analyzeContentThemes(posts),
      postingFrequency: this.calculatePostingFrequency(posts),
      audienceInsights: this.analyzeAudience(posts),
      sentiment: await this.analyzeSentiment(posts),
      analyzedAt: new Date()
    };
  }

  private async storeIntelligenceData(
    competitorId: number, 
    userId: string, 
    analysis: SocialMediaAnalysis
  ): Promise<void> {
    try {
      await db.insert(intelligenceData).values({
        competitor_id: competitorId,
        user_id: userId,
        source_type: 'social_media',
        source_url: `https://${analysis.platform}.com`,
        data_type: `${analysis.platform}_analysis`,
        raw_content: analysis.posts,
        extracted_data: {
          engagementPatterns: analysis.engagementPatterns,
          contentThemes: analysis.contentThemes,
          postingFrequency: analysis.postingFrequency,
          audienceInsights: analysis.audienceInsights,
          sentiment: analysis.sentiment
        },
        analysis_results: [],
        confidence: analysis.sentiment.overall.confidence,
        importance: this.calculateImportance(analysis),
        tags: [analysis.platform, 'social_media', 'engagement'],
        collected_at: new Date(),
        processed_at: new Date()
      });
    } catch (error) {
      console.error('Error storing intelligence data:', error);
    }
  }

  private calculateImportance(analysis: SocialMediaAnalysis): 'low' | 'medium' | 'high' | 'critical' {
    const avgEngagement = analysis.posts.reduce((sum, post) => {
      const total = post.engagement.likes + post.engagement.shares + post.engagement.comments;
      return sum + total;
    }, 0) / analysis.posts.length;

    if (avgEngagement > 1000) return 'critical';
    if (avgEngagement > 500) return 'high';
    if (avgEngagement > 100) return 'medium';
    return 'low';
  }

  // Placeholder methods for actual social media scraping/API calls
  // In a real implementation, these would use proper APIs or ethical web scraping

  private async scrapeLinkedInPosts(handle: string): Promise<SocialMediaPost[]> {
    // Placeholder implementation
    // In reality, would use LinkedIn API or ethical web scraping
    return this.generateMockPosts('linkedin', handle);
  }

  private async scrapeTwitterPosts(handle: string): Promise<SocialMediaPost[]> {
    // Placeholder implementation
    // In reality, would use Twitter API v2
    return this.generateMockPosts('twitter', handle);
  }

  private async scrapeFacebookPosts(handle: string): Promise<SocialMediaPost[]> {
    // Placeholder implementation
    // In reality, would use Facebook Graph API
    return this.generateMockPosts('facebook', handle);
  }

  private async scrapeInstagramPosts(handle: string): Promise<SocialMediaPost[]> {
    // Placeholder implementation
    // In reality, would use Instagram Basic Display API
    return this.generateMockPosts('instagram', handle);
  }

  private async scrapeYoutubePosts(handle: string): Promise<SocialMediaPost[]> {
    // Placeholder implementation
    // In reality, would use YouTube Data API
    return this.generateMockPosts('youtube', handle);
  }

  private generateMockPosts(platform: string, handle: string): SocialMediaPost[] {
    // Generate mock data for development/testing
    const posts: SocialMediaPost[] = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const postDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Last 10 days
      posts.push({
        id: `${platform}_${handle}_${i}`,
        platform: platform as any,
        content: `Sample ${platform} post content ${i + 1} from ${handle}`,
        author: handle,
        publishedAt: postDate,
        engagement: {
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 5000),
          engagementRate: Math.random() * 0.1
        },
        mediaUrls: [],
        hashtags: [`#${platform}`, '#business', '#growth'],
        mentions: [],
        url: `https://${platform}.com/${handle}/post/${i}`
      });
    }
    
    return posts;
  }

  private async analyzeSinglePostSentiment(content: string): Promise<SentimentScore> {
    // Placeholder implementation
    // In reality, would use OpenAI, Google Cloud Natural Language, or similar
    const score = (Math.random() - 0.5) * 2; // Random score between -1 and 1
    const magnitude = Math.random();
    
    return {
      score,
      magnitude,
      label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      confidence: Math.random() * 0.5 + 0.5 // Random confidence between 0.5 and 1
    };
  }

  private analyzeEngagementPatterns(posts: SocialMediaPost[]): EngagementPattern[] {
    const patterns: Record<string, { engagement: number; count: number; content: string[] }> = {};
    
    posts.forEach(post => {
      const hour = post.publishedAt.getHours();
      const day = post.publishedAt.toLocaleDateString('en-US', { weekday: 'long' });
      const key = `${day}_${hour}`;
      
      const totalEngagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
      
      if (!patterns[key]) {
        patterns[key] = { engagement: 0, count: 0, content: [] };
      }
      
      patterns[key].engagement += totalEngagement;
      patterns[key].count += 1;
      patterns[key].content.push(post.content.substring(0, 100));
    });

    return Object.entries(patterns).map(([key, data]) => {
      const [dayOfWeek, timeOfDay] = key.split('_');
      return {
        timeOfDay,
        dayOfWeek,
        avgEngagement: data.engagement / data.count,
        postCount: data.count,
        bestPerformingContent: data.content.slice(0, 3)
      };
    });
  }

  private analyzeContentThemes(posts: SocialMediaPost[]): ContentTheme[] {
    const themes: Record<string, { count: number; engagement: number; keywords: Set<string> }> = {};
    
    posts.forEach(post => {
      const words = post.content.toLowerCase().split(/\s+/);
      const totalEngagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
      
      // Simple theme detection based on keywords
      const detectedThemes = this.detectThemes(words);
      
      detectedThemes.forEach(theme => {
        if (!themes[theme]) {
          themes[theme] = { count: 0, engagement: 0, keywords: new Set() };
        }
        
        themes[theme].count += 1;
        themes[theme].engagement += totalEngagement;
        
        // Add relevant keywords
        words.forEach(word => {
          if (word.length > 3 && !this.isStopWord(word)) {
            themes[theme].keywords.add(word);
          }
        });
      });
    });

    return Object.entries(themes).map(([theme, data]) => ({
      theme,
      frequency: data.count,
      avgEngagement: data.engagement / data.count,
      keywords: Array.from(data.keywords).slice(0, 10)
    }));
  }

  private detectThemes(words: string[]): string[] {
    const themes: string[] = [];
    
    // Simple keyword-based theme detection
    if (words.some(w => ['product', 'launch', 'feature', 'update'].includes(w))) {
      themes.push('product');
    }
    if (words.some(w => ['team', 'hiring', 'join', 'career'].includes(w))) {
      themes.push('hiring');
    }
    if (words.some(w => ['funding', 'investment', 'series', 'round'].includes(w))) {
      themes.push('funding');
    }
    if (words.some(w => ['customer', 'client', 'success', 'testimonial'].includes(w))) {
      themes.push('customer_success');
    }
    if (words.some(w => ['event', 'conference', 'webinar', 'speaking'].includes(w))) {
      themes.push('events');
    }
    
    return themes.length > 0 ? themes : ['general'];
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return stopWords.includes(word);
  }

  private calculatePostingFrequency(posts: SocialMediaPost[]): PostingFrequency {
    if (posts.length === 0) {
      return { daily: 0, weekly: 0, monthly: 0, peakDays: [], peakHours: [] };
    }

    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};
    
    posts.forEach(post => {
      const day = post.publishedAt.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = post.publishedAt.getHours().toString();
      
      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCount).sort((a, b) => b[1] - a[1]);
    const sortedHours = Object.entries(hourCount).sort((a, b) => b[1] - a[1]);

    // Calculate frequencies based on date range
    const dateRange = this.getDateRange(posts);
    const days = Math.max(1, Math.ceil(dateRange / (24 * 60 * 60 * 1000)));
    
    return {
      daily: posts.length / days,
      weekly: posts.length / Math.max(1, days / 7),
      monthly: posts.length / Math.max(1, days / 30),
      peakDays: sortedDays.slice(0, 3).map(([day]) => day),
      peakHours: sortedHours.slice(0, 3).map(([hour]) => `${hour}:00`)
    };
  }

  private analyzeAudience(posts: SocialMediaPost[]): AudienceInsights {
    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
    );
    
    const totalViews = posts.reduce((sum, post) => sum + (post.engagement.views || 0), 0);
    const engagementRate = totalViews > 0 ? totalEngagement / totalViews : 0;

    return {
      estimatedReach: Math.floor(totalViews / posts.length),
      engagementRate,
      topInteractions: ['likes', 'shares', 'comments'],
      demographicHints: ['business_professionals', 'entrepreneurs', 'tech_enthusiasts']
    };
  }

  private generateSentimentTrends(
    posts: SocialMediaPost[], 
    sentiments: Array<{ postId: string; sentiment: SentimentScore }>
  ): Array<{ date: string; sentiment: SentimentScore }> {
    const trendMap: Record<string, SentimentScore[]> = {};
    
    posts.forEach((post, index) => {
      const date = post.publishedAt.toISOString().split('T')[0];
      if (!trendMap[date]) {
        trendMap[date] = [];
      }
      trendMap[date].push(sentiments[index].sentiment);
    });

    return Object.entries(trendMap).map(([date, sentiments]) => {
      const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
      const avgMagnitude = sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length;
      const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
      
      return {
        date,
        sentiment: {
          score: avgScore,
          magnitude: avgMagnitude,
          label: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
          confidence: avgConfidence
        }
      };
    });
  }

  private getDateRange(posts: SocialMediaPost[]): number {
    if (posts.length === 0) return 0;
    
    const dates = posts.map(p => p.publishedAt.getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    return maxDate - minDate;
  }
}

// Export singleton instance
export const socialMediaMonitor = new SocialMediaMonitor();