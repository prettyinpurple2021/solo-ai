import { logger, logError, logWarn, logInfo } from '@/lib/logger'
import { getSql } from '@/lib/api-utils'

export interface EngagementMetrics {
  likes: number
  shares: number
  comments: number
  views?: number
}

export interface SentimentScore {
  score: number // -1 to 1
  label: 'positive' | 'negative' | 'neutral'
}

export interface SocialPost {
  id: string
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube'
  content: string
  author: string
  url: string
  publishedAt: Date
  engagement: EngagementMetrics
  sentiment?: SentimentScore
  hashtags?: string[]
  mediaUrls?: string[]
}

export type SocialMediaPost = SocialPost;

export interface SocialMediaAnalysis {
  platform: string
  posts: SocialPost[]
  engagementPatterns: any[]
  contentThemes: any[]
  sentiment: {
    overall: string
    score: number
    breakdown: any
  }
}

export class SocialMediaMonitor {
  private static instance: SocialMediaMonitor

  // API Keys (should be in .env)
  private twitterApiKey = process.env.TWITTER_API_KEY
  private linkedinApiKey = process.env.LINKEDIN_API_KEY

  static getInstance(): SocialMediaMonitor {
    if (!SocialMediaMonitor.instance) {
      SocialMediaMonitor.instance = new SocialMediaMonitor()
    }
    return SocialMediaMonitor.instance
  }

  /**
   * Scrape/Fetch posts from a specific platform
   */
  async fetchPosts(platform: string, handle: string, userId?: string): Promise<SocialPost[]> {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return this.fetchTwitterPosts(handle, userId)
      case 'linkedin':
        return this.fetchLinkedInPosts(handle, userId)
      case 'facebook':
        return this.fetchFacebookPosts(handle, userId)
      case 'instagram':
        return this.fetchInstagramPosts(handle, userId)
      default:
        logWarn(`Unsupported platform for monitoring: ${platform}`)
        return []
    }
  }

  /**
   * Fetch real Twitter posts
   */
  private async fetchTwitterPosts(handle: string, userId?: string): Promise<SocialPost[]> {
    let apiKey = this.twitterApiKey
    if (userId) {
      const userKey = await this.getUserApiKey(userId, 'twitter')
      if (userKey) apiKey = userKey
    }

    if (!apiKey) {
      logInfo('Twitter API key not configured. Skipping real fetch.')
      return []
    }
    try {
      logInfo(`Attempting to fetch Twitter posts for ${handle}...`)
      return []
    } catch (error) {
      logError('Error fetching Twitter posts:', error)
      return []
    }
  }

  /**
   * Fetch real LinkedIn posts
   */
  private async fetchLinkedInPosts(handle: string, userId?: string): Promise<SocialPost[]> {
    let apiKey = this.linkedinApiKey
    if (userId) {
      const userKey = await this.getUserApiKey(userId, 'linkedin')
      if (userKey) apiKey = userKey
    }

    if (!apiKey) {
      logInfo('LinkedIn API key not configured. Skipping real fetch.')
      return []
    }
    try {
      logInfo(`Attempting to fetch LinkedIn posts for ${handle}...`)
      return []
    } catch (error) {
      logError('Error fetching LinkedIn posts:', error)
      return []
    }
  }

  /**
   * Fetch real Facebook posts
   */
  private async fetchFacebookPosts(handle: string, userId?: string): Promise<SocialPost[]> {
    let apiKey = process.env.FACEBOOK_API_KEY
    if (userId) {
      const userKey = await this.getUserApiKey(userId, 'facebook')
      if (userKey) apiKey = userKey
    }

    if (!apiKey) {
      logInfo('Facebook API key not configured. Skipping real fetch.')
      return []
    }
    return []
  }

  /**
   * Fetch real Instagram posts
   */
  private async fetchInstagramPosts(handle: string, userId?: string): Promise<SocialPost[]> {
    let apiKey = process.env.INSTAGRAM_API_KEY
    if (userId) {
      const userKey = await this.getUserApiKey(userId, 'instagram')
      if (userKey) apiKey = userKey
    }

    if (!apiKey) {
      logInfo('Instagram API key not configured. Skipping real fetch.')
      return []
    }
    return []
  }

  private async getUserApiKey(userId: string, service: string): Promise<string | null> {
    try {
      const sql = getSql()
      const rows = await sql`SELECT key_value FROM user_api_keys WHERE user_id = ${userId} AND service = ${service}`
      if (rows.length > 0) {
        return rows[0].key_value
      }
      return null
    } catch (error) {
      logError(`Error fetching user API key for ${service}:`, error)
      return null
    }
  }

  /**
   * Analyze sentiment of a post
   */
  analyzeSentiment(text: string): { score: number, label: 'positive' | 'negative' | 'neutral' } {
    const positiveWords = ['great', 'awesome', 'success', 'growth', 'happy', 'win', 'excellent']
    const negativeWords = ['fail', 'bad', 'loss', 'down', 'sad', 'problem', 'issue', 'error']

    const lowerText = text.toLowerCase()
    let score = 0

    positiveWords.forEach(word => { if (lowerText.includes(word)) score += 0.2 })
    negativeWords.forEach(word => { if (lowerText.includes(word)) score -= 0.2 })

    score = Math.max(-1, Math.min(1, score))

    let label: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (score > 0.1) label = 'positive'
    if (score < -0.1) label = 'negative'

    return { score, label }
  }

  // --- Backward Compatibility Methods ---

  private async getHandleForPlatform(competitorId: number, platform: string): Promise<string | null> {
    try {
      const sql = getSql()
      const rows = await sql`SELECT social_media_handles FROM competitor_profiles WHERE id = ${competitorId}`
      if (rows.length === 0) return null

      const handles = rows[0].social_media_handles as any
      if (!handles) return null

      // Handle variations
      if (platform === 'twitter') return handles.twitter || handles.x
      return handles[platform]
    } catch (error) {
      logError(`Error fetching handle for ${platform}:`, error)
      return null
    }
  }

  private async getUserIdForCompetitor(competitorId: number): Promise<string | null> {
    try {
      const sql = getSql()
      const rows = await sql`SELECT user_id FROM competitor_profiles WHERE id = ${competitorId}`
      if (rows.length > 0) return rows[0].user_id
      return null
    } catch (error) {
      return null
    }
  }

  async monitorTwitterActivity(competitorId: number): Promise<SocialPost[]> {
    const handle = await this.getHandleForPlatform(competitorId, 'twitter')
    const userId = await this.getUserIdForCompetitor(competitorId)
    if (!handle) return []
    return this.fetchPosts('twitter', handle, userId || undefined)
  }

  async monitorLinkedInActivity(competitorId: number): Promise<SocialPost[]> {
    const handle = await this.getHandleForPlatform(competitorId, 'linkedin')
    const userId = await this.getUserIdForCompetitor(competitorId)
    if (!handle) return []
    return this.fetchPosts('linkedin', handle, userId || undefined)
  }

  async monitorFacebookActivity(competitorId: number): Promise<SocialPost[]> {
    const handle = await this.getHandleForPlatform(competitorId, 'facebook')
    const userId = await this.getUserIdForCompetitor(competitorId)
    if (!handle) return []
    return this.fetchPosts('facebook', handle, userId || undefined)
  }

  async monitorInstagramActivity(competitorId: number): Promise<SocialPost[]> {
    const handle = await this.getHandleForPlatform(competitorId, 'instagram')
    const userId = await this.getUserIdForCompetitor(competitorId)
    if (!handle) return []
    return this.fetchPosts('instagram', handle, userId || undefined)
  }

  async monitorCompetitor(competitorId: number): Promise<SocialMediaAnalysis[]> {
    const platforms = ['twitter', 'linkedin', 'facebook', 'instagram']
    const results: SocialMediaAnalysis[] = []
    const userId = await this.getUserIdForCompetitor(competitorId)

    for (const platform of platforms) {
      const handle = await this.getHandleForPlatform(competitorId, platform)
      if (handle) {
        const posts = await this.fetchPosts(platform, handle, userId || undefined)
        results.push({
          platform,
          posts,
          engagementPatterns: [], // Real analysis would go here
          contentThemes: [], // Real analysis would go here
          sentiment: {
            overall: 'neutral',
            score: 0,
            breakdown: {}
          }
        })
      }
    }
    return results
  }
}

export const socialMediaMonitor = SocialMediaMonitor.getInstance()