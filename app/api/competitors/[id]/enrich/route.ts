import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { competitorEnrichmentService } from '@/lib/competitor-enrichment-service'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { ThreatLevel, MonitoringStatus, FundingStage } from '@/lib/competitor-intelligence-types'

// Validation schema for enrichment request
const EnrichmentRequestSchema = z.object({
  userBusinessDomain: z.string().max(500).optional(),
  enableWebScraping: z.boolean().default(true),
  enableSocialMediaDiscovery: z.boolean().default(true),
  enablePersonnelMapping: z.boolean().default(true),
  enableThreatAssessment: z.boolean().default(true),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:enrich', ip, 60_000, 5) // 5 requests per minute
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const parsed = EnrichmentRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { userBusinessDomain, ...enrichmentConfig } = parsed.data

    // Get existing competitor profile
    const [existingCompetitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (!existingCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Transform database result to match interface
    const competitorData = {
      id: existingCompetitor.id,
      userId: existingCompetitor.user_id,
      name: existingCompetitor.name,
      domain: existingCompetitor.domain || undefined,
      description: existingCompetitor.description || undefined,
      industry: existingCompetitor.industry || undefined,
      headquarters: existingCompetitor.headquarters || undefined,
      foundedYear: existingCompetitor.founded_year || undefined,
      employeeCount: existingCompetitor.employee_count || undefined,
      fundingAmount: existingCompetitor.funding_amount ? parseFloat(existingCompetitor.funding_amount) : undefined,
      fundingStage: existingCompetitor.funding_stage as FundingStage || undefined,
      threatLevel: existingCompetitor.threat_level as ThreatLevel,
      monitoringStatus: existingCompetitor.monitoring_status as MonitoringStatus,
      socialMediaHandles: existingCompetitor.social_media_handles || {},
      keyPersonnel: existingCompetitor.key_personnel || [],
      products: existingCompetitor.products || [],
      marketPosition: existingCompetitor.market_position || {},
      competitiveAdvantages: existingCompetitor.competitive_advantages || [],
      vulnerabilities: existingCompetitor.vulnerabilities || [],
      monitoringConfig: existingCompetitor.monitoring_config || {},
      lastAnalyzed: existingCompetitor.last_analyzed || undefined,
      createdAt: existingCompetitor.created_at!,
      updatedAt: existingCompetitor.updated_at!,
    }

    // Configure enrichment service
    const enrichmentService = new (await import('@/lib/competitor-enrichment-service')).CompetitorEnrichmentService(enrichmentConfig)

    // Perform enrichment
    const enrichmentResult = await enrichmentService.enrichCompetitorProfile(
      competitorData,
      userBusinessDomain
    )

    if (!enrichmentResult.success) {
      return NextResponse.json({
        error: 'Enrichment failed',
        details: enrichmentResult.errors,
        warnings: enrichmentResult.warnings,
      }, { status: 422 })
    }

    // Update competitor profile with enriched data
    const updateData: any = {}
    
    if (enrichmentResult.data?.description) updateData.description = enrichmentResult.data.description
    if (enrichmentResult.data?.industry) updateData.industry = enrichmentResult.data.industry
    if (enrichmentResult.data?.headquarters) updateData.headquarters = enrichmentResult.data.headquarters
    if (enrichmentResult.data?.foundedYear) updateData.founded_year = enrichmentResult.data.foundedYear
    if (enrichmentResult.data?.employeeCount) updateData.employee_count = enrichmentResult.data.employeeCount
    if (enrichmentResult.data?.fundingAmount) updateData.funding_amount = enrichmentResult.data.fundingAmount.toString()
    if (enrichmentResult.data?.fundingStage) updateData.funding_stage = enrichmentResult.data.fundingStage
    if (enrichmentResult.data?.threatLevel) updateData.threat_level = enrichmentResult.data.threatLevel
    
    // Merge social media handles
    if (enrichmentResult.data?.socialMediaHandles) {
      const existingHandles = existingCompetitor.social_media_handles || {}
      updateData.social_media_handles = {
        ...existingHandles,
        ...enrichmentResult.data.socialMediaHandles,
      }
    }
    
    // Merge key personnel (avoid duplicates)
    if (enrichmentResult.data?.keyPersonnel) {
      const existingPersonnel = existingCompetitor.key_personnel || []
      const newPersonnel = enrichmentResult.data.keyPersonnel.filter(newPerson => 
        !existingPersonnel.some(existing => 
          existing.name.toLowerCase() === newPerson.name.toLowerCase() &&
          existing.role.toLowerCase() === newPerson.role.toLowerCase()
        )
      )
      updateData.key_personnel = [...existingPersonnel, ...newPersonnel]
    }
    
    // Merge products (avoid duplicates)
    if (enrichmentResult.data?.products) {
      const existingProducts = existingCompetitor.products || []
      const newProducts = enrichmentResult.data.products.filter(newProduct => 
        !existingProducts.some(existing => 
          existing.name.toLowerCase() === newProduct.name.toLowerCase()
        )
      )
      updateData.products = [...existingProducts, ...newProducts]
    }
    
    // Merge competitive advantages (avoid duplicates)
    if (enrichmentResult.data?.competitiveAdvantages) {
      const existingAdvantages = existingCompetitor.competitive_advantages || []
      const newAdvantages = enrichmentResult.data.competitiveAdvantages.filter(advantage => 
        !existingAdvantages.includes(advantage)
      )
      updateData.competitive_advantages = [...existingAdvantages, ...newAdvantages]
    }
    
    // Merge vulnerabilities (avoid duplicates)
    if (enrichmentResult.data?.vulnerabilities) {
      const existingVulnerabilities = existingCompetitor.vulnerabilities || []
      const newVulnerabilities = enrichmentResult.data.vulnerabilities.filter(vulnerability => 
        !existingVulnerabilities.includes(vulnerability)
      )
      updateData.vulnerabilities = [...existingVulnerabilities, ...newVulnerabilities]
    }

    // Set last analyzed timestamp
    updateData.last_analyzed = new Date()
    updateData.updated_at = new Date()

    // Update the competitor profile
    const [updatedCompetitor] = await db
      .update(competitorProfiles)
      .set(updateData)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .returning()

    // Transform updated result to match interface
    const transformedCompetitor = {
      id: updatedCompetitor.id,
      userId: updatedCompetitor.user_id,
      name: updatedCompetitor.name,
      domain: updatedCompetitor.domain || undefined,
      description: updatedCompetitor.description || undefined,
      industry: updatedCompetitor.industry || undefined,
      headquarters: updatedCompetitor.headquarters || undefined,
      foundedYear: updatedCompetitor.founded_year || undefined,
      employeeCount: updatedCompetitor.employee_count || undefined,
      fundingAmount: updatedCompetitor.funding_amount ? parseFloat(updatedCompetitor.funding_amount) : undefined,
      fundingStage: updatedCompetitor.funding_stage as FundingStage || undefined,
      threatLevel: updatedCompetitor.threat_level as ThreatLevel,
      monitoringStatus: updatedCompetitor.monitoring_status as MonitoringStatus,
      socialMediaHandles: updatedCompetitor.social_media_handles || {},
      keyPersonnel: updatedCompetitor.key_personnel || [],
      products: updatedCompetitor.products || [],
      marketPosition: updatedCompetitor.market_position || {},
      competitiveAdvantages: updatedCompetitor.competitive_advantages || [],
      vulnerabilities: updatedCompetitor.vulnerabilities || [],
      monitoringConfig: updatedCompetitor.monitoring_config || {},
      lastAnalyzed: updatedCompetitor.last_analyzed || undefined,
      createdAt: updatedCompetitor.created_at!,
      updatedAt: updatedCompetitor.updated_at!,
    }

    return NextResponse.json({
      competitor: transformedCompetitor,
      enrichment: {
        success: enrichmentResult.success,
        confidence: enrichmentResult.confidence,
        sources: enrichmentResult.sources,
        warnings: enrichmentResult.warnings,
        fieldsUpdated: Object.keys(updateData).filter(key => key !== 'updated_at' && key !== 'last_analyzed'),
      }
    })
  } catch (error) {
    console.error('Error enriching competitor:', error)
    return NextResponse.json(
      { error: 'Failed to enrich competitor profile' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    // Get competitor profile to check enrichment status
    const [competitor] = await db
      .select({
        id: competitorProfiles.id,
        name: competitorProfiles.name,
        domain: competitorProfiles.domain,
        lastAnalyzed: competitorProfiles.last_analyzed,
        socialMediaHandles: competitorProfiles.social_media_handles,
        keyPersonnel: competitorProfiles.key_personnel,
        products: competitorProfiles.products,
        competitiveAdvantages: competitorProfiles.competitive_advantages,
        vulnerabilities: competitorProfiles.vulnerabilities,
      })
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Calculate enrichment status
    const enrichmentStatus = {
      hasBeenEnriched: !!competitor.lastAnalyzed,
      lastEnrichmentDate: competitor.lastAnalyzed,
      enrichmentScore: 0,
      missingFields: [] as string[],
      availableFields: [] as string[],
    }

    // Calculate enrichment score based on available data
    let score = 0
    const fields = [
      { key: 'domain', value: competitor.domain, weight: 10 },
      { key: 'socialMediaHandles', value: competitor.socialMediaHandles, weight: 15 },
      { key: 'keyPersonnel', value: competitor.keyPersonnel, weight: 20 },
      { key: 'products', value: competitor.products, weight: 20 },
      { key: 'competitiveAdvantages', value: competitor.competitiveAdvantages, weight: 15 },
      { key: 'vulnerabilities', value: competitor.vulnerabilities, weight: 20 },
    ]

    for (const field of fields) {
      if (field.value && 
          (Array.isArray(field.value) ? field.value.length > 0 : 
           typeof field.value === 'object' ? Object.keys(field.value).length > 0 : 
           field.value)) {
        score += field.weight
        enrichmentStatus.availableFields.push(field.key)
      } else {
        enrichmentStatus.missingFields.push(field.key)
      }
    }

    enrichmentStatus.enrichmentScore = score

    return NextResponse.json({
      competitorId: competitor.id,
      competitorName: competitor.name,
      enrichmentStatus,
      recommendations: {
        shouldEnrich: score < 70 || !competitor.lastAnalyzed,
        priority: score < 30 ? 'high' : score < 60 ? 'medium' : 'low',
        estimatedDuration: '2-5 minutes',
        benefits: [
          'Automated threat level assessment',
          'Social media handle discovery',
          'Key personnel identification',
          'Competitive advantage analysis',
        ]
      }
    })
  } catch (error) {
    console.error('Error checking enrichment status:', error)
    return NextResponse.json(
      { error: 'Failed to check enrichment status' },
      { status: 500 }
    )
  }
}