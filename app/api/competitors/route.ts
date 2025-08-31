import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, or, ilike, desc, asc } from 'drizzle-orm'
import type { CompetitorProfile, CompetitorFilters, ThreatLevel, MonitoringStatus, FundingStage } from '@/lib/competitor-intelligence-types'

// Validation schemas
const CompetitorCreateSchema = z.object({
  name: z.string().min(1, 'Competitor name is required').max(255),
  domain: z.string().url('Invalid domain URL').optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  industry: z.string().max(100).optional(),
  headquarters: z.string().max(255).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().int().min(0).optional(),
  fundingAmount: z.number().min(0).optional(),
  fundingStage: z.enum(['seed', 'series-a', 'series-b', 'series-c', 'ipo', 'private']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  monitoringStatus: z.enum(['active', 'paused', 'archived']).default('active'),
  socialMediaHandles: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }).optional(),
  keyPersonnel: z.array(z.object({
    name: z.string(),
    role: z.string(),
    linkedinProfile: z.string().url().optional(),
    joinedDate: z.string().optional(),
    previousCompanies: z.array(z.string()).default([]),
  })).default([]),
  products: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    launchDate: z.string().optional(),
    status: z.enum(['active', 'discontinued', 'beta']).default('active'),
    features: z.array(z.string()).default([]),
  })).default([]),
  competitiveAdvantages: z.array(z.string()).default([]),
  vulnerabilities: z.array(z.string()).default([]),
  monitoringConfig: z.object({
    websiteMonitoring: z.boolean().default(true),
    socialMediaMonitoring: z.boolean().default(true),
    newsMonitoring: z.boolean().default(true),
    jobPostingMonitoring: z.boolean().default(true),
    appStoreMonitoring: z.boolean().default(false),
    monitoringFrequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
    alertThresholds: z.object({
      pricing: z.boolean().default(true),
      productLaunches: z.boolean().default(true),
      hiring: z.boolean().default(true),
      funding: z.boolean().default(true),
      partnerships: z.boolean().default(true),
    }).default({}),
  }).default({}),
})

const CompetitorFiltersSchema = z.object({
  threatLevel: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  monitoringStatus: z.array(z.enum(['active', 'paused', 'archived'])).optional(),
  industry: z.array(z.string()).optional(),
  fundingStage: z.array(z.enum(['seed', 'series-a', 'series-b', 'series-c', 'ipo', 'private'])).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'threatLevel', 'createdAt', 'lastAnalyzed']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Parse arrays from query string
    if (queryParams.threatLevel) {
      queryParams.threatLevel = queryParams.threatLevel.split(',')
    }
    if (queryParams.monitoringStatus) {
      queryParams.monitoringStatus = queryParams.monitoringStatus.split(',')
    }
    if (queryParams.industry) {
      queryParams.industry = queryParams.industry.split(',')
    }
    if (queryParams.fundingStage) {
      queryParams.fundingStage = queryParams.fundingStage.split(',')
    }
    
    // Convert string numbers to numbers
    if (queryParams.page) queryParams.page = parseInt(queryParams.page)
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit)

    const filters = CompetitorFiltersSchema.parse(queryParams)

    // Build query conditions
    const conditions = [eq(competitorProfiles.user_id, user.id)]

    if (filters.threatLevel && filters.threatLevel.length > 0) {
      conditions.push(or(...filters.threatLevel.map(level => eq(competitorProfiles.threat_level, level))))
    }

    if (filters.monitoringStatus && filters.monitoringStatus.length > 0) {
      conditions.push(or(...filters.monitoringStatus.map(status => eq(competitorProfiles.monitoring_status, status))))
    }

    if (filters.industry && filters.industry.length > 0) {
      conditions.push(or(...filters.industry.map(industry => eq(competitorProfiles.industry, industry))))
    }

    if (filters.fundingStage && filters.fundingStage.length > 0) {
      conditions.push(or(...filters.fundingStage.map(stage => eq(competitorProfiles.funding_stage, stage))))
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(competitorProfiles.name, `%${filters.search}%`),
          ilike(competitorProfiles.domain, `%${filters.search}%`),
          ilike(competitorProfiles.description, `%${filters.search}%`)
        )
      )
    }

    // Build sort order
    let orderBy
    switch (filters.sortBy) {
      case 'name':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorProfiles.name) : desc(competitorProfiles.name)
        break
      case 'threatLevel':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorProfiles.threat_level) : desc(competitorProfiles.threat_level)
        break
      case 'lastAnalyzed':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorProfiles.last_analyzed) : desc(competitorProfiles.last_analyzed)
        break
      default:
        orderBy = filters.sortOrder === 'asc' ? asc(competitorProfiles.created_at) : desc(competitorProfiles.created_at)
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: competitorProfiles.id })
      .from(competitorProfiles)
      .where(and(...conditions))

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit
    const competitors = await db
      .select()
      .from(competitorProfiles)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters.limit)
      .offset(offset)

    // Transform database results to match interface
    const transformedCompetitors = competitors.map(competitor => ({
      id: competitor.id,
      userId: competitor.user_id,
      name: competitor.name,
      domain: competitor.domain || undefined,
      description: competitor.description || undefined,
      industry: competitor.industry || undefined,
      headquarters: competitor.headquarters || undefined,
      foundedYear: competitor.founded_year || undefined,
      employeeCount: competitor.employee_count || undefined,
      fundingAmount: competitor.funding_amount ? parseFloat(competitor.funding_amount) : undefined,
      fundingStage: competitor.funding_stage as FundingStage || undefined,
      threatLevel: competitor.threat_level as ThreatLevel,
      monitoringStatus: competitor.monitoring_status as MonitoringStatus,
      socialMediaHandles: competitor.social_media_handles || {},
      keyPersonnel: competitor.key_personnel || [],
      products: competitor.products || [],
      marketPosition: competitor.market_position || {},
      competitiveAdvantages: competitor.competitive_advantages || [],
      vulnerabilities: competitor.vulnerabilities || [],
      monitoringConfig: competitor.monitoring_config || {},
      lastAnalyzed: competitor.last_analyzed || undefined,
      createdAt: competitor.created_at!,
      updatedAt: competitor.updated_at!,
    }))

    return NextResponse.json({
      competitors: transformedCompetitors,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching competitors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:create', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CompetitorCreateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if competitor with same name or domain already exists for this user
    const existingCompetitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.user_id, user.id),
          or(
            eq(competitorProfiles.name, data.name),
            data.domain ? eq(competitorProfiles.domain, data.domain) : undefined
          ).filter(Boolean)
        )
      )
      .limit(1)

    if (existingCompetitor.length > 0) {
      return NextResponse.json(
        { error: 'Competitor with this name or domain already exists' },
        { status: 409 }
      )
    }

    // Create competitor profile
    const [newCompetitor] = await db
      .insert(competitorProfiles)
      .values({
        user_id: user.id,
        name: data.name,
        domain: data.domain || null,
        description: data.description || null,
        industry: data.industry || null,
        headquarters: data.headquarters || null,
        founded_year: data.foundedYear || null,
        employee_count: data.employeeCount || null,
        funding_amount: data.fundingAmount?.toString() || null,
        funding_stage: data.fundingStage || null,
        threat_level: data.threatLevel,
        monitoring_status: data.monitoringStatus,
        social_media_handles: data.socialMediaHandles || {},
        key_personnel: data.keyPersonnel || [],
        products: data.products || [],
        market_position: {},
        competitive_advantages: data.competitiveAdvantages || [],
        vulnerabilities: data.vulnerabilities || [],
        monitoring_config: data.monitoringConfig || {},
      })
      .returning()

    // Trigger automatic enrichment if domain is provided and basic info is missing
    const shouldAutoEnrich = data.domain && (
      !data.description || 
      !data.industry || 
      !data.headquarters ||
      !data.employeeCount ||
      (data.keyPersonnel || []).length === 0 ||
      Object.keys(data.socialMediaHandles || {}).length === 0
    )

    if (shouldAutoEnrich) {
      // Perform background enrichment (fire and forget)
      setImmediate(async () => {
        try {
          const { competitorEnrichmentService } = await import('@/lib/competitor-enrichment-service')
          
          const competitorData = {
            id: newCompetitor.id,
            userId: newCompetitor.user_id,
            name: newCompetitor.name,
            domain: newCompetitor.domain || undefined,
            description: newCompetitor.description || undefined,
            industry: newCompetitor.industry || undefined,
            headquarters: newCompetitor.headquarters || undefined,
            foundedYear: newCompetitor.founded_year || undefined,
            employeeCount: newCompetitor.employee_count || undefined,
            fundingAmount: newCompetitor.funding_amount ? parseFloat(newCompetitor.funding_amount) : undefined,
            fundingStage: newCompetitor.funding_stage as any || undefined,
            threatLevel: newCompetitor.threat_level as any,
            monitoringStatus: newCompetitor.monitoring_status as any,
            socialMediaHandles: newCompetitor.social_media_handles || {},
            keyPersonnel: newCompetitor.key_personnel || [],
            products: newCompetitor.products || [],
            marketPosition: newCompetitor.market_position || {},
            competitiveAdvantages: newCompetitor.competitive_advantages || [],
            vulnerabilities: newCompetitor.vulnerabilities || [],
            monitoringConfig: newCompetitor.monitoring_config || {},
            lastAnalyzed: newCompetitor.last_analyzed || undefined,
            createdAt: newCompetitor.created_at!,
            updatedAt: newCompetitor.updated_at!,
          }

          const enrichmentResult = await competitorEnrichmentService.enrichCompetitorProfile(competitorData)
          
          if (enrichmentResult.success && enrichmentResult.data) {
            // Update competitor with enriched data
            const updateData: any = {}
            
            if (enrichmentResult.data.description && !newCompetitor.description) {
              updateData.description = enrichmentResult.data.description
            }
            if (enrichmentResult.data.industry && !newCompetitor.industry) {
              updateData.industry = enrichmentResult.data.industry
            }
            if (enrichmentResult.data.headquarters && !newCompetitor.headquarters) {
              updateData.headquarters = enrichmentResult.data.headquarters
            }
            if (enrichmentResult.data.foundedYear && !newCompetitor.founded_year) {
              updateData.founded_year = enrichmentResult.data.foundedYear
            }
            if (enrichmentResult.data.employeeCount && !newCompetitor.employee_count) {
              updateData.employee_count = enrichmentResult.data.employeeCount
            }
            if (enrichmentResult.data.threatLevel) {
              updateData.threat_level = enrichmentResult.data.threatLevel
            }
            
            // Merge social media handles
            if (enrichmentResult.data.socialMediaHandles) {
              const existingHandles = newCompetitor.social_media_handles || {}
              updateData.social_media_handles = {
                ...existingHandles,
                ...enrichmentResult.data.socialMediaHandles,
              }
            }
            
            // Add key personnel if none exist
            if (enrichmentResult.data.keyPersonnel && (newCompetitor.key_personnel || []).length === 0) {
              updateData.key_personnel = enrichmentResult.data.keyPersonnel
            }
            
            // Add products if none exist
            if (enrichmentResult.data.products && (newCompetitor.products || []).length === 0) {
              updateData.products = enrichmentResult.data.products
            }
            
            // Add competitive advantages
            if (enrichmentResult.data.competitiveAdvantages) {
              const existingAdvantages = newCompetitor.competitive_advantages || []
              updateData.competitive_advantages = [...existingAdvantages, ...enrichmentResult.data.competitiveAdvantages]
            }
            
            // Add vulnerabilities
            if (enrichmentResult.data.vulnerabilities) {
              const existingVulnerabilities = newCompetitor.vulnerabilities || []
              updateData.vulnerabilities = [...existingVulnerabilities, ...enrichmentResult.data.vulnerabilities]
            }

            if (Object.keys(updateData).length > 0) {
              updateData.last_analyzed = new Date()
              updateData.updated_at = new Date()
              
              await db
                .update(competitorProfiles)
                .set(updateData)
                .where(eq(competitorProfiles.id, newCompetitor.id))
            }
          }
        } catch (error) {
          console.error('Background enrichment failed:', error)
          // Don't throw error as this is background processing
        }
      })
    }

    // Transform result to match interface
    const transformedCompetitor = {
      id: newCompetitor.id,
      userId: newCompetitor.user_id,
      name: newCompetitor.name,
      domain: newCompetitor.domain || undefined,
      description: newCompetitor.description || undefined,
      industry: newCompetitor.industry || undefined,
      headquarters: newCompetitor.headquarters || undefined,
      foundedYear: newCompetitor.founded_year || undefined,
      employeeCount: newCompetitor.employee_count || undefined,
      fundingAmount: newCompetitor.funding_amount ? parseFloat(newCompetitor.funding_amount) : undefined,
      fundingStage: newCompetitor.funding_stage as FundingStage || undefined,
      threatLevel: newCompetitor.threat_level as ThreatLevel,
      monitoringStatus: newCompetitor.monitoring_status as MonitoringStatus,
      socialMediaHandles: newCompetitor.social_media_handles || {},
      keyPersonnel: newCompetitor.key_personnel || [],
      products: newCompetitor.products || [],
      marketPosition: newCompetitor.market_position || {},
      competitiveAdvantages: newCompetitor.competitive_advantages || [],
      vulnerabilities: newCompetitor.vulnerabilities || [],
      monitoringConfig: newCompetitor.monitoring_config || {},
      lastAnalyzed: newCompetitor.last_analyzed || undefined,
      createdAt: newCompetitor.created_at!,
      updatedAt: newCompetitor.updated_at!,
    }

    return NextResponse.json(
      { competitor: transformedCompetitor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating competitor:', error)
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    )
  }
}