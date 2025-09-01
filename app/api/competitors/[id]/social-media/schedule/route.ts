import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { socialMediaScheduler } from '@/lib/social-media-scheduler';
import { db } from '@/db';
import { competitorProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().transform(Number)
});

const scheduleSchema = z.object({
  platforms: z.array(z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'])).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  enabled: z.boolean().default(true)
});

/**
 * GET /api/competitors/[id]/social-media/schedule
 * Get social media monitoring schedule status for a competitor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate params
    const { id: competitorId } = paramsSchema.parse(params);

    // Verify competitor exists and belongs to user
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Get monitoring status
    const status = await socialMediaScheduler.getMonitoringStatus(
      competitorId,
      authResult.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        competitor: {
          id: competitor.id,
          name: competitor.name,
          monitoring_status: competitor.monitoring_status,
          social_media_handles: competitor.social_media_handles
        },
        monitoring: status
      }
    });

  } catch (error) {
    console.error('Error getting social media schedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitors/[id]/social-media/schedule
 * Create or update social media monitoring schedule for a competitor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate params
    const { id: competitorId } = paramsSchema.parse(params);

    // Parse and validate request body
    const body = await request.json();
    const config = scheduleSchema.parse(body);

    // Verify competitor exists and belongs to user
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Check if competitor has social media handles
    const socialHandles = competitor.social_media_handles as any;
    if (!socialHandles || Object.keys(socialHandles).length === 0) {
      return NextResponse.json(
        { error: 'No social media handles configured for this competitor' },
        { status: 400 }
      );
    }

    // If no platforms specified, use all available platforms from handles
    const availablePlatforms = Object.keys(socialHandles).filter(platform => 
      ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'].includes(platform)
    );

    const platformsToMonitor = config.platforms || availablePlatforms;

    // Validate that requested platforms have handles
    const missingHandles = platformsToMonitor.filter(platform => !socialHandles[platform]);
    if (missingHandles.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing social media handles', 
          missing_platforms: missingHandles,
          available_platforms: availablePlatforms
        },
        { status: 400 }
      );
    }

    // Schedule monitoring
    const jobIds = await socialMediaScheduler.scheduleMonitoring(
      competitorId,
      authResult.user.id,
      { ...config, platforms: platformsToMonitor }
    );

    // Update competitor monitoring status
    await db
      .update(competitorProfiles)
      .set({ 
        monitoring_status: config.enabled ? 'active' : 'paused',
        updated_at: new Date()
      })
      .where(eq(competitorProfiles.id, competitorId));

    return NextResponse.json({
      success: true,
      data: {
        competitor_id: competitorId,
        scheduled_jobs: jobIds,
        platforms: platformsToMonitor,
        config: {
          frequency: config.frequency,
          priority: config.priority,
          enabled: config.enabled
        },
        message: `Social media monitoring scheduled for ${platformsToMonitor.length} platforms`
      }
    });

  } catch (error) {
    console.error('Error scheduling social media monitoring:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/competitors/[id]/social-media/schedule
 * Update existing social media monitoring configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate params
    const { id: competitorId } = paramsSchema.parse(params);

    // Parse and validate request body
    const body = await request.json();
    const updateSchema = z.object({
      platforms: z.array(z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'])).optional(),
      frequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      enabled: z.boolean().optional()
    });

    const updates = updateSchema.parse(body);

    // Verify competitor exists and belongs to user
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Update monitoring configuration
    await socialMediaScheduler.updateMonitoringConfig(
      competitorId,
      authResult.user.id,
      updates
    );

    // Update competitor status if enabled/disabled
    if (updates.enabled !== undefined) {
      await db
        .update(competitorProfiles)
        .set({ 
          monitoring_status: updates.enabled ? 'active' : 'paused',
          updated_at: new Date()
        })
        .where(eq(competitorProfiles.id, competitorId));
    }

    // Get updated status
    const updatedStatus = await socialMediaScheduler.getMonitoringStatus(
      competitorId,
      authResult.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        competitor_id: competitorId,
        updated_config: updates,
        monitoring: updatedStatus,
        message: 'Social media monitoring configuration updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating social media monitoring:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/competitors/[id]/social-media/schedule
 * Pause social media monitoring for a competitor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate params
    const { id: competitorId } = paramsSchema.parse(params);

    // Verify competitor exists and belongs to user
    const [competitor] = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Pause monitoring
    await socialMediaScheduler.pauseMonitoring(competitorId, authResult.user.id);

    // Update competitor status
    await db
      .update(competitorProfiles)
      .set({ 
        monitoring_status: 'paused',
        updated_at: new Date()
      })
      .where(eq(competitorProfiles.id, competitorId));

    return NextResponse.json({
      success: true,
      data: {
        competitor_id: competitorId,
        message: 'Social media monitoring paused successfully'
      }
    });

  } catch (error) {
    console.error('Error pausing social media monitoring:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}