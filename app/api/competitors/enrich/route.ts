import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import type { ThreatLevel, MonitoringStatus, FundingStage } from '@/lib/competitor-intelligence-types'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for batch enrichment request
const BatchEnrichmentRequestSchema = z.object({
  competitorIds: z.array(z.number().int().positive()).min(1).max(10), // Limit to 10 competitors per batch
  userBusinessDomain: z.string().max(500).optional(),
  enableWebScraping: z.boolean().default(true),
  enableSocialMediaDiscovery: z.boolean().default(true),
  enablePersonnelMapping: z.boolean().default(true),
  enableThreatAssessment: z.boolean().default(true),
  continueOnError: z.boolean().default(true), // Whether to continue if one competitor fails
})

interface EnrichmentJobResult {
  competitorId: number
  competitorName: string
  success: boolean
  confidence?: number
  sources?: string[]
  fieldsUpdated?: string[]
  errors?: string[]
  warnings?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:batch-enrich', ip, 300_000, 2) // 2 requests per 5 minutes
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const parsed = BatchEnrichmentRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { competitorIds, userBusinessDomain, continueOnError, ...enrichmentConfig } = parsed.data

    // Get existing competitor profiles
    const existingCompetitors = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          inArray(competitorProfiles.id, competitorIds),
          eq(competitorProfiles.user_id, user.id)
        )
      )

    if (existingCompetitors.length === 0) {
      return NextResponse.json({ error: 'No competitors found' }, { status: 404 })
    }

    if (existingCompetitors.length !== competitorIds.length) {
      const foundIds = existingCompetitors.map(c => c.id)
      const missingIds = competitorIds.filter(id => !foundIds.includes(id))
      return NextResponse.json({
        error: 'Some competitors not found',
        missingIds,
      }, { status: 404 })
    }

    // Configure enrichment service
    const enrichmentService = new (await import('@/lib/competitor-enrichment-service')).CompetitorEnrichmentService(enrichmentConfig)

    // Process each competitor
    const results: EnrichmentJobResult[] = []
    let successCount = 0
    let errorCount = 0

    for (const existingCompetitor of existingCompetitors) {
      const result: EnrichmentJobResult = {
        competitorId: existingCompetitor.id,
        competitorName: existingCompetitor.name,
        success: false,
      }

      try {
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
          socialMediaHandles: (existingCompetitor.social_media_handles as Record<string, string>) || {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          keyPersonnel: (existingCompetitor.key_personnel as any[]) || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products: (existingCompetitor.products as any[]) || [],
          marketPosition: existingCompetitor.market_position && typeof existingCompetitor.market_position === 'object' && !Array.isArray(existingCompetitor.market_position) &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'targetMarkets' in existingCompetitor.market_position ? existingCompetitor.market_position as any : {
            targetMarkets: [],
            competitiveAdvantages: [],
            marketSegments: [],
            marketShare: 0,
            positioningStrength: 0,
            differentiationLevel: 0,
            marketFit: 0
          },
          competitiveAdvantages: (existingCompetitor.competitive_advantages as string[]) || [],
          vulnerabilities: (existingCompetitor.vulnerabilities as string[]) || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          monitoringConfig: existingCompetitor.monitoring_config && typeof existingCompetitor.monitoring_config === 'object' && !Array.isArray(existingCompetitor.monitoring_config) ? existingCompetitor.monitoring_config as any : {
            websiteMonitoring: false,
            socialMediaMonitoring: false,
            newsMonitoring: false,
            jobPostingMonitoring: false,
            fundingMonitoring: false,
            productMonitoring: false,
            alertFrequency: 'daily'
          },
          lastAnalyzed: existingCompetitor.last_analyzed || undefined,
          createdAt: existingCompetitor.created_at!,
          updatedAt: existingCompetitor.updated_at!,
        }

        // Perform enrichment
        const enrichmentResult = await enrichmentService.enrichCompetitorProfile(
          competitorData,
          userBusinessDomain
        )

        if (enrichmentResult.success && enrichmentResult.data) {
          // Update competitor profile with enriched data
          const updateData: Partial<typeof competitorProfiles.$inferInsert> = {}

          if (enrichmentResult.data.description) updateData.description = enrichmentResult.data.description
          if (enrichmentResult.data.industry) updateData.industry = enrichmentResult.data.industry
          if (enrichmentResult.data.headquarters) updateData.headquarters = enrichmentResult.data.headquarters
          if (enrichmentResult.data.foundedYear) updateData.founded_year = enrichmentResult.data.foundedYear
          if (enrichmentResult.data.employeeCount) updateData.employee_count = enrichmentResult.data.employeeCount
          if (enrichmentResult.data.fundingAmount) updateData.funding_amount = enrichmentResult.data.fundingAmount.toString()
          if (enrichmentResult.data.fundingStage) updateData.funding_stage = enrichmentResult.data.fundingStage
          if (enrichmentResult.data.threatLevel) updateData.threat_level = enrichmentResult.data.threatLevel

          // Merge social media handles
          if (enrichmentResult.data.socialMediaHandles) {
            const existingHandles = (existingCompetitor.social_media_handles as Record<string, string>) || {}
            updateData.social_media_handles = {
              ...existingHandles,
              ...enrichmentResult.data.socialMediaHandles,
            }
          }

          // Merge key personnel (avoid duplicates)
          if (enrichmentResult.data.keyPersonnel) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingPersonnel = (existingCompetitor.key_personnel as any[]) || []
            const newPersonnel = enrichmentResult.data.keyPersonnel.filter(newPerson =>
              !existingPersonnel.some(existing =>
                existing.name.toLowerCase() === newPerson.name.toLowerCase() &&
                existing.role.toLowerCase() === newPerson.role.toLowerCase()
              )
            )
            updateData.key_personnel = [...existingPersonnel, ...newPersonnel]
          }

          // Merge products (avoid duplicates)
          if (enrichmentResult.data.products) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingProducts = (existingCompetitor.products as any[]) || []
            const newProducts = enrichmentResult.data.products.filter(newProduct =>
              !existingProducts.some(existing =>
                existing.name.toLowerCase() === newProduct.name.toLowerCase()
              )
            )
            updateData.products = [...existingProducts, ...newProducts]
          }

          // Merge competitive advantages (avoid duplicates)
          if (enrichmentResult.data.competitiveAdvantages) {
            const existingAdvantages = (existingCompetitor.competitive_advantages as string[]) || []
            const newAdvantages = enrichmentResult.data.competitiveAdvantages.filter(advantage =>
              !existingAdvantages.includes(advantage)
            )
            updateData.competitive_advantages = [...existingAdvantages, ...newAdvantages]
          }

          // Merge vulnerabilities (avoid duplicates)
          if (enrichmentResult.data.vulnerabilities) {
            const existingVulnerabilities = (existingCompetitor.vulnerabilities as string[]) || []
            const newVulnerabilities = enrichmentResult.data.vulnerabilities.filter(vulnerability =>
              !existingVulnerabilities.includes(vulnerability)
            )
            updateData.vulnerabilities = [...existingVulnerabilities, ...newVulnerabilities]
          }

          // Set last analyzed timestamp
          updateData.last_analyzed = new Date()
          updateData.updated_at = new Date()

          // Update the competitor profile
          await db
            .update(competitorProfiles)
            .set(updateData)
            .where(
              and(
                eq(competitorProfiles.id, existingCompetitor.id),
                eq(competitorProfiles.user_id, user.id)
              )
            )

          result.success = true
          result.confidence = enrichmentResult.confidence
          result.sources = enrichmentResult.sources
          result.warnings = enrichmentResult.warnings
          result.fieldsUpdated = Object.keys(updateData).filter(key => key !== 'updated_at' && key !== 'last_analyzed')
          successCount++
        } else {
          result.errors = enrichmentResult.errors
          result.warnings = enrichmentResult.warnings
          errorCount++
        }
      } catch (error) {
        result.errors = [`Enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        errorCount++
      }

      results.push(result)

      // If continueOnError is false and we hit an error, stop processing
      if (!continueOnError && !result.success) {
        break
      }

      // Add small delay between enrichments to respect rate limits
      if (existingCompetitors.indexOf(existingCompetitor) < existingCompetitors.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      batchId: `batch_${Date.now()}`,
      summary: {
        total: competitorIds.length,
        processed: results.length,
        successful: successCount,
        failed: errorCount,
        successRate: Math.round((successCount / results.length) * 100),
      },
      results,
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    logError('Error in batch enrichment:', error)
    return NextResponse.json(
      { error: 'Failed to perform batch enrichment' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get enrichment statistics for user's competitors
    const competitors = await db
      .select({
        id: competitorProfiles.id,
        name: competitorProfiles.name,
        lastAnalyzed: competitorProfiles.last_analyzed,
        socialMediaHandles: competitorProfiles.social_media_handles,
        keyPersonnel: competitorProfiles.key_personnel,
        products: competitorProfiles.products,
        competitiveAdvantages: competitorProfiles.competitive_advantages,
        vulnerabilities: competitorProfiles.vulnerabilities,
        monitoringStatus: competitorProfiles.monitoring_status,
      })
      .from(competitorProfiles)
      .where(eq(competitorProfiles.user_id, user.id))

    const stats = {
      total: competitors.length,
      enriched: 0,
      needsEnrichment: 0,
      averageEnrichmentScore: 0,
      lastEnrichmentDate: null as Date | null,
      recommendations: [] as Array<{
        competitorId: number
        competitorName: string
        priority: 'high' | 'medium' | 'low'
        reason: string
      }>
    }

    let totalScore = 0

    for (const competitor of competitors) {
      // Calculate enrichment score
      let score = 0
      const fields = [
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
        }
      }

      totalScore += score

      if (competitor.lastAnalyzed) {
        stats.enriched++
        if (!stats.lastEnrichmentDate || competitor.lastAnalyzed > stats.lastEnrichmentDate) {
          stats.lastEnrichmentDate = competitor.lastAnalyzed
        }
      }

      if (score < 70 || !competitor.lastAnalyzed) {
        stats.needsEnrichment++

        let priority: 'high' | 'medium' | 'low' = 'low'
        let reason = 'Basic enrichment recommended'

        if (!competitor.lastAnalyzed) {
          priority = 'high'
          reason = 'Never been enriched'
        } else if (score < 30) {
          priority = 'high'
          reason = 'Very low enrichment score'
        } else if (score < 60) {
          priority = 'medium'
          reason = 'Low enrichment score'
        }

        stats.recommendations.push({
          competitorId: competitor.id,
          competitorName: competitor.name,
          priority,
          reason,
        })
      }
    }

    stats.averageEnrichmentScore = competitors.length > 0 ? Math.round(totalScore / competitors.length) : 0

    // Sort recommendations by priority
    stats.recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return NextResponse.json({
      statistics: stats,
      batchLimits: {
        maxCompetitorsPerBatch: 10,
        rateLimitPerHour: 12, // 2 requests per 5 minutes = 24 per hour, but be conservative
        estimatedTimePerCompetitor: '30-60 seconds',
      }
    })
  } catch (error) {
    logError('Error getting enrichment statistics:', error)
    return NextResponse.json(
      { error: 'Failed to get enrichment statistics' },
      { status: 500 }
    )
  }
}