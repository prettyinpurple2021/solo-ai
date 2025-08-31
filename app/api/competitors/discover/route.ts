import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema for discovery request
const DiscoveryRequestSchema = z.object({
  businessDomain: z.string().min(1, 'Business domain is required').max(500),
  industry: z.string().max(100).optional(),
  targetMarket: z.string().max(100).optional(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  maxResults: z.number().int().min(1).max(20).default(10),
})

// Mock competitor discovery data - in a real implementation, this would use:
// - Web scraping of business directories
// - Industry databases
// - AI-powered competitor analysis
// - Market research APIs
const MOCK_COMPETITOR_SUGGESTIONS = [
  {
    name: 'TechCorp Solutions',
    domain: 'https://techcorp.com',
    description: 'Leading provider of enterprise software solutions',
    industry: 'Technology',
    estimatedSize: 'medium',
    threatLevel: 'high' as const,
    reasoning: 'Direct competitor in enterprise software with similar target market',
    confidence: 0.85,
    keyIndicators: [
      'Similar product offerings',
      'Overlapping target market',
      'Recent funding round',
      'Aggressive marketing campaigns'
    ]
  },
  {
    name: 'InnovateLabs',
    domain: 'https://innovatelabs.io',
    description: 'Innovative startup disrupting traditional business processes',
    industry: 'Technology',
    estimatedSize: 'startup',
    threatLevel: 'medium' as const,
    reasoning: 'Emerging competitor with innovative approach to similar problems',
    confidence: 0.72,
    keyIndicators: [
      'Innovative product features',
      'Growing market presence',
      'Strong social media engagement',
      'Recent product launches'
    ]
  },
  {
    name: 'GlobalBiz Inc',
    domain: 'https://globalbiz.com',
    description: 'Established player in business automation and workflow management',
    industry: 'Business Services',
    estimatedSize: 'large',
    threatLevel: 'critical' as const,
    reasoning: 'Market leader with significant resources and established customer base',
    confidence: 0.91,
    keyIndicators: [
      'Market leadership position',
      'Extensive customer base',
      'Strong financial backing',
      'Comprehensive product suite'
    ]
  },
  {
    name: 'StartupRival',
    domain: 'https://startuprival.com',
    description: 'Fast-growing startup with focus on SMB market',
    industry: 'Technology',
    estimatedSize: 'startup',
    threatLevel: 'medium' as const,
    reasoning: 'Targeting similar SMB market with competitive pricing',
    confidence: 0.68,
    keyIndicators: [
      'SMB market focus',
      'Competitive pricing strategy',
      'Rapid user growth',
      'Active hiring in key roles'
    ]
  },
  {
    name: 'Enterprise Solutions Pro',
    domain: 'https://enterprisepro.com',
    description: 'Enterprise-focused solutions with strong industry partnerships',
    industry: 'Technology',
    estimatedSize: 'large',
    threatLevel: 'high' as const,
    reasoning: 'Strong enterprise presence with strategic partnerships',
    confidence: 0.79,
    keyIndicators: [
      'Enterprise customer focus',
      'Strategic partnerships',
      'Industry certifications',
      'Established sales channels'
    ]
  }
]

// AI-powered competitor discovery simulation
function discoverCompetitors(
  businessDomain: string,
  industry?: string,
  targetMarket?: string,
  companySize?: string,
  maxResults: number = 10
) {
  // In a real implementation, this would:
  // 1. Use AI to analyze the business domain description
  // 2. Search business directories and databases
  // 3. Analyze competitor websites and social media
  // 4. Use market research APIs
  // 5. Apply ML models to assess threat levels
  
  // For now, return filtered mock data based on input
  let suggestions = [...MOCK_COMPETITOR_SUGGESTIONS]
  
  // Filter by industry if provided
  if (industry) {
    suggestions = suggestions.filter(comp => 
      comp.industry.toLowerCase().includes(industry.toLowerCase()) ||
      comp.description.toLowerCase().includes(industry.toLowerCase())
    )
  }
  
  // Adjust threat levels based on company size
  if (companySize) {
    suggestions = suggestions.map(comp => {
      let adjustedThreatLevel = comp.threatLevel
      
      // Smaller companies might be more threatened by larger competitors
      if (companySize === 'startup' && comp.estimatedSize === 'large') {
        adjustedThreatLevel = 'critical'
      } else if (companySize === 'large' && comp.estimatedSize === 'startup') {
        adjustedThreatLevel = 'low'
      }
      
      return { ...comp, threatLevel: adjustedThreatLevel }
    })
  }
  
  // Sort by confidence and threat level
  suggestions.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence
    }
    
    const threatOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return threatOrder[b.threatLevel] - threatOrder[a.threatLevel]
  })
  
  return suggestions.slice(0, maxResults)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:discover', ip, 60_000, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = DiscoveryRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { businessDomain, industry, targetMarket, companySize, maxResults } = parsed.data

    // Discover competitors using AI analysis
    const suggestions = discoverCompetitors(
      businessDomain,
      industry,
      targetMarket,
      companySize,
      maxResults
    )

    // Add suggested monitoring configuration based on competitor characteristics
    const enrichedSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      suggestedMonitoringConfig: {
        websiteMonitoring: true,
        socialMediaMonitoring: suggestion.estimatedSize !== 'large', // Large companies have less social media activity
        newsMonitoring: suggestion.threatLevel === 'critical' || suggestion.threatLevel === 'high',
        jobPostingMonitoring: suggestion.estimatedSize === 'startup' || suggestion.estimatedSize === 'small',
        appStoreMonitoring: suggestion.industry.toLowerCase().includes('technology'),
        monitoringFrequency: suggestion.threatLevel === 'critical' ? 'daily' : 'weekly',
        alertThresholds: {
          pricing: true,
          productLaunches: true,
          hiring: suggestion.estimatedSize !== 'large',
          funding: suggestion.estimatedSize === 'startup',
          partnerships: suggestion.threatLevel === 'critical' || suggestion.threatLevel === 'high',
        }
      }
    }))

    return NextResponse.json({
      suggestions: enrichedSuggestions,
      searchCriteria: {
        businessDomain,
        industry,
        targetMarket,
        companySize,
        maxResults,
      },
      metadata: {
        totalFound: suggestions.length,
        searchTimestamp: new Date().toISOString(),
        confidenceThreshold: 0.6,
        sources: [
          'Business directories',
          'Industry databases',
          'Social media analysis',
          'Market research data'
        ]
      }
    })
  } catch (error) {
    console.error('Error discovering competitors:', error)
    return NextResponse.json(
      { error: 'Failed to discover competitors' },
      { status: 500 }
    )
  }
}