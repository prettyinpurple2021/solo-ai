import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { ThreatLevel, MonitoringStatus, FundingStage } from '@/lib/competitor-intelligence-types'

// Validation schema for updates
const CompetitorUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  industry: z.string().max(100).optional(),
  headquarters: z.string().max(255).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().int().min(0).optional(),
  fundingAmount: z.number().min(0).optional(),
  fundingStage: z.enum(['seed', 'series-a', 'series-b', 'series-c', 'ipo', 'private']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  monitoringStatus: z.enum(['active', 'paused', 'archived']).optional(),
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
  })).optional(),
  products: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    launchDate: z.string().optional(),
    status: z.enum(['active', 'discontinued', 'beta']).default('active'),
    features: z.array(z.string()).default([]),
  })).optional(),
  competitiveAdvantages: z.array(z.string()).optional(),
  vulnerabilities: z.array(z.string()).optional(),
  monitoringConfig: z.object({
    websiteMonitoring: z.boolean().optional(),
    socialMediaMonitoring: z.boolean().optional(),
    newsMonitoring: z.boolean().optional(),
    jobPostingMonitoring: z.boolean().optional(),
    appStoreMonitoring: z.boolean().optional(),
    monitoringFrequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
    alertThresholds: z.object({
      pricing: z.boolean().optional(),
      productLaunches: z.boolean().optional(),
      hiring: z.boolean().optional(),
      funding: z.boolean().optional(),
      partnerships: z.boolean().optional(),
    }).optional(),
  }).optional(),
})

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

    // Get competitor profile
    const [competitor] = await db
      .select()
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

    // Transform database result to match interface
    const transformedCompetitor = {
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
    }

    return NextResponse.json({ competitor: transformedCompetitor })
  } catch (error) {
    console.error('Error fetching competitor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:update', ip, 60_000, 20)
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

    const body = await request.json()
    const parsed = CompetitorUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if competitor exists and belongs to user
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

    // Check for name/domain conflicts if they're being updated
    if (data.name || data.domain) {
      const conflictConditions = []
      
      if (data.name && data.name !== existingCompetitor.name) {
        conflictConditions.push(eq(competitorProfiles.name, data.name))
      }
      
      if (data.domain && data.domain !== existingCompetitor.domain) {
        conflictConditions.push(eq(competitorProfiles.domain, data.domain))
      }

      if (conflictConditions.length > 0) {
        const conflictingCompetitor = await db
          .select()
          .from(competitorProfiles)
          .where(
            and(
              eq(competitorProfiles.user_id, user.id),
              ...conflictConditions
            )
          )
          .limit(1)

        if (conflictingCompetitor.length > 0) {
          return NextResponse.json(
            { error: 'Competitor with this name or domain already exists' },
            { status: 409 }
          )
        }
      }
    }

    // Build update object
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.domain !== undefined) updateData.domain = data.domain || null
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.industry !== undefined) updateData.industry = data.industry || null
    if (data.headquarters !== undefined) updateData.headquarters = data.headquarters || null
    if (data.foundedYear !== undefined) updateData.founded_year = data.foundedYear || null
    if (data.employeeCount !== undefined) updateData.employee_count = data.employeeCount || null
    if (data.fundingAmount !== undefined) updateData.funding_amount = data.fundingAmount?.toString() || null
    if (data.fundingStage !== undefined) updateData.funding_stage = data.fundingStage || null
    if (data.threatLevel !== undefined) updateData.threat_level = data.threatLevel
    if (data.monitoringStatus !== undefined) updateData.monitoring_status = data.monitoringStatus
    if (data.socialMediaHandles !== undefined) updateData.social_media_handles = data.socialMediaHandles
    if (data.keyPersonnel !== undefined) updateData.key_personnel = data.keyPersonnel
    if (data.products !== undefined) updateData.products = data.products
    if (data.competitiveAdvantages !== undefined) updateData.competitive_advantages = data.competitiveAdvantages
    if (data.vulnerabilities !== undefined) updateData.vulnerabilities = data.vulnerabilities
    if (data.monitoringConfig !== undefined) {
      // Merge with existing monitoring config
      const existingConfig = existingCompetitor.monitoring_config || {}
      updateData.monitoring_config = { ...existingConfig, ...data.monitoringConfig }
    }

    // Update competitor
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

    // Transform result to match interface
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

    return NextResponse.json({ competitor: transformedCompetitor })
  } catch (error) {
    console.error('Error updating competitor:', error)
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:delete', ip, 60_000, 10)
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

    // Soft delete by setting monitoring_status to 'archived'
    const [deletedCompetitor] = await db
      .update(competitorProfiles)
      .set({ 
        monitoring_status: 'archived',
        updated_at: new Date()
      })
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .returning()

    if (!deletedCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Competitor archived successfully',
      competitorId: deletedCompetitor.id
    })
  } catch (error) {
    console.error('Error deleting competitor:', error)
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    )
  }
}