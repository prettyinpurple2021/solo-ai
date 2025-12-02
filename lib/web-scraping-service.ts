// import { z } from 'zod'
import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import * as cheerio from 'cheerio'
import robotsParser from 'robots-parser'

// Types for web scraping operations
export interface ScrapingConfig {
  respectRobotsTxt: boolean
  userAgent: string
  requestDelay: number
  maxRetries: number
  timeout: number
  maxConcurrentRequests: number
}

export interface WebsiteData {
  url: string
  title?: string
  description?: string
  content: string
  metadata: Record<string, any>
  scrapedAt: Date
  responseTime: number
  statusCode: number
}

export interface ChangeDetection {
  url: string
  changeType: 'content' | 'structure' | 'metadata' | 'pricing' | 'product'
  oldValue?: string
  newValue?: string
  confidence: number
  detectedAt: Date
}

export interface PricingData {
  url: string
  plans: PricingPlan[]
  currency?: string
  lastUpdated: Date
}

export interface PricingPlan {
  name: string
  price: number
  interval: 'monthly' | 'yearly' | 'one-time'
  features: string[]
  isPopular?: boolean
}

export interface ProductData {
  url: string
  products: Product[]
  categories: string[]
  lastUpdated: Date
}

export interface Product {
  name: string
  description?: string
  category?: string
  features: string[]
  status: 'active' | 'deprecated' | 'beta' | 'coming-soon'
  launchedAt?: Date
}

export interface JobPosting {
  title: string
  department?: string
  location?: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  remote: boolean
  requirements: string[]
  description: string
  postedAt: Date
  url: string
  strategicImportance: 'low' | 'medium' | 'high' | 'critical'
}

export interface ScrapingResult<T = any> {
  success: boolean
  data?: T
  error?: string
  retryCount: number
  responseTime: number
  cached: boolean
}

// Default configuration
const DEFAULT_CONFIG: ScrapingConfig = {
  respectRobotsTxt: true,
  userAgent: 'SoloSuccess-Intelligence-Bot/1.0 (+https://solobossai.fun/robots)',
  requestDelay: 1000, // 1 second between requests
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  maxConcurrentRequests: 5,
}

/**
 * Ethical Web Scraping Service
 * 
 * This service provides ethical web scraping capabilities with:
 * - robots.txt compliance
 * - Rate limiting and respectful crawling
 * - Change detection and monitoring
 * - Structured data extraction for pricing, products, and jobs
 */
export class WebScrapingService {
  private config: ScrapingConfig
  private robotsCache: Map<string, any> = new Map()
  private rateLimitTracker: Map<string, number> = new Map()
  private requestQueue: Array<() => Promise<any>> = []
  private activeRequests = 0
  private contentCache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Scrape a competitor's website with full compliance checks
   */
  async scrapeCompetitorWebsite(url: string): Promise<ScrapingResult<WebsiteData>> {
    const startTime = Date.now()

    try {
      // Check cache first
      const cached = this.getFromCache(`website:${url}`)
      if (cached) {
        return {
          success: true,
          data: cached,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: true,
        }
      }

      // Validate URL and check robots.txt
      const canScrape = await this.canScrapeUrl(url)
      if (!canScrape) {
        return {
          success: false,
          error: 'Scraping not allowed by robots.txt',
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      // Rate limiting
      await this.respectRateLimit(this.getDomain(url))

      // Perform the scraping (simplified without cheerio)
      const result = await this.executeWithRetry(async () => {
        const response = await this.fetchWithTimeout(url)
        const html = response.body

        // Simple text extraction without cheerio
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : ''

        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
          html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
        const description = descMatch ? descMatch[1] : undefined

        return {
          url,
          title,
          description,
          content: response.body,
          metadata: this.extractSimpleMetadata(html),
          scrapedAt: new Date(),
          responseTime: Date.now() - startTime,
          statusCode: response.status,
        }
      })

      // Cache the result
      if (result.success && result.data) {
        this.setCache(`website:${url}`, result.data)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  /**
   * Detect changes in website content
   */
  async detectWebsiteChanges(url: string, previousContent?: string): Promise<ScrapingResult<ChangeDetection[]>> {
    const startTime = Date.now()

    try {
      const scrapingResult = await this.scrapeCompetitorWebsite(url)
      if (!scrapingResult.success || !scrapingResult.data) {
        return {
          success: false,
          error: scrapingResult.error,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      const changes: ChangeDetection[] = []

      if (previousContent) {
        const currentContent = scrapingResult.data.content
        const contentChanges = this.detectContentChanges(previousContent, currentContent, url)
        changes.push(...contentChanges)
      }

      return {
        success: true,
        data: changes,
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Change detection failed',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  /**
   * Monitor pricing pages for changes
   */
  async monitorPricingPages(url: string): Promise<ScrapingResult<PricingData>> {
    const startTime = Date.now()

    try {
      const cached = this.getFromCache(`pricing:${url}`)
      if (cached) {
        return {
          success: true,
          data: cached,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: true,
        }
      }

      const scrapingResult = await this.scrapeCompetitorWebsite(url)
      if (!scrapingResult.success || !scrapingResult.data) {
        return {
          success: false,
          error: scrapingResult.error,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      const html = scrapingResult.data.content
      const pricingData = this.extractPricingData(html, url)

      if (pricingData) {
        this.setCache(`pricing:${url}`, pricingData)
        return {
          success: true,
          data: pricingData,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      return {
        success: false,
        error: 'No pricing data found',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pricing monitoring failed',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  /**
   * Track product pages for feature updates
   */
  async trackProductPages(url: string): Promise<ScrapingResult<ProductData>> {
    const startTime = Date.now()

    try {
      const cached = this.getFromCache(`products:${url}`)
      if (cached) {
        return {
          success: true,
          data: cached,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: true,
        }
      }

      const scrapingResult = await this.scrapeCompetitorWebsite(url)
      if (!scrapingResult.success || !scrapingResult.data) {
        return {
          success: false,
          error: scrapingResult.error,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      const html = scrapingResult.data.content
      const productData = this.extractProductData(html, url)

      if (productData) {
        this.setCache(`products:${url}`, productData)
        return {
          success: true,
          data: productData,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      return {
        success: false,
        error: 'No product data found',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product tracking failed',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  /**
   * Scrape job postings with strategic analysis
   */
  async scrapeJobPostings(url: string): Promise<ScrapingResult<JobPosting[]>> {
    const startTime = Date.now()

    try {
      const cached = this.getFromCache(`jobs:${url}`)
      if (cached) {
        return {
          success: true,
          data: cached,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: true,
        }
      }

      const scrapingResult = await this.scrapeCompetitorWebsite(url)
      if (!scrapingResult.success || !scrapingResult.data) {
        return {
          success: false,
          error: scrapingResult.error,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      const html = scrapingResult.data.content
      const jobPostings = this.extractJobPostings(html, url)

      if (jobPostings.length > 0) {
        this.setCache(`jobs:${url}`, jobPostings)
        return {
          success: true,
          data: jobPostings,
          retryCount: 0,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      return {
        success: false,
        error: 'No job postings found',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Job scraping failed',
        retryCount: 0,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  // Private helper methods

  private async canScrapeUrl(url: string): Promise<boolean> {
    if (!this.config.respectRobotsTxt) return true

    try {
      const domain = this.getDomain(url)

      // Check cache first
      if (this.robotsCache.has(domain)) {
        const robots = this.robotsCache.get(domain)
        return robots.isAllowed(url, this.config.userAgent)
      }

      // Fetch and parse robots.txt
      const robotsUrl = `${domain}/robots.txt`
      const response = await this.fetchWithTimeout(robotsUrl)
      const robots = robotsParser(robotsUrl, response.body)

      // Cache the robots.txt for future use
      this.robotsCache.set(domain, robots)

      return robots.isAllowed(url, this.config.userAgent) ?? true
    } catch (error) {
      // If robots.txt is not accessible, allow scraping but log warning
      logWarn(`Could not fetch robots.txt for ${url}:`, error)
      return true
    }
  }

  private async respectRateLimit(domain: string): Promise<void> {
    const now = Date.now()
    const lastRequest = this.rateLimitTracker.get(domain) || 0
    const timeSinceLastRequest = now - lastRequest

    if (timeSinceLastRequest < this.config.requestDelay) {
      const waitTime = this.config.requestDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.rateLimitTracker.set(domain, Date.now())
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<ScrapingResult<T>> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const data = await operation()
        return {
          success: true,
          data,
          retryCount: attempt,
          responseTime: 0, // Will be set by caller
          cached: false,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // Don't retry on certain errors
        if (lastError.message.includes('HTTP 4') || lastError.message.includes('robots.txt')) {
          break
        }

        if (attempt < this.config.maxRetries) {
          // Exponential backoff with max delay
          const delay = Math.min(Math.pow(2, attempt) * 1000, 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Operation failed after retries',
      retryCount: this.config.maxRetries,
      responseTime: 0,
      cached: false,
    }
  }

  private async fetchWithTimeout(url: string): Promise<{ body: string; status: number }> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const body = await response.text()
      return { body, status: response.status }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private getDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.hostname}`
    } catch {
      throw new Error(`Invalid URL: ${url}`)
    }
  }

  private extractSimpleMetadata(html: string): Record<string, any> {
    const metadata: Record<string, any> = {}

    // Extract basic meta tags with regex
    const metaRegex = /<meta[^>]*(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*/gi
    let match

    while ((match = metaRegex.exec(html)) !== null) {
      metadata[match[1]] = match[2]
    }

    // Try to extract JSON-LD structured data
    const structuredDataRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi
    const structuredDataMatches = html.match(structuredDataRegex)
    if (structuredDataMatches) {
      metadata.structuredData = []
      structuredDataMatches.forEach(match => {
        try {
          const jsonMatch = match.match(/>([^<]*)</)
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1])
            metadata.structuredData.push(jsonData)
          }
        } catch {
          // Ignore invalid JSON
        }
      })
    }

    return metadata
  }

  private detectContentChanges(oldContent: string, newContent: string, url: string): ChangeDetection[] {
    const changes: ChangeDetection[] = []

    // Simple text-based change detection
    if (oldContent !== newContent) {
      // Calculate similarity (simplified)
      const similarity = this.calculateSimilarity(oldContent, newContent)

      changes.push({
        url,
        changeType: 'content',
        oldValue: oldContent.substring(0, 200) + '...',
        newValue: newContent.substring(0, 200) + '...',
        confidence: 1 - similarity,
        detectedAt: new Date(),
      })
    }

    return changes
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(str1.toLowerCase().split(/\s+/))
    const set2 = new Set(str2.toLowerCase().split(/\s+/))

    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])

    return intersection.size / union.size
  }

  private extractPricingData(html: string, url: string): PricingData | null {
    try {
      const plans: PricingPlan[] = []

      // Find all pricing plan divs using regex
      // Match <div class="pricing-plan [optional classes]">...</div>
      const pricingPlanRegex = /<div[^>]*class="[^"]*pricing-plan[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*pricing-plan|<\/body|$)/gi

      let planMatch
      while ((planMatch = pricingPlanRegex.exec(html)) !== null) {
        const planHtml = planMatch[0]
        const planContent = planMatch[1]

        // Extract plan name from <h3> tag
        const nameMatch = planContent.match(/<h3[^>]*>([^<]+)<\/h3>/i)
        const name = nameMatch ? nameMatch[1].trim() : ''

        // Extract price from .price div
        const priceMatch = planContent.match(/<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/div>/i)
        const priceText = priceMatch ? priceMatch[1].trim() : ''
        const price = this.extractPrice(priceText)

        // Extract features from <ul> list
        const features: string[] = []
        const ulMatch = planContent.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i)
        if (ulMatch) {
          const ulContent = ulMatch[1]
          const featureRegex = /<li[^>]*>([^<]+)<\/li>/gi
          let featureMatch
          while ((featureMatch = featureRegex.exec(ulContent)) !== null) {
            features.push(featureMatch[1].trim())
          }
        }

        // Check if this plan is popular (has "popular" class)
        const isPopular = /class="[^"]*\bpopular\b[^"]*"/.test(planHtml)

        // Detect interval from price text
        const interval = this.detectInterval(priceText)

        if (name && price !== null) {
          plans.push({
            name,
            price,
            interval,
            features,
            isPopular,
          })
        }
      }

      if (plans.length === 0) {
        return null
      }

      const currency = this.detectCurrency(html)

      return {
        url,
        plans,
        currency,
        lastUpdated: new Date(),
      }
    } catch (error) {
      logError('Error extracting pricing data:', error)
      return null
    }
  }

  private extractPrice(priceText: string): number | null {
    // Extract price from formats like "$9.99/month", "$19.99", etc.
    const priceMatch = priceText.match(/\$([\d.,]+)/)
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ''))
    }
    return null
  }

  private detectInterval(priceText: string): 'monthly' | 'yearly' | 'one-time' {
    const text = priceText.toLowerCase()
    if (text.includes('year') || text.includes('annual')) return 'yearly'
    if (text.includes('month')) return 'monthly'
    return 'one-time'
  }

  private detectCurrency(html: string): string {
    if (html.includes('$')) return 'USD'
    if (html.includes('€')) return 'EUR'
    if (html.includes('£')) return 'GBP'
    return 'USD' // Default
  }

  private extractProductData(html: string, url: string): ProductData | null {
    try {
      const $ = cheerio.load(html)
      const products: Product[] = []

      // Find all elements with class "product"
      $('.product').each((_, element) => {
        const $product = $(element)

        // Extract name from h2 tag
        const name = $product.find('h2').text().trim()

        // Extract description from .description class
        const description = $product.find('.description').text().trim()

        // Extract features from ul li tags
        const features: string[] = []
        $product.find('ul li').each((_, li) => {
          const feature = $(li).text().trim()
          if (feature) {
            features.push(feature)
          }
        })

        // Only add product if it has a name
        if (name) {
          products.push({
            name,
            description: description || undefined,
            features,
            status: 'active', // Default status
            category: undefined, // Could be extracted if available
            launchedAt: undefined, // Could be extracted if available
          })
        }
      })

      if (products.length === 0) {
        return null
      }

      return {
        url,
        products,
        categories: [], // Could extract categories if needed
        lastUpdated: new Date(),
      }
    } catch (error) {
      logError('Error extracting product data:', error)
      return null
    }
  }

  private extractJobPostings(html: string, url: string): JobPosting[] {
    try {
      const $ = cheerio.load(html)
      const jobPostings: JobPosting[] = []

      // Find all elements with class "job"
      $('.job').each((_, element) => {
        const $job = $(element)

        // Extract job title from h3.job-title or h3
        const title = $job.find('h3.job-title, h3').first().text().trim()

        // Extract location
        const location = $job.find('.location').text().trim()

        // Extract department
        const department = $job.find('.department').text().trim()

        // Extract description
        const description = $job.find('.job-description, p').first().text().trim()

        // Extract requirements from ul li
        const requirements: string[] = []
        $job.find('ul li').each((_, li) => {
          const requirement = $(li).text().trim()
          if (requirement) {
            requirements.push(requirement)
          }
        })

        // Determine job type and remote status
        const fullJobText = $job.text().toLowerCase()
        const type = this.detectJobType(fullJobText)
        const remote = this.detectRemote(fullJobText)
        const strategicImportance = this.assessJobImportance(title, department)

        // Only add job if it has a title
        if (title) {
          jobPostings.push({
            title,
            department: department || undefined,
            location: location || undefined,
            type,
            remote,
            requirements,
            description,
            postedAt: new Date(), // Default to current date
            url,
            strategicImportance,
          })
        }
      })

      return jobPostings
    } catch (error) {
      logError('Error extracting job postings:', error)
      return []
    }
  }

  private detectJobType(text: string): 'full-time' | 'part-time' | 'contract' | 'internship' {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('intern')) return 'internship'
    if (lowerText.includes('contract') || lowerText.includes('freelance')) return 'contract'
    if (lowerText.includes('part-time')) return 'part-time'
    return 'full-time'
  }

  private detectRemote(text: string): boolean {
    const lowerText = text.toLowerCase()
    return lowerText.includes('remote') || lowerText.includes('work from home') || lowerText.includes('distributed')
  }

  private assessJobImportance(title: string, department?: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerTitle = title.toLowerCase()
    const lowerDept = department?.toLowerCase() || ''

    // Critical roles
    if (lowerTitle.includes('ceo') || lowerTitle.includes('cto') || lowerTitle.includes('founder')) {
      return 'critical'
    }

    // High importance roles
    if (lowerTitle.includes('director') || lowerTitle.includes('vp') || lowerTitle.includes('head of') ||
      lowerDept.includes('engineering') || lowerDept.includes('product') || lowerDept.includes('sales')) {
      return 'high'
    }

    // Medium importance roles
    if (lowerTitle.includes('manager') || lowerTitle.includes('lead') || lowerTitle.includes('senior')) {
      return 'medium'
    }

    return 'low'
  }

  private getFromCache(key: string): any {
    const cached = this.contentCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.contentCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }
}

// Export singleton instance
export const webScrapingService = new WebScrapingService()