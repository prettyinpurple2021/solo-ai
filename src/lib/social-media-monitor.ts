import { logError, logWarn,} from '@/lib/logger'
import { db } from '@/db';
import { competitorProfiles, intelligenceData, socialMediaConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { TwitterApi } from 'twitter-api-v2';


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
  competitorId: string;
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
   * Monitor user's own social media accounts
   * Uses OAuth tokens stored in socialMediaConnections table
   */
  async monitorUserAccounts(userId: string): Promise<SocialMediaAnalysis[]> {
    // Get all connected social media accounts for this user
    const connections = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.is_active, true)
      ));

    if (connections.length === 0) {
      logWarn(`No social media connections found for user ${userId}`);
      return [];
    }

    const analyses: SocialMediaAnalysis[] = [];

    for (const connection of connections) {
      const platform = connection.platform as typeof this.platforms[number];
      
      try {
        // Use user's stored tokens to fetch their posts
        const posts = await this.fetchUserPostsWithToken(platform, connection);
        if (posts.length > 0) {
          const analysis = await this.createAnalysis(
            platform,
            '0', // Not competitor-specific - this is user's own account
            posts
          );
          analyses.push(analysis);
          
          // Store analysis for user's own account monitoring
          await this.storeUserIntelligenceData(userId, analysis);
        }
      } catch (error) {
        logError(`Error monitoring ${platform} for user ${userId}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Monitor all social media platforms for a competitor
   * NOTE: This uses competitor's handles and requires the monitoring user to have API access
   */
  async monitorCompetitor(competitorId: string, userId: string): Promise<SocialMediaAnalysis[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) {
      throw new Error(`Competitor with ID ${competitorId} not found`);
    }

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const analyses: SocialMediaAnalysis[] = [];

    // For competitor monitoring, we need the user's own API tokens
    // The user connects their accounts and we monitor competitors using their API access
    const userConnections = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.is_active, true)
      ));

    for (const platform of this.platforms) {
      const handle = handles[platform];
      if (!handle) continue;

      // Find user's connection for this platform
      const userConnection = userConnections.find(c => c.platform === platform);
      if (!userConnection) {
        logWarn(`User ${userId} has no ${platform} connection to monitor competitor ${handle}`);
        continue;
      }

      try {
        // Use user's tokens to fetch competitor's posts
        // Note: This only works if the competitor's account is public and accessible
        const posts = await this.fetchCompetitorPostsWithUserToken(platform, handle, userConnection);
        if (posts.length > 0) {
          const analysis = await this.createAnalysis(platform, competitorId, posts);
          analyses.push(analysis);
          await this.storeIntelligenceData(competitorId, competitor.user_id, analysis);
        }
      } catch (error) {
        logError(`Error monitoring ${platform} competitor ${handle} for user ${userId}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Monitor LinkedIn company page for posts and updates
   */
  async monitorLinkedInActivity(competitorId: string, userId: string): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const linkedinHandle = handles.linkedin;
    
    if (!linkedinHandle) return [];

    // Get user's LinkedIn connection
    const [connection] = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.platform, 'linkedin'),
        eq(socialMediaConnections.is_active, true)
      ))
      .limit(1);

    if (!connection?.access_token) {
      logWarn(`No active LinkedIn connection for user ${userId}, skipping monitoring`);
      return [];
    }

    try {
      const posts = await this.fetchLinkedInCompanyPosts(connection.access_token, linkedinHandle);
      
      await this.storeIntelligenceData(competitorId, userId, {
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
      logError(`Error monitoring LinkedIn for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Twitter/X for mentions, posts, and engagement
   */
  async monitorTwitterActivity(competitorId: string, userId: string): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const twitterHandle = handles.twitter;
    
    if (!twitterHandle) return [];

    const [connection] = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.platform, 'twitter'),
        eq(socialMediaConnections.is_active, true)
      ))
      .limit(1);

    if (!connection?.access_token) {
      logWarn(`No active Twitter connection for user ${userId}, skipping monitoring`);
      return [];
    }

    try {
      // Note: Twitter usually requires access token secret for OAuth 1.0a too, assuming stored in connection metadata or separate field if needed
      // adapting to pass just access token if using Bearer, or updated signature
      const posts = await this.fetchTwitterCompetitorPosts(connection.access_token, connection.refresh_token || '', twitterHandle);
      
      await this.storeIntelligenceData(competitorId, userId, {
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
      logError(`Error monitoring Twitter for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Facebook business page with post analysis
   */
  async monitorFacebookActivity(competitorId: string, userId: string): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const facebookHandle = handles.facebook;
    
    if (!facebookHandle) return [];

    const [connection] = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.platform, 'facebook'),
        eq(socialMediaConnections.is_active, true)
      ))
      .limit(1);

    if (!connection?.access_token) {
        logWarn(`No active Facebook connection for user ${userId}, skipping monitoring`);
        return [];
    }

    try {
      const posts = await this.fetchFacebookCompetitorPosts(connection.access_token, facebookHandle);
      
      await this.storeIntelligenceData(competitorId, userId, {
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
      logError(`Error monitoring Facebook for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Monitor Instagram business account with content and engagement metrics
   */
  async monitorInstagramActivity(competitorId: string, userId: string): Promise<SocialMediaPost[]> {
    const competitor = await this.getCompetitor(competitorId);
    if (!competitor) return [];

    const handles = competitor.social_media_handles as SocialMediaHandles;
    const instagramHandle = handles.instagram;
    
    if (!instagramHandle) return [];

    const [connection] = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.user_id, userId),
        eq(socialMediaConnections.platform, 'instagram'),
        eq(socialMediaConnections.is_active, true)
      ))
      .limit(1);

    if (!connection?.access_token) {
        logWarn(`No active Instagram connection for user ${userId}, skipping monitoring`);
        return [];
    }

    try {
      const posts = await this.fetchInstagramCompetitorPosts(connection.access_token, instagramHandle);
      
      await this.storeIntelligenceData(competitorId, userId, {
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
      logError(`Error monitoring Instagram for competitor ${competitorId}:`, error);
      return [];
    }
  }

  /**
   * Analyze sentiment of social media posts using AI
   */
  async analyzeSentiment(posts: SocialMediaPost[]): Promise<SentimentAnalysis> {
    try {
      // Use real AI service for sentiment analysis
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
      logError('Error analyzing sentiment:', error);
      return {
        overall: { score: 0, magnitude: 0, label: 'neutral', confidence: 0 },
        byPost: [],
        trends: []
      };
    }
  }

  // Private helper methods

  private async getCompetitor(competitorId: string) {
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
    competitorId: string
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
    competitorId: string, 
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
    competitorId: string, 
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
        confidence: analysis.sentiment.overall.confidence.toString(),
        importance: this.calculateImportance(analysis),
        tags: [analysis.platform, 'social_media', 'engagement'],
        collected_at: new Date(),
        processed_at: new Date()
      });
    } catch (error) {
      logError('Error storing intelligence data:', error);
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

  // Dispatch methods
  private async fetchUserPostsWithToken(platform: string, connection: any): Promise<SocialMediaPost[]> {
    switch (platform) {
      case 'linkedin':
        return this.fetchLinkedInPostsWithToken(connection.access_token, connection.account_handle || 'me');
      case 'twitter':
        return this.fetchTwitterPostsWithToken(connection.access_token, connection.token_secret || '', connection.account_handle || 'me');
      case 'facebook':
        return this.fetchFacebookPostsWithToken(connection.access_token, connection.account_id);
      case 'instagram':
        return this.fetchInstagramCompetitorPosts(connection.access_token, connection.account_handle || 'me');
      default:
        return [];
    }
  }

  private async fetchCompetitorPostsWithUserToken(platform: string, handle: string, connection: any): Promise<SocialMediaPost[]> {
      switch (platform) {
        case 'linkedin':
          return this.fetchLinkedInCompetitorPosts(connection.access_token, handle);
        case 'twitter':
          return this.fetchTwitterCompetitorPosts(connection.access_token, connection.token_secret || '', handle);
        case 'facebook':
          return this.fetchFacebookCompetitorPosts(connection.access_token, handle);
        case 'instagram':
          return this.fetchInstagramCompetitorPosts(connection.access_token, handle); 
        default:
          return [];
      }
  }

  // Deprecated usage - these methods are now effectively abstract or errors, as we rely on fetch* variants
  private async scrapeLinkedInPosts(handle: string): Promise<SocialMediaPost[]> {
    throw new Error('Direct scraping not supported. Use monitorLinkedInActivity with userId.');
  }

  private async scrapeTwitterPosts(handle: string): Promise<SocialMediaPost[]> {
    throw new Error('Direct scraping not supported. Use monitorTwitterActivity with userId.');
  }

  private async scrapeFacebookPosts(handle: string): Promise<SocialMediaPost[]> {
    throw new Error('Direct scraping not supported. Use monitorFacebookActivity with userId.');
  }

  private async scrapeInstagramPosts(handle: string): Promise<SocialMediaPost[]> {
    throw new Error('Direct scraping not supported. Use monitorInstagramActivity with userId.');
  }

  private async scrapeYoutubePosts(handle: string): Promise<SocialMediaPost[]> {
    throw new Error('Direct scraping not supported. Use fetchYouTubePostsWithToken.');
  }

  // Real API integration methods (implement with actual API calls)
  private async fetchLinkedInCompanyPosts(accessToken: string, handle: string): Promise<SocialMediaPost[]> {
    // Use the user's stored access token
    if (!accessToken) {
      throw new Error('LinkedIn access token not available.')
    }

    try {
      // Get user's own posts or company page posts
      // For personal posts, use /v2/ugcPosts endpoint
      // For company pages, use /v2/organizationalEntityShareStatistics
      
      // First, try to get user's own posts
      const ugcPostsResponse = await fetch(
        'https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(' + encodeURIComponent('urn:li:person:' + handle) + ')',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )
      
      if (ugcPostsResponse.ok) {
        const ugcData = await ugcPostsResponse.json()
        return this.transformLinkedInPosts(ugcData, handle)
      }

      // Fallback: Try company page posts if handle is a company
      const companySearchResponse = await fetch(
        `https://api.linkedin.com/v2/organizationalEntities?q=vanityName&vanityName=${encodeURIComponent(handle)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )

      if (!companySearchResponse.ok) {
        throw new Error(`LinkedIn API error: ${companySearchResponse.status}`)
      }

      const companyData = await companySearchResponse.json()
      const companyId = companyData.elements?.[0]?.organizationalTarget

      if (!companyId) {
        throw new Error(`LinkedIn company not found for handle: ${handle}`)
      }

      // If company found, fetch company posts
      const postsResponse = await fetch(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(companyId)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )

      if (!postsResponse.ok) {
        throw new Error(`LinkedIn posts API error: ${postsResponse.status}`)
      }
      
      const linkedInData = await postsResponse.json()
      return this.transformLinkedInPosts(linkedInData, handle)

    } catch (error) {
      logError('LinkedIn API fetch failed:', error)
      throw error
    }
  }
  
  private async fetchLinkedInPostsWithToken(accessToken: string, handle: string): Promise<SocialMediaPost[]> {
       // Fetch user's own posts using UGC API
       try {
        const ugcPostsResponse = await fetch(
            'https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(' + encodeURIComponent('urn:li:person:' + handle) + ')',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
              }
            }
          )
          
          if (ugcPostsResponse.ok) {
            const ugcData = await ugcPostsResponse.json()
            return this.transformLinkedInPosts(ugcData, handle)
          }
          return [];
       } catch (error) {
           logError('Error fetching LinkedIn user posts:', error);
           return [];
       }
  }

  private async fetchLinkedInCompetitorPosts(accessToken: string, competitorHandle: string): Promise<SocialMediaPost[]> {
    // Similar to above but for competitor's public content
    // This requires the competitor's content to be publicly accessible
    return this.fetchLinkedInPostsWithToken(accessToken, competitorHandle)
  }

  private transformLinkedInPosts(apiData: any, handle: string): SocialMediaPost[] {
    // Transform LinkedIn API response to our SocialMediaPost format
    const posts: SocialMediaPost[] = []
    
    const elements = apiData.elements || apiData.value || []
    
    for (const element of elements.slice(0, 20)) { // Limit to 20 posts
      const shareContent = element.shareContent || element.specificContent?.shareContent || {}
      const shareMediaCategory = shareContent.mediaCategory || 'NONE'
      
      posts.push({
        id: element.share?.shareUrn || element.id || `linkedin_${Date.now()}_${Math.random()}`,
        platform: 'linkedin',
        content: shareContent.text?.text || shareContent.media?.description?.text || 'No content',
        author: handle,
        publishedAt: element.created?.time ? new Date(element.created.time) : new Date(),
        engagement: {
          likes: element.numLikes || 0,
          shares: element.numShares || 0,
          comments: element.numComments || 0,
          views: element.impressionCount || 0,
          engagementRate: element.engagementRate || 0
        },
        mediaUrls: shareMediaCategory !== 'NONE' ? [shareContent.media?.originalUrl || ''] : [],
        hashtags: this.extractHashtags(shareContent.text?.text || ''),
        mentions: this.extractMentions(shareContent.text?.text || ''),
        url: element.share?.shareUrl || `https://linkedin.com/feed/update/${element.id}`
      })
    }
    
    return posts
  }

  private async fetchTwitterPostsWithToken(accessToken: string, tokenSecret: string, handle: string): Promise<SocialMediaPost[]> {
    if (!accessToken) {
      throw new Error('Twitter access token not available.')
    }

    try {
      let client: TwitterApi;

      // Determine Auth type based on presence of secrets and token secrets
      // If we have API Key/Secret and Token Secret, use OAuth 1.0a (User Context)
      if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && tokenSecret) {
          client = new TwitterApi({
              appKey: process.env.TWITTER_API_KEY,
              appSecret: process.env.TWITTER_API_SECRET,
              accessToken: accessToken,
              accessSecret: tokenSecret,
          });
      } else {
          // Fallback to OAuth 2.0 Bearer Token (User Context)
          client = new TwitterApi(accessToken);
      }

      const roClient = client.readOnly;

      // Step 1: Get user ID from username 
      // handle might start with @
      const username = handle.replace('@', '');
      const user = await roClient.v2.userByUsername(username);

      if (!user.data) {
        throw new Error(`Twitter user not found: ${username}`);
      }

      // Step 2: Get user's tweets
      const tweetsPaginator = await roClient.v2.userTimeline(user.data.id, {
          max_results: 50,
          "tweet.fields": ["created_at", "public_metrics", "lang", "author_id"],
          expansions: ["attachments.media_keys", "author_id"],
          "media.fields": ["url", "type", "preview_image_url"]
      });

      // Pass the whole paginator object (which has .data and .includes) to logic
      // We manually construct the object shape expected by transformTwitterPosts
      // to match what twitter-api-v2 returns in .data and .includes
      const apiData = {
          data: tweetsPaginator.data, // .data on paginator IS the array of tweets
          includes: tweetsPaginator.includes
      };

      return this.transformTwitterPosts(apiData, handle);

    } catch (error) {
      logError('Twitter API fetch failed:', error)
      throw error
    }
  }

  private async fetchTwitterCompetitorPosts(accessToken: string, tokenSecret: string, competitorHandle: string): Promise<SocialMediaPost[]> {
    // Fetch competitor's public tweets using user's API access
    return this.fetchTwitterPostsWithToken(accessToken, tokenSecret, competitorHandle)
  }

  private transformTwitterPosts(apiData: any, handle: string): SocialMediaPost[] {
    const posts: SocialMediaPost[] = []
    const mediaMap = new Map()
    
    // Map media if available
    if (apiData.includes?.media) {
      for (const media of apiData.includes.media) {
        mediaMap.set(media.media_key, media.url || media.preview_image_url)
      }
    }

    const tweets = apiData.data || []
    
    for (const tweet of tweets.slice(0, 50)) {
      const metrics = tweet.public_metrics || {}
      const attachments = tweet.attachments || {}
      const mediaKeys = attachments.media_keys || []
      const mediaUrls = mediaKeys.map((key: string) => mediaMap.get(key)).filter(Boolean)
      
      posts.push({
        id: tweet.id,
        platform: 'twitter',
        content: tweet.text || '',
        author: handle,
        publishedAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
        engagement: {
          likes: metrics.like_count || 0,
          shares: metrics.retweet_count || 0,
          comments: metrics.reply_count || 0,
          views: metrics.impression_count || 0,
          engagementRate: 0 // Calculate if needed
        },
        mediaUrls,
        hashtags: this.extractHashtags(tweet.text || ''),
        mentions: this.extractMentions(tweet.text || ''),
        url: `https://twitter.com/${handle.replace('@', '')}/status/${tweet.id}`
      })
    }
    
    return posts
  }

  private async fetchFacebookPostsWithToken(accessToken: string, pageIdentifier: string): Promise<SocialMediaPost[]> {
    if (!accessToken) {
      throw new Error('Facebook access token not available.')
    }

    try {
      // If pageIdentifier is provided, use it. Otherwise default to 'me'
      // Only use 'me' if the token is a Page Token or we want User posts (deprecated for pages)
      // Usually for Page management, we need a Page Access Token and Page ID.
      // If the user provided a token, it might be a User Token. 
      // We'll try to use it directly or fetch Page ID.
      
      let targetId = pageIdentifier || 'me';

      // If identifier is a URL or full handle, try to extract ID or username
      if (targetId.includes('/')) {
        targetId = targetId.split('/').pop() || 'me';
      }

      // If it looks like a username (not numeric), we try to resolve it
      if (targetId !== 'me' && !targetId.match(/^\d+$/)) {
          const idResponse = await fetch(
            `https://graph.facebook.com/v19.0/?id=${targetId}&access_token=${accessToken}`
          );
          if (idResponse.ok) {
              const idData = await idResponse.json();
              targetId = idData.id;
          } else {
              logWarn(`Failed to resolve Facebook ID for ${targetId}: ${idResponse.status} ${idResponse.statusText}`);
          }
      }

      const fields = 'id,message,created_time,full_picture,permalink_url,shares,comments.summary(true),likes.summary(true),from';
      const response = await fetch(
          `https://graph.facebook.com/v19.0/${targetId}/posts?fields=${fields}&limit=50&access_token=${accessToken}`
      );

      if (!response.ok) {
          // If 'me' failed, maybe it's because we need a Page ID or the token is for a User who has Pages
          // But for now, just log and throw/return
          logError(`Facebook API error: ${response.status} ${response.statusText}`);
          throw new Error(`Facebook API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformFacebookPosts(data, pageIdentifier);
    } catch (error) {
      logError('Facebook API fetch failed:', error);
      throw error;
    }
  }

  private async fetchFacebookCompetitorPosts(accessToken: string, competitorHandle: string): Promise<SocialMediaPost[]> {
    // Competitor handle might be a username or ID. 
    // fetchFacebookPostsWithToken handles resolving username to ID.
    return this.fetchFacebookPostsWithToken(accessToken, competitorHandle);
  }

  private transformFacebookPosts(apiData: any, handle: string): SocialMediaPost[] {
    const postsList = apiData.data || [];
    return postsList.map((post: any) => ({
      id: post.id,
      platform: 'facebook',
      content: post.message || post.story || 'No content',
      author: post.from?.name || handle,
      publishedAt: post.created_time ? new Date(post.created_time) : new Date(),
      engagement: {
        likes: post.likes?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        comments: post.comments?.summary?.total_count || 0,
        views: 0,
        engagementRate: 0
      },
      mediaUrls: post.full_picture ? [post.full_picture] : [],
      hashtags: this.extractHashtags(post.message || ''),
      mentions: this.extractMentions(post.message || ''),
      url: post.permalink_url || `https://facebook.com/${post.id}`
    }));
  }

  private async fetchInstagramPostsWithToken(accessToken: string, instagramAccountId: string): Promise<SocialMediaPost[]> {
    if (!accessToken) {
      throw new Error('Instagram access token not available.')
    }

    try {
      // If instagramAccountId is provided (from our DB connection), use it.
      // If not, we might need to find the IG Business Account ID associated with the user.
      let targetId = instagramAccountId;
      
      if (!targetId || targetId === 'me') {
          // Fetch IG Business Account ID from 'me/accounts'
          const meResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`);
          if (meResponse.ok) {
             const meData = await meResponse.json();
             // Assuming the first page has the IG account we want, or we iterate.
             // For simplicity, take the first one that has an IG account.
             const pageWithIg = meData.data?.find((p: any) => p.instagram_business_account);
             if (pageWithIg) {
                 targetId = pageWithIg.instagram_business_account.id;
             }
          }
      }

      if (!targetId || targetId === 'me') {
          // If still no ID, we can't fetch.
          throw new Error('No Instagram Business Account found for this user.');
      }

      const mediaResponse = await fetch(
        `https://graph.facebook.com/v19.0/${targetId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=50&access_token=${accessToken}`
      );

      if (!mediaResponse.ok) {
        throw new Error(`Instagram API error: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();
      return this.transformInstagramPosts(mediaData, targetId);

    } catch (error) {
      logError('Instagram API fetch failed:', error);
      throw error;
    }
  }

  private async fetchInstagramCompetitorPosts(accessToken: string, handle: string): Promise<SocialMediaPost[]> {
    try {
       // 1. Get My IG Business Account ID (needed for Business Discovery)
       // We can iterate pages to find one with IG account
       const meResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`);
       
       let myIgId = '';
       if (meResponse.ok) {
           const meData = await meResponse.json();
           const pageWithIg = meData.data?.find((p: any) => p.instagram_business_account);
           if (pageWithIg) {
               myIgId = pageWithIg.instagram_business_account.id;
           }
       }

       if (!myIgId) {
           // If we can't find our own IG ID, we can't use Business Discovery
           // Fallback: If handle is 'me' or matches us, try fetchInstagramPostsWithToken?
           if (handle === 'me') {
               return this.fetchInstagramPostsWithToken(accessToken, 'me'); 
           }
           throw new Error('Instagram Business Discovery requires a linked Instagram Business Account.');
       }

       // 2. Use Business Discovery to fetch competitor media
       const discoveryResponse = await fetch(
           `https://graph.facebook.com/v19.0/${myIgId}?fields=business_discovery.username(${handle}){media{id,caption,media_url,media_type,like_count,comments_count,timestamp,permalink}}&access_token=${accessToken}`
       );

       if (!discoveryResponse.ok) {
           logWarn(`Instagram Business Discovery failed for ${handle}: ${discoveryResponse.statusText}`);
           return [];
       }

       const discoveryData = await discoveryResponse.json();
       const mediaData = discoveryData.business_discovery?.media || { data: [] };
       
       return this.transformInstagramPosts(mediaData, handle);

    } catch (error) {
        logError('Instagram Competitor fetch failed:', error);
        return [];
    }
  }

  private transformInstagramPosts(apiData: any, handle: string): SocialMediaPost[] {
    const mediaList = apiData.data || [];
    return mediaList.map((media: any) => ({
      id: media.id,
      platform: 'instagram',
      content: media.caption || 'No caption',
      author: handle,
      publishedAt: media.timestamp ? new Date(media.timestamp) : new Date(),
      engagement: {
        likes: media.like_count || 0,
        shares: 0,
        comments: media.comments_count || 0,
        views: 0,
        engagementRate: 0
      },
      mediaUrls: media.media_url ? [media.media_url] : [],
      hashtags: this.extractHashtags(media.caption || ''),
      mentions: this.extractMentions(media.caption || ''),
      url: media.permalink || `https://instagram.com/p/${media.id}`
    }));
  }

  private async fetchYouTubePostsWithToken(accessToken: string, channelIdentifier: string): Promise<SocialMediaPost[]> {
    // Use OAuth 2.0 access token for user's YouTube channel
    if (!accessToken) {
      throw new Error('YouTube access token not available. Please reconnect your account.')
    }

    try {
      // Handle can be channel ID or channel username/custom URL
      let channelId = channelIdentifier
      
      // If handle looks like a username, convert to channel ID
      // Note: YouTube API requires an API key even with OAuth token for some endpoints
      // For OAuth, we can use the 'mine' parameter with access token
      
      // First, try to get user's own channel
      const myChannelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true&access_token=${accessToken}`
      )
      
      if (myChannelResponse.ok) {
        const myChannelData = await myChannelResponse.json()
        if (myChannelData.items && myChannelData.items.length > 0) {
          channelId = myChannelData.items[0].id
        }
      } else if (!channelId.startsWith('UC') || channelId.length !== 24) {
        // Fallback: search by username (requires API key - would need to pass it)
        throw new Error('Channel ID lookup requires additional configuration')
      }

      // Fetch channel videos using OAuth token
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&access_token=${accessToken}`
      )

      if (!videosResponse.ok) {
        throw new Error(`YouTube API error: ${videosResponse.status}`)
      }

      const videosData = await videosResponse.json()
      
      // Get video statistics
      const videoIds = videosData.items?.map((item: any) => item.id.videoId).join(',') || ''
      let statisticsMap = new Map()
      
      if (videoIds) {
        const statsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&access_token=${accessToken}`
        )
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          for (const video of statsData.items || []) {
            statisticsMap.set(video.id, {
              viewCount: parseInt(video.statistics.viewCount || '0'),
              likeCount: parseInt(video.statistics.likeCount || '0'),
              commentCount: parseInt(video.statistics.commentCount || '0')
            })
          }
        }
      }

      return this.transformYouTubePosts(videosData, statisticsMap, channelIdentifier)
    } catch (error) {
      logError('YouTube API fetch failed:', error)
      throw error
    }
  }

  private async fetchYouTubeCompetitorPosts(accessToken: string, competitorHandle: string): Promise<SocialMediaPost[]> {
    // Fetch competitor's public channel videos
    return this.fetchYouTubePostsWithToken(accessToken, competitorHandle)
  }

  /**
   * Store intelligence data for user's own account monitoring
   */
  private async storeUserIntelligenceData(userId: string, analysis: SocialMediaAnalysis): Promise<void> {
    try {
      // Schema requires competitor_id. Self-monitoring storage disabled until schema update.
      return;
      /*
      await db.insert(intelligenceData).values({
        competitor_id: null, // Not competitor-specific
        user_id: userId,
        source_type: 'social_media',
        source_url: `https://${analysis.platform}.com`,
        data_type: `${analysis.platform}_self_analysis`,
        raw_content: analysis.posts,
        extracted_data: {
          engagementPatterns: analysis.engagementPatterns,
          contentThemes: analysis.contentThemes,
          postingFrequency: analysis.postingFrequency,
          audienceInsights: analysis.audienceInsights,
          sentiment: analysis.sentiment
        },
        analysis_results: [],
        confidence: analysis.sentiment.overall.confidence.toString(),
        importance: this.calculateImportance(analysis),
        tags: [analysis.platform, 'social_media', 'self_monitoring'],
        collected_at: new Date(),
        processed_at: new Date()
      }); */
    } catch (error) {
      logError('Error storing user intelligence data:', error);
    }
  }

  private transformYouTubePosts(apiData: any, statisticsMap: Map<string, any>, handle: string): SocialMediaPost[] {
    const posts: SocialMediaPost[] = []
    const videos = apiData.items || []
    
    for (const video of videos) {
      const videoId = video.id.videoId
      const stats = statisticsMap.get(videoId) || { viewCount: 0, likeCount: 0, commentCount: 0 }
      
      posts.push({
        id: videoId,
        platform: 'youtube',
        content: video.snippet.title || 'No title',
        author: handle,
        publishedAt: video.snippet.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
        engagement: {
          likes: stats.likeCount,
          shares: 0, // YouTube doesn't provide share count in basic API
          comments: stats.commentCount,
          views: stats.viewCount,
          engagementRate: stats.viewCount > 0 ? (stats.likeCount + stats.commentCount) / stats.viewCount : 0
        },
        mediaUrls: video.snippet.thumbnails?.high?.url ? [video.snippet.thumbnails.high.url] : [],
        hashtags: this.extractHashtags(video.snippet.description || ''),
        mentions: [],
        url: `https://youtube.com/watch?v=${videoId}`
      })
    }
    
    return posts
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w]+/g
    const matches = text.match(hashtagRegex) || []
    return [...new Set(matches.map(tag => tag.toLowerCase()))]
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@[\w]+/g
    const matches = text.match(mentionRegex) || []
    return [...new Set(matches)]
  }



  private async analyzeSinglePostSentiment(content: string): Promise<SentimentScore> {
    // Use OpenAI or Google AI for sentiment analysis
    const openaiApiKey = process.env.OPENAI_API_KEY
    const googleApiKey = process.env.GOOGLE_AI_API_KEY
    
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Analyze the sentiment of this text and return ONLY a JSON object with: score (-1 to 1), magnitude (0 to 1), label (positive/negative/neutral), confidence (0 to 1)'
              },
              {
                role: 'user',
                content: content.substring(0, 1000) // Limit content length
              }
            ],
            temperature: 0.3
          })
        })

        if (response.ok) {
          const data = await response.json()
          const analysisText = data.choices?.[0]?.message?.content || '{}'
          try {
            const analysis = JSON.parse(analysisText.replace(/```json|```/g, '').trim())
            return {
              score: analysis.score || 0,
              magnitude: analysis.magnitude || 0,
              label: analysis.label || 'neutral',
              confidence: analysis.confidence || 0.5
            }
          } catch {
            // Fall through to default
          }
        }
      } catch (error) {
        logError('OpenAI sentiment analysis failed:', error)
      }
    }

    // Fallback to Google AI if OpenAI not available
    if (googleApiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(googleApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Analyze the sentiment of this text and return ONLY a JSON object with: score (-1 to 1), magnitude (0 to 1), label (positive/negative/neutral), confidence (0 to 1). Text: ${content.substring(0, 1000)}`
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        try {
          const analysis = JSON.parse(text.replace(/```json|```/g, '').trim())
          return {
            score: analysis.score || 0,
            magnitude: analysis.magnitude || 0,
            label: analysis.label || 'neutral',
            confidence: analysis.confidence || 0.5
          }
        } catch {
          // Fall through to default
        }
      } catch (error) {
        logError('Google AI sentiment analysis failed:', error)
      }
    }

    // Default neutral sentiment if no AI service available
    logWarn('No AI service configured for sentiment analysis. Using neutral sentiment.')
    return {
      score: 0,
      magnitude: 0,
      label: 'neutral',
      confidence: 0.5
    }
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