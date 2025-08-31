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
      // Check rate limiting
      if (!this.checkRateLimit('website_scraping')) {
        result.errors.push('Rate limit exceeded for website scraping')
        return result
      }

      // Simulate website scraping (in production, use actual web scraping)
      // This would use libraries like Puppeteer, Playwright, or Cheerio
      const websiteData = await this.simulateWebsiteScraping(domain)
      
      if (websiteData) {
        result.data = {
          description: websiteData.description,
          industry: websiteData.industry,
          headquarters: websiteData.headquarters,
          foundedYear: websiteData.foundedYear,
          employeeCount: websiteData.employeeCount,
          products: websiteData.products,
        }
        result.confidence = 0.75 // Moderate confidence for simulated data
        result.success = true
      } else {
        result.errors.push('No data extracted from website')
      }

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

      // Simulate social media handle discovery
      // In production, this would use social media APIs or web scraping
      const discoveredHandles = await this.simulateSocialMediaDiscovery(companyName, domain)
      
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
        result.data = { socialMediaHandles }
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

      // Simulate personnel identification
      // In production, this would use LinkedIn API, company websites, or business directories
      const personnel = await this.simulatePersonnelIdentification(companyName, domain)
      
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
      if (threatScore >= 80) {
        threatLevel = 'critical'
      } else if (threatScore >= 60) {
        threatLevel = 'high'
      } else if (threatScore >= 30) {
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

  // Simulation methods (replace with actual implementations in production)
  
  private async simulateWebsiteScraping(domain: string): Promise<CompanyInfo | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock data based on domain
    const mockData: Record<string, CompanyInfo> = {
      'techcorp.com': {
        name: 'TechCorp Solutions',
        description: 'Leading provider of enterprise software solutions for modern businesses',
        industry: 'Technology',
        headquarters: 'San Francisco, CA',
        foundedYear: 2015,
        employeeCount: 250,
        products: [
          {
            name: 'TechCorp Platform',
            description: 'Enterprise automation platform',
            category: 'Software',
            status: 'active',
            features: ['Automation', 'Analytics', 'Integration']
          }
        ]
      }
    }
    
    const domainKey = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return mockData[domainKey] || null
  }

  private async simulateSocialMediaDiscovery(
    companyName: string, 
    domain?: string
  ): Promise<Record<string, string>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const handles: Record<string, string> = {}
    const cleanName = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    
    // Simulate discovered handles
    if (Math.random() > 0.3) {
      handles.linkedin = `https://linkedin.com/company/${cleanName}`
    }
    if (Math.random() > 0.4) {
      handles.twitter = `https://twitter.com/${cleanName}`
    }
    if (Math.random() > 0.6) {
      handles.facebook = `https://facebook.com/${cleanName}`
    }
    
    return handles
  }

  private async simulatePersonnelIdentification(
    companyName: string,
    domain: string
  ): Promise<KeyPerson[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const mockPersonnel: KeyPerson[] = [
      {
        name: 'John Smith',
        role: 'CEO & Founder',
        linkedinProfile: 'https://linkedin.com/in/johnsmith',
        previousCompanies: ['Previous Corp', 'Startup Inc']
      },
      {
        name: 'Sarah Johnson',
        role: 'CTO',
        linkedinProfile: 'https://linkedin.com/in/sarahjohnson',
        previousCompanies: ['Tech Giant', 'Innovation Labs']
      }
    ]
    
    // Return random subset
    return mockPersonnel.slice(0, Math.floor(Math.random() * mockPersonnel.length) + 1)
  }
}

// Export singleton instance
export const competitorEnrichmentService = new CompetitorEnrichmentService()

// Export types for external use
export type { EnrichmentResult, CompanyInfo, EnrichmentConfig }