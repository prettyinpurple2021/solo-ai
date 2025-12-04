import { z } from 'zod'
import type {
  CompetitorProfile,
  CompetitorProfileUpdate,
  ThreatLevel,
  SocialMediaHandles,
  KeyPerson,
  Product
} from './competitor-intelligence-types'

// Configuration for enrichment service
interface EnrichmentConfig {
  enableWebScraping: boolean
  enableSocialMediaDiscovery: boolean
  enablePersonnelMapping: boolean
  enableThreatAssessment: boolean
  respectRateLimit: boolean
  maxRetries: number
}

// Default configuration
const DEFAULT_CONFIG: EnrichmentConfig = {
  enableWebScraping: true,
  enableSocialMediaDiscovery: true,
  enablePersonnelMapping: true,
  enableThreatAssessment: true,
  respectRateLimit: true,
  maxRetries: 3,
}

// Company information extracted from various sources
interface CompanyInfo {
  name: string
  domain?: string
  description?: string
  industry?: string
  headquarters?: string
  foundedYear?: number
  employeeCount?: number
  fundingAmount?: number
  fundingStage?: string
  socialMediaHandles?: SocialMediaHandles
  keyPersonnel?: KeyPerson[]
  products?: Product[]
  competitiveAdvantages?: string[]
  vulnerabilities?: string[]
}

// Enrichment result with confidence scores
interface EnrichmentResult {
  success: boolean
  data?: CompetitorProfileUpdate
  confidence: number
  sources: string[]
  errors: string[]
  warnings: string[]
}

// Social media platform patterns for URL validation
const SOCIAL_MEDIA_PATTERNS = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9-_]+\/?$/,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.-]+\/?$/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
  youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user)\/[a-zA-Z0-9_-]+\/?$/,
}

// Industry keywords for threat assessment
const INDUSTRY_KEYWORDS = {
  'technology': ['software', 'saas', 'tech', 'digital', 'ai', 'ml', 'cloud', 'platform'],
  'finance': ['fintech', 'banking', 'payment', 'financial', 'investment', 'trading'],
  'healthcare': ['health', 'medical', 'pharma', 'biotech', 'telemedicine', 'wellness'],
  'ecommerce': ['ecommerce', 'retail', 'marketplace', 'shopping', 'commerce'],
  'education': ['edtech', 'education', 'learning', 'training', 'academic'],
  'marketing': ['martech', 'advertising', 'marketing', 'analytics', 'crm'],
}

/**
 * Competitor Profile Enrichment Service
 * 
 * This service automatically enriches competitor profiles by gathering data from:
 * - Company websites and business directories
 * - Social media platforms
 * - Public personnel information
 * - Market analysis for threat assessment
 */
export class CompetitorEnrichmentService {
  private config: EnrichmentConfig
  private rateLimitTracker: Map<string, number> = new Map()

  constructor(config: Partial<EnrichmentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Main enrichment method that orchestrates all enrichment processes
   */
  async enrichCompetitorProfile(
    competitorData: Partial<CompetitorProfile>,
    userBusinessDomain?: string
  ): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      confidence: 0,
      sources: [],
      errors: [],
      warnings: [],
    }

    try {
      const enrichedData: CompetitorProfileUpdate = {}
      let totalConfidence = 0
      let confidenceCount = 0

      // 1. Extract company information from website
      if (this.config.enableWebScraping && competitorData.domain) {
        try {
          const websiteInfo = await this.extractCompanyInfoFromWebsite(competitorData.domain)
          if (websiteInfo.success) {
            Object.assign(enrichedData, websiteInfo.data)
            totalConfidence += websiteInfo.confidence
            confidenceCount++
            result.sources.push('company_website')
          } else {
            result.warnings.push(`Website extraction failed: ${websiteInfo.errors.join(', ')}`)
          }
        } catch (error) {
          result.warnings.push(`Website extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // 2. Discover and validate social media handles
      if (this.config.enableSocialMediaDiscovery) {
        try {
          const socialMediaInfo = await this.discoverSocialMediaHandles(
            competitorData.name || '',
            competitorData.domain
          )
          if (socialMediaInfo.success) {
            enrichedData.socialMediaHandles = {
              ...enrichedData.socialMediaHandles,
              ...socialMediaInfo.data?.socialMediaHandles,
            }
            totalConfidence += socialMediaInfo.confidence
            confidenceCount++
            result.sources.push('social_media_discovery')
          } else {
            result.warnings.push(`Social media discovery failed: ${socialMediaInfo.errors.join(', ')}`)
          }
        } catch (error) {
          result.warnings.push(`Social media discovery error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // 3. Identify key personnel
      if (this.config.enablePersonnelMapping && competitorData.domain) {
        try {
          const personnelInfo = await this.identifyKeyPersonnel(
            competitorData.name || '',
            competitorData.domain
          )
          if (personnelInfo.success) {
            enrichedData.keyPersonnel = [
              ...(enrichedData.keyPersonnel || []),
              ...(personnelInfo.data?.keyPersonnel || []),
            ]
            totalConfidence += personnelInfo.confidence
            confidenceCount++
            result.sources.push('personnel_mapping')
          } else {
            result.warnings.push(`Personnel mapping failed: ${personnelInfo.errors.join(', ')}`)
          }
        } catch (error) {
          result.warnings.push(`Personnel mapping error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // 4. Assess threat level based on market overlap and company characteristics
      if (this.config.enableThreatAssessment) {
        try {
          const threatAssessment = await this.assessThreatLevel(
            { ...competitorData, ...enrichedData } as CompetitorProfile,
            userBusinessDomain
          )
          if (threatAssessment.success) {
            enrichedData.threatLevel = threatAssessment.data?.threatLevel
            enrichedData.competitiveAdvantages = [
              ...(enrichedData.competitiveAdvantages || []),
              ...(threatAssessment.data?.competitiveAdvantages || []),
            ]
            enrichedData.vulnerabilities = [
              ...(enrichedData.vulnerabilities || []),
              ...(threatAssessment.data?.vulnerabilities || []),
            ]
            totalConfidence += threatAssessment.confidence
            confidenceCount++
            result.sources.push('threat_assessment')
          } else {
            result.warnings.push(`Threat assessment failed: ${threatAssessment.errors.join(', ')}`)
          }
        } catch (error) {
          result.warnings.push(`Threat assessment error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Calculate overall confidence
      result.confidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0
      result.data = enrichedData
      result.success = Object.keys(enrichedData).length > 0

      return result
    } catch (error) {
      result.errors.push(`Enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Extract company information from website
   */
  private async extractCompanyInfoFromWebsite(domain: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      confidence: 0,
      sources: ['website_scraping'],
      errors: [],
      warnings: [],
    }

    try {
      if (!this.checkRateLimit('website_scraping')) {
        result.errors.push('Rate limit exceeded for website scraping')
        return result
      }

      const { webScrapingService } = await import('@/lib/web-scraping-service')
      const url = domain.startsWith('http') ? domain : `https://${domain}`
      const scrape = await webScrapingService.scrapeCompetitorWebsite(url)
      if (!scrape.success || !scrape.data) {
        result.errors.push(scrape.error || 'Website scrape failed')
        return result
      }

      const html = scrape.data.content
      // Cheerio removed - using simplified parsing

      // Basic fields from meta tags using regex
      let description: string | undefined
      const descMatch = html.match(/<meta[^>]*(?:name=["']description["']|property=["']og:description["'])[^>]*content=["']([^"']*)["']/i)
      if (descMatch) description = descMatch[1]

      let industry: string | undefined
      let headquarters: string | undefined
      let foundedYear: number | undefined
      let employeeCount: number | undefined
      let products: Product[] | undefined

      // Extract JSON-LD structured data
      const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi)
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const jsonMatch = match.match(/>([^<]*)</)
            if (!jsonMatch) continue
            const json = JSON.parse(jsonMatch[1])
            const org = Array.isArray(json) ? json.find(j => j['@type'] === 'Organization') : (json['@type'] === 'Organization' ? json : null)
            if (org) {
              if (!description && typeof org.description === 'string') description = org.description
              if (typeof org.foundingDate === 'string') {
                const y = parseInt(org.foundingDate)
                if (!Number.isNaN(y)) foundedYear = y
              }
              if (typeof org.numberOfEmployees === 'number') employeeCount = org.numberOfEmployees
              if (org.address && typeof org.address === 'object') {
                const addr = org.address
                const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean)
                if (parts.length) headquarters = parts.join(', ')
              }
            }
            const productJson = Array.isArray(json) ? json.filter(j => j['@type'] === 'Product') : (json['@type'] === 'Product' ? [json] : [])
            if (productJson.length) {
              products = productJson.map((p: any) => ({
                name: p.name,
                description: p.description,
                category: p.category,
                features: [],
                status: 'active'
              }))
            }
          } catch { }
        }
      }

      // Heuristic industry detection from keywords
      const text = html.replace(/<[^>]*>/g, ' ').toLowerCase()
      for (const [ind, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (keywords.some(k => text.includes(k))) {
          industry = ind
          break
        }
      }

      result.data = {
        description,
        industry,
        headquarters,
        foundedYear,
        employeeCount,
        products,
      }
      result.confidence = 0.7
      result.success = true
      return result
    } catch (error) {
      result.errors.push(`Website extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Discover and validate social media handles
   */
  private async discoverSocialMediaHandles(
    companyName: string,
    domain?: string
  ): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      confidence: 0,
      sources: ['social_media_apis'],
      errors: [],
      warnings: [],
    }

    try {
      // Check rate limiting
      if (!this.checkRateLimit('social_media_discovery')) {
        result.errors.push('Rate limit exceeded for social media discovery')
        return result
      }

      const socialHandles: SocialMediaHandles = {}
      let foundHandles = 0

      // Discover handles from homepage footer/header links and text
      const discoveredHandles: Record<string, string> = {}
      const { webScrapingService } = await import('@/lib/web-scraping-service')
      const base = domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : undefined
      if (base) {
        const page = await webScrapingService.scrapeCompetitorWebsite(base)
        if (page.success && page.data) {
          const html = page.data.content
          // Extract links using regex instead of cheerio
          const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi)
          if (linkMatches) {
            for (const link of linkMatches) {
              const hrefMatch = link.match(/href=["']([^"']*)["']/i)
              if (!hrefMatch) continue
              const href = hrefMatch[1].trim()
              const absolute = href.startsWith('http') ? href : (href.startsWith('/') && base ? `${base}${href}` : '')
              if (!absolute) continue
              if (!discoveredHandles.linkedin && /linkedin\.com\/(company|in)\//i.test(absolute)) discoveredHandles.linkedin = absolute
              if (!discoveredHandles.twitter && /(twitter\.com|x\.com)\//i.test(absolute)) discoveredHandles.twitter = absolute
              if (!discoveredHandles.facebook && /facebook\.com\//i.test(absolute)) discoveredHandles.facebook = absolute
              if (!discoveredHandles.instagram && /instagram\.com\//i.test(absolute)) discoveredHandles.instagram = absolute
              if (!discoveredHandles.youtube && /youtube\.com\//i.test(absolute)) discoveredHandles.youtube = absolute
            }
          }
        }
      }

      // Validate discovered handles
      for (const [platform, url] of Object.entries(discoveredHandles)) {
        if (this.validateSocialMediaUrl(platform as keyof SocialMediaHandles, url)) {
          socialHandles[platform as keyof SocialMediaHandles] = url
          foundHandles++
        } else {
          result.warnings.push(`Invalid ${platform} URL: ${url}`)
        }
      }

      if (foundHandles > 0) {
        result.data = { socialMediaHandles: socialHandles }
        result.confidence = Math.min(0.8, foundHandles * 0.2) // Higher confidence with more handles
        result.success = true
      } else {
        result.warnings.push('No valid social media handles found')
      }

      return result
    } catch (error) {
      result.errors.push(`Social media discovery error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Identify key personnel and their roles
   */
  private async identifyKeyPersonnel(
    companyName: string,
    domain: string
  ): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      confidence: 0,
      sources: ['linkedin_api', 'company_website'],
      errors: [],
      warnings: [],
    }

    try {
      // Check rate limiting
      if (!this.checkRateLimit('personnel_mapping')) {
        result.errors.push('Rate limit exceeded for personnel mapping')
        return result
      }

      // Identify personnel from About/Team pages heuristically
      const personnel = await this.identifyPersonnelFromWeb(companyName, domain)

      if (personnel.length > 0) {
        result.data = { keyPersonnel: personnel }
        result.confidence = Math.min(0.7, personnel.length * 0.15) // Confidence based on number of personnel found
        result.success = true
      } else {
        result.warnings.push('No key personnel identified')
      }

      return result
    } catch (error) {
      result.errors.push(`Personnel identification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Assess threat level based on market overlap and company characteristics
   */
  private async assessThreatLevel(
    competitor: CompetitorProfile,
    userBusinessDomain?: string
  ): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      confidence: 0,
      sources: ['market_analysis'],
      errors: [],
      warnings: [],
    }

    try {
      let threatScore = 0
      const advantages: string[] = []
      const vulnerabilities: string[] = []

      // Factor 1: Company size (employee count)
      if (competitor.employeeCount) {
        if (competitor.employeeCount > 1000) {
          threatScore += 30
          advantages.push('Large workforce and resources')
        } else if (competitor.employeeCount > 100) {
          threatScore += 20
          advantages.push('Established team size')
        } else if (competitor.employeeCount < 20) {
          threatScore += 5
          vulnerabilities.push('Limited workforce')
        }
      }

      // Factor 2: Funding stage and amount
      if (competitor.fundingStage) {
        switch (competitor.fundingStage) {
          case 'ipo':
            threatScore += 40
            advantages.push('Public company with significant resources')
            break
          case 'series-c':
            threatScore += 30
            advantages.push('Well-funded with proven market fit')
            break
          case 'series-b':
            threatScore += 20
            advantages.push('Growing company with investor backing')
            break
          case 'series-a':
            threatScore += 15
            advantages.push('Early-stage funding secured')
            break
          case 'seed':
            threatScore += 10
            vulnerabilities.push('Early-stage funding limitations')
            break
        }
      }

      // Factor 3: Market overlap (industry similarity)
      if (competitor.industry && userBusinessDomain) {
        const industryOverlap = this.calculateIndustryOverlap(competitor.industry, userBusinessDomain)
        threatScore += industryOverlap * 20
        if (industryOverlap > 0.7) {
          advantages.push('Direct market competitor')
        }
      }

      // Factor 4: Product portfolio size
      if (competitor.products && competitor.products.length > 0) {
        const activeProducts = competitor.products.filter(p => p.status === 'active').length
        threatScore += Math.min(activeProducts * 5, 25)
        if (activeProducts > 5) {
          advantages.push('Diverse product portfolio')
        } else if (activeProducts === 1) {
          vulnerabilities.push('Single product dependency')
        }
      }

      // Factor 5: Social media presence (indicates market engagement)
      if (competitor.socialMediaHandles) {
        const socialPlatforms = Object.keys(competitor.socialMediaHandles).length
        threatScore += socialPlatforms * 2
        if (socialPlatforms >= 4) {
          advantages.push('Strong social media presence')
        }
      }

      // Factor 6: Key personnel quality
      if (competitor.keyPersonnel && competitor.keyPersonnel.length > 0) {
        const executiveCount = competitor.keyPersonnel.filter(p =>
          p.role.toLowerCase().includes('ceo') ||
          p.role.toLowerCase().includes('cto') ||
          p.role.toLowerCase().includes('founder')
        ).length
        threatScore += executiveCount * 5
        if (executiveCount > 0) {
          advantages.push('Experienced leadership team')
        }
      }

      // Determine threat level based on score
      let threatLevel: ThreatLevel
      if (threatScore >= 75) {
        threatLevel = 'critical'
      } else if (threatScore >= 55) {
        threatLevel = 'high'
      } else if (threatScore >= 25) {
        threatLevel = 'medium'
      } else {
        threatLevel = 'low'
      }

      result.data = {
        threatLevel,
        competitiveAdvantages: advantages,
        vulnerabilities: vulnerabilities,
      }
      result.confidence = 0.85 // High confidence in algorithmic assessment
      result.success = true

      return result
    } catch (error) {
      result.errors.push(`Threat assessment error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Calculate industry overlap between competitor and user business
   */
  private calculateIndustryOverlap(competitorIndustry: string, userBusinessDomain: string): number {
    const competitorKeywords = competitorIndustry.toLowerCase().split(/\s+/)
    const userKeywords = userBusinessDomain.toLowerCase().split(/\s+/)

    let overlapScore = 0

    // Check for direct industry matches
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      const competitorMatches = keywords.filter(keyword =>
        competitorKeywords.some(word => word.includes(keyword))
      ).length
      const userMatches = keywords.filter(keyword =>
        userKeywords.some(word => word.includes(keyword))
      ).length

      if (competitorMatches > 0 && userMatches > 0) {
        overlapScore = Math.max(overlapScore, (competitorMatches + userMatches) / (keywords.length * 2))
      }
    }

    // Check for direct keyword overlap
    const directOverlap = competitorKeywords.filter(word =>
      userKeywords.some(userWord => userWord.includes(word) || word.includes(userWord))
    ).length

    const directOverlapScore = directOverlap / Math.max(competitorKeywords.length, userKeywords.length)

    return Math.max(overlapScore, directOverlapScore)
  }

  /**
   * Validate social media URL format
   */
  private validateSocialMediaUrl(platform: keyof SocialMediaHandles, url: string): boolean {
    const pattern = SOCIAL_MEDIA_PATTERNS[platform]
    return pattern ? pattern.test(url) : false
  }

  /**
   * Check rate limiting for API calls
   */
  private checkRateLimit(operation: string): boolean {
    if (!this.config.respectRateLimit) return true

    const now = Date.now()
    const lastCall = this.rateLimitTracker.get(operation) || 0
    const minInterval = 1000 // 1 second between calls

    if (now - lastCall < minInterval) {
      return false
    }

    this.rateLimitTracker.set(operation, now)
    return true
  }

  private async identifyPersonnelFromWeb(_companyName: string, domain: string): Promise<KeyPerson[]> {
    try {
      const { webScrapingService } = await import('@/lib/web-scraping-service')
      const base = domain.startsWith('http') ? domain : `https://${domain}`
      const candidatePaths = ['/', '/about', '/team', '/company', '/about-us']
      const results: KeyPerson[] = []

      for (const path of candidatePaths) {
        const url = path === '/' ? base : `${base}${path}`
        const res = await webScrapingService.scrapeCompetitorWebsite(url)
        if (!res.success || !res.data) continue
        const html = res.data.content

        // Extract JSON-LD Person data
        const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi)
        if (jsonLdMatches) {
          for (const match of jsonLdMatches) {
            try {
              const jsonMatch = match.match(/>([^<]*)</)
              if (!jsonMatch) continue
              const json = JSON.parse(jsonMatch[1])
              const persons = Array.isArray(json) ? json.filter(j => j['@type'] === 'Person') : (json['@type'] === 'Person' ? [json] : [])
              for (const p of persons) {
                results.push({
                  name: p.name,
                  role: p.jobTitle || 'Executive',
                  linkedinProfile: undefined,
                  previousCompanies: []
                })
              }
            } catch { }
          }
        }

        // Simplified heuristic: look for team/leadership sections
        // This is a basic implementation - would need more sophisticated parsing for production
        if (html.toLowerCase().includes('team') || html.toLowerCase().includes('leadership')) {
          // Attempt to find names in team sections using regex patterns
          // Look for common patterns like "Name - Title" or "Name, Title" in list items or headings
          const teamSectionRegex = /(?:<div[^>]*class="[^"]*team[^"]*"[^>]*>|<section[^>]*id="[^"]*team[^"]*"[^>]*>)([\s\S]*?)(?:<\/div>|<\/section>)/i
          const teamMatch = html.match(teamSectionRegex)

          if (teamMatch) {
            const teamContent = teamMatch[1]
            // Very basic name extraction - look for capitalized words followed by a title keyword
            // This is brittle but better than nothing for a heuristic
            const titleKeywords = ['CEO', 'CTO', 'Founder', 'Director', 'Head of', 'President', 'VP', 'Manager']
            const nameTitleRegex = new RegExp(`([A-Z][a-z]+ [A-Z][a-z]+)(?:<[^>]+>|\\s|&nbsp;|[-–,])+\\s*(${titleKeywords.join('|')})`, 'g')

            let match
            while ((match = nameTitleRegex.exec(teamContent)) !== null) {
              if (results.length >= 10) break
              results.push({
                name: match[1],
                role: match[2],
                linkedinProfile: undefined,
                previousCompanies: []
              })
            }
          }
        }

        if (results.length >= 10) break
      }

      // Deduplicate by name
      const seen = new Set<string>()
      return results.filter(p => {
        const key = p.name.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      }).slice(0, 10)
    } catch {
      return []
    }
  }
}

// Export singleton instance
export const competitorEnrichmentService = new CompetitorEnrichmentService()

// Export types for external use
export type { EnrichmentResult, CompanyInfo, EnrichmentConfig }