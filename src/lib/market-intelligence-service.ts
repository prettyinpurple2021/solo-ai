import { logError, logInfo, logWarn } from '@/lib/logger'
import { db } from '@/db'
import { marketIntelligenceCache, competitorNewsArticles, competitorSocialMentions } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { nanoid } from 'nanoid'

/**
 * Market Intelligence Service
 * 
 * Centralized service for fetching real-time market data from external sources.
 * Provides intelligent caching, rate limiting, and data aggregation for AI agents.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface NewsArticle {
  id: string
  title: string
  url: string
  source: string
  publishedAt: Date
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  category?: 'product_launch' | 'funding' | 'partnership' | 'pricing' | 'general'
  relevanceScore: number
}

export interface SocialMention {
  id: string
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram'
  content: string
  author?: string
  url?: string
  engagement: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  publishedAt: Date
}

export interface ProductAnnouncement {
  id: string
  title: string
  description: string
  source: string
  url: string
  announcedAt: Date
  features?: string[]
  category: 'new_product' | 'feature_update' | 'deprecation' | 'redesign'
}

export interface MarketEvent {
  id: string
  type: 'funding' | 'pricing_change' | 'partnership' | 'acquisition' | 'expansion'
  title: string
  description: string
  source: string
  url: string
  eventDate: Date
  impact: 'high' | 'medium' | 'low'
}

export interface TrendData {
  id: string
  topic: string
  description: string
  trend: 'rising' | 'stable' | 'declining'
  volume: number
  sources: string[]
  timeframe: string
}

interface BraveSearchResult {
  title: string
  url: string
  description: string
  age?: string
  page_age?: string
  thumbnail?: {
    src: string
  }
}

interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[]
  }
  news?: {
    results: BraveSearchResult[]
  }
}

// ============================================================================
// Market Intelligence Service Class
// ============================================================================

export class MarketIntelligenceService {
  private readonly braveApiKey: string
  private readonly braveApiUrl = 'https://api.search.brave.com/res/v1/web/search'
  private readonly cacheExpiryHours = 24

  constructor() {
    this.braveApiKey = process.env.BRAVE_API_KEY || ''
    if (!this.braveApiKey) {
      logWarn('BRAVE_API_KEY not found in environment variables. Market intelligence will be limited.')
    }
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Search for recent news about a competitor
   */
  async searchCompetitorNews(
    competitorName: string,
    days: number = 30,
    category?: NewsArticle['category']
  ): Promise<NewsArticle[]> {
    try {
      logInfo(`Searching news for competitor: ${competitorName} (last ${days} days)`)

      // Check cache first
      const cacheKey = `news:${competitorName}:${days}:${category || 'all'}`
      const cached = await this.getCachedData(cacheKey)
      if (cached) {
        logInfo('Returning cached news data')
        return cached as NewsArticle[]
      }

      // Build search query
      const query = this.buildNewsQuery(competitorName, category)
      
      // Fetch from Brave Search
      const searchResults = await this.braveSearch(query, 'news')
      
      // Transform to NewsArticle format
      const articles = this.transformToNewsArticles(searchResults, competitorName, days)
      
      // Cache results
      await this.cacheData(cacheKey, articles)
      
      logInfo(`Found ${articles.length} news articles for ${competitorName}`)
      return articles
    } catch (error) {
      logError('Error searching competitor news:', error)
      return []
    }
  }

  /**
   * Get social media mentions and sentiment
   */
  async getCompetitorSocialMentions(
    competitorName: string,
    days: number = 7
  ): Promise<SocialMention[]> {
    try {
      logInfo(`Fetching social mentions for: ${competitorName} (last ${days} days)`)

      // Check cache first
      const cacheKey = `social:${competitorName}:${days}`
      const cached = await this.getCachedData(cacheKey)
      if (cached) {
        logInfo('Returning cached social mentions')
        return cached as SocialMention[]
      }

      // For now, we'll use Brave Search to find social media discussions
      // In the future, this can integrate with the existing social-media-monitor.ts
      const query = `${competitorName} site:twitter.com OR site:linkedin.com`
      const searchResults = await this.braveSearch(query, 'web')
      
      const mentions = this.transformToSocialMentions(searchResults, competitorName, days)
      
      // Cache results
      await this.cacheData(cacheKey, mentions)
      
      logInfo(`Found ${mentions.length} social mentions for ${competitorName}`)
      return mentions
    } catch (error) {
      logError('Error fetching social mentions:', error)
      return []
    }
  }

  /**
   * Search for product launches and announcements
   */
  async searchProductAnnouncements(
    competitorName: string,
    days: number = 60
  ): Promise<ProductAnnouncement[]> {
    try {
      logInfo(`Searching product announcements for: ${competitorName} (last ${days} days)`)

      // Check cache first
      const cacheKey = `product:${competitorName}:${days}`
      const cached = await this.getCachedData(cacheKey)
      if (cached) {
        logInfo('Returning cached product announcements')
        return cached as ProductAnnouncement[]
      }

      // Search for product-related news
      const query = `${competitorName} "product launch" OR "new feature" OR "announcing" OR "released"`
      const searchResults = await this.braveSearch(query, 'news')
      
      const announcements = this.transformToProductAnnouncements(searchResults, competitorName, days)
      
      // Cache results
      await this.cacheData(cacheKey, announcements)
      
      logInfo(`Found ${announcements.length} product announcements for ${competitorName}`)
      return announcements
    } catch (error) {
      logError('Error searching product announcements:', error)
      return []
    }
  }

  /**
   * Search for pricing and funding news
   */
  async searchFundingAndPricing(
    competitorName: string,
    days: number = 90
  ): Promise<MarketEvent[]> {
    try {
      logInfo(`Searching funding/pricing events for: ${competitorName} (last ${days} days)`)

      // Check cache first
      const cacheKey = `funding:${competitorName}:${days}`
      const cached = await this.getCachedData(cacheKey)
      if (cached) {
        logInfo('Returning cached funding/pricing events')
        return cached as MarketEvent[]
      }

      // Search for funding and pricing news
      const query = `${competitorName} "funding" OR "raises" OR "pricing" OR "acquisition" OR "partnership"`
      const searchResults = await this.braveSearch(query, 'news')
      
      const events = this.transformToMarketEvents(searchResults, competitorName, days)
      
      // Cache results
      await this.cacheData(cacheKey, events)
      
      logInfo(`Found ${events.length} market events for ${competitorName}`)
      return events
    } catch (error) {
      logError('Error searching funding/pricing events:', error)
      return []
    }
  }

  /**
   * Get industry trends and market analysis
   */
  async getIndustryTrends(
    industry: string,
    days: number = 30
  ): Promise<TrendData[]> {
    try {
      logInfo(`Fetching industry trends for: ${industry} (last ${days} days)`)

      // Check cache first
      const cacheKey = `trends:${industry}:${days}`
      const cached = await this.getCachedData(cacheKey)
      if (cached) {
        logInfo('Returning cached industry trends')
        return cached as TrendData[]
      }

      // Search for industry trends
      const query = `${industry} trends OR "market analysis" OR "industry report"`
      const searchResults = await this.braveSearch(query, 'news')
      
      const trends = this.transformToTrendData(searchResults, industry, days)
      
      // Cache results
      await this.cacheData(cacheKey, trends)
      
      logInfo(`Found ${trends.length} industry trends for ${industry}`)
      return trends
    } catch (error) {
      logError('Error fetching industry trends:', error)
      return []
    }
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Perform Brave Search API request
   */
  private async braveSearch(
    query: string,
    searchType: 'web' | 'news' = 'web'
  ): Promise<BraveSearchResult[]> {
    if (!this.braveApiKey) {
      logWarn('Brave API key not configured, returning empty results')
      return []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        count: '20',
        search_lang: 'en',
        safesearch: 'moderate',
      })

      if (searchType === 'news') {
        params.append('freshness', 'pm') // Past month
      }

      const response = await fetch(`${this.braveApiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.braveApiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`)
      }

      const data: BraveSearchResponse = await response.json()
      
      // Return news results if available, otherwise web results
      if (searchType === 'news' && data.news?.results) {
        return data.news.results
      }
      
      return data.web?.results || []
    } catch (error) {
      logError('Brave Search API request failed:', error)
      return []
    }
  }

  /**
   * Build optimized news query
   */
  private buildNewsQuery(competitorName: string, category?: NewsArticle['category']): string {
    let query = `"${competitorName}"`
    
    if (category) {
      const categoryKeywords = {
        product_launch: 'product launch OR new product OR released',
        funding: 'funding OR raises OR investment',
        partnership: 'partnership OR collaboration OR announces',
        pricing: 'pricing OR price change OR subscription',
        general: '',
      }
      
      const keywords = categoryKeywords[category]
      if (keywords) {
        query += ` ${keywords}`
      }
    }
    
    return query
  }

  /**
   * Transform Brave Search results to NewsArticle format
   */
  private transformToNewsArticles(
    results: BraveSearchResult[],
    competitorName: string,
    maxDays: number
  ): NewsArticle[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)

    return results
      .map((result) => {
        const publishedAt = this.parsePublishDate(result.age || result.page_age)
        
        // Filter out results older than maxDays
        if (publishedAt < cutoffDate) {
          return null
        }

        return {
          id: nanoid(),
          title: result.title,
          url: result.url,
          source: this.extractDomain(result.url),
          publishedAt,
          summary: result.description,
          sentiment: this.detectSentiment(result.title + ' ' + result.description),
          category: this.detectCategory(result.title + ' ' + result.description),
          relevanceScore: this.calculateRelevance(result, competitorName),
        }
      })
      .filter((article): article is NewsArticle => article !== null)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  /**
   * Transform Brave Search results to SocialMention format
   */
  private transformToSocialMentions(
    results: BraveSearchResult[],
    competitorName: string,
    maxDays: number
  ): SocialMention[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)

    return results
      .map((result) => {
        const publishedAt = this.parsePublishDate(result.age || result.page_age)
        
        if (publishedAt < cutoffDate) {
          return null
        }

        const platform = this.detectPlatform(result.url)
        if (!platform) {
          return null
        }

        return {
          id: nanoid(),
          platform,
          content: result.description || result.title,
          url: result.url,
          engagement: 0, // Would need platform API for real engagement data
          sentiment: this.detectSentiment(result.description || result.title),
          publishedAt,
        }
      })
      .filter((mention): mention is SocialMention => mention !== null)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  /**
   * Transform Brave Search results to ProductAnnouncement format
   */
  private transformToProductAnnouncements(
    results: BraveSearchResult[],
    competitorName: string,
    maxDays: number
  ): ProductAnnouncement[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)

    return results
      .map((result) => {
        const announcedAt = this.parsePublishDate(result.age || result.page_age)
        
        if (announcedAt < cutoffDate) {
          return null
        }

        return {
          id: nanoid(),
          title: result.title,
          description: result.description || '',
          source: this.extractDomain(result.url),
          url: result.url,
          announcedAt,
          category: this.detectProductCategory(result.title + ' ' + result.description),
        }
      })
      .filter((announcement): announcement is ProductAnnouncement => announcement !== null)
      .sort((a, b) => b.announcedAt.getTime() - a.announcedAt.getTime())
  }

  /**
   * Transform Brave Search results to MarketEvent format
   */
  private transformToMarketEvents(
    results: BraveSearchResult[],
    competitorName: string,
    maxDays: number
  ): MarketEvent[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)

    return results
      .map((result) => {
        const eventDate = this.parsePublishDate(result.age || result.page_age)
        
        if (eventDate < cutoffDate) {
          return null
        }

        return {
          id: nanoid(),
          type: this.detectEventType(result.title + ' ' + result.description),
          title: result.title,
          description: result.description || '',
          source: this.extractDomain(result.url),
          url: result.url,
          eventDate,
          impact: this.assessEventImpact(result.title + ' ' + result.description),
        }
      })
      .filter((event): event is MarketEvent => event !== null)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
  }

  /**
   * Transform Brave Search results to TrendData format
   */
  private transformToTrendData(
    results: BraveSearchResult[],
    industry: string,
    maxDays: number
  ): TrendData[] {
    // Group results by topic/theme
    const topicMap = new Map<string, BraveSearchResult[]>()
    
    results.forEach((result) => {
      const topic = this.extractTopic(result.title)
      if (!topicMap.has(topic)) {
        topicMap.set(topic, [])
      }
      topicMap.get(topic)!.push(result)
    })

    return Array.from(topicMap.entries())
      .map(([topic, sources]) => ({
        id: nanoid(),
        topic,
        description: sources[0].description || '',
        trend: 'rising' as const, // Would need time-series data for accurate trend
        volume: sources.length,
        sources: sources.map((s) => s.url),
        timeframe: `Last ${maxDays} days`,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10) // Top 10 trends
  }

  // ==========================================================================
  // Caching Methods
  // ==========================================================================

  /**
   * Get cached data if available and not expired
   */
  private async getCachedData(cacheKey: string): Promise<any | null> {
    try {
      const now = new Date()
      const result = await db
        .select()
        .from(marketIntelligenceCache)
        .where(
          and(
            eq(marketIntelligenceCache.id, cacheKey),
            gte(marketIntelligenceCache.expiresAt, now)
          )
        )
        .limit(1)

      if (result.length > 0) {
        return result[0].data
      }

      return null
    } catch (error) {
      logError('Error retrieving cached data:', error)
      return null
    }
  }

  /**
   * Cache data with expiry
   */
  private async cacheData(cacheKey: string, data: any): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + this.cacheExpiryHours)

      await db
        .insert(marketIntelligenceCache)
        .values({
          id: cacheKey,
          source: 'brave_search',
          query: cacheKey,
          data: data as any,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: marketIntelligenceCache.id,
          set: {
            data: data as any,
            expiresAt,
          },
        })

      logInfo(`Cached data for key: ${cacheKey}`)
    } catch (error) {
      logError('Error caching data:', error)
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Parse publish date from Brave Search age string
   */
  private parsePublishDate(age?: string): Date {
    if (!age) {
      return new Date()
    }

    const now = new Date()
    
    // Parse formats like "2 days ago", "1 week ago", "3 hours ago"
    const match = age.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i)
    if (match) {
      const value = parseInt(match[1])
      const unit = match[2].toLowerCase()
      
      switch (unit) {
        case 'minute':
          now.setMinutes(now.getMinutes() - value)
          break
        case 'hour':
          now.setHours(now.getHours() - value)
          break
        case 'day':
          now.setDate(now.getDate() - value)
          break
        case 'week':
          now.setDate(now.getDate() - value * 7)
          break
        case 'month':
          now.setMonth(now.getMonth() - value)
          break
        case 'year':
          now.setFullYear(now.getFullYear() - value)
          break
      }
    }
    
    return now
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'unknown'
    }
  }

  /**
   * Detect sentiment from text
   */
  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lowerText = text.toLowerCase()
    
    const positiveWords = ['success', 'growth', 'launch', 'innovative', 'award', 'partnership', 'expansion']
    const negativeWords = ['fail', 'decline', 'lawsuit', 'controversy', 'layoff', 'shutdown']
    
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  /**
   * Detect news category from text
   */
  private detectCategory(text: string): NewsArticle['category'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('product') || lowerText.includes('launch') || lowerText.includes('feature')) {
      return 'product_launch'
    }
    if (lowerText.includes('funding') || lowerText.includes('raise') || lowerText.includes('investment')) {
      return 'funding'
    }
    if (lowerText.includes('partner') || lowerText.includes('collaboration')) {
      return 'partnership'
    }
    if (lowerText.includes('pricing') || lowerText.includes('price')) {
      return 'pricing'
    }
    
    return 'general'
  }

  /**
   * Detect product category from text
   */
  private detectProductCategory(text: string): ProductAnnouncement['category'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('new product') || lowerText.includes('launching')) {
      return 'new_product'
    }
    if (lowerText.includes('update') || lowerText.includes('feature') || lowerText.includes('improvement')) {
      return 'feature_update'
    }
    if (lowerText.includes('deprecat') || lowerText.includes('sunset') || lowerText.includes('discontinu')) {
      return 'deprecation'
    }
    if (lowerText.includes('redesign') || lowerText.includes('rebrand')) {
      return 'redesign'
    }
    
    return 'feature_update'
  }

  /**
   * Detect event type from text
   */
  private detectEventType(text: string): MarketEvent['type'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('funding') || lowerText.includes('raise') || lowerText.includes('investment')) {
      return 'funding'
    }
    if (lowerText.includes('pricing') || lowerText.includes('price')) {
      return 'pricing_change'
    }
    if (lowerText.includes('partner') || lowerText.includes('collaboration')) {
      return 'partnership'
    }
    if (lowerText.includes('acqui') || lowerText.includes('merger')) {
      return 'acquisition'
    }
    if (lowerText.includes('expand') || lowerText.includes('market entry')) {
      return 'expansion'
    }
    
    return 'partnership'
  }

  /**
   * Assess event impact
   */
  private assessEventImpact(text: string): MarketEvent['impact'] {
    const lowerText = text.toLowerCase()
    
    const highImpactWords = ['billion', 'acquisition', 'ipo', 'major', 'significant']
    const lowImpactWords = ['minor', 'small', 'limited']
    
    if (highImpactWords.some((word) => lowerText.includes(word))) {
      return 'high'
    }
    if (lowImpactWords.some((word) => lowerText.includes(word))) {
      return 'low'
    }
    
    return 'medium'
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(result: BraveSearchResult, competitorName: string): number {
    const titleMatch = result.title.toLowerCase().includes(competitorName.toLowerCase())
    const descMatch = result.description?.toLowerCase().includes(competitorName.toLowerCase())
    
    let score = 0
    if (titleMatch) score += 0.6
    if (descMatch) score += 0.4
    
    return Math.min(score, 1.0)
  }

  /**
   * Detect social media platform from URL
   */
  private detectPlatform(url: string): SocialMention['platform'] | null {
    const lowerUrl = url.toLowerCase()
    
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'twitter'
    }
    if (lowerUrl.includes('linkedin.com')) {
      return 'linkedin'
    }
    if (lowerUrl.includes('facebook.com')) {
      return 'facebook'
    }
    if (lowerUrl.includes('instagram.com')) {
      return 'instagram'
    }
    
    return null
  }

  /**
   * Extract topic from title
   */
  private extractTopic(title: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const words = title.toLowerCase().split(' ')
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']
    
    const meaningfulWords = words.filter((word) => !stopWords.includes(word) && word.length > 3)
    
    return meaningfulWords.slice(0, 3).join(' ') || 'General'
  }
}

// Export singleton instance
export const marketIntelligenceService = new MarketIntelligenceService()
