import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { socialMediaMonitor } from '@/lib/social-media-monitor';
import { db } from '@/db';
import { competitorProfiles, intelligenceData } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().transform(Number)
});

const querySchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']).optional(),
  limit: z.string().transform(Number).default(50),
  offset: z.string().transform(Number).default(0)
});

/**
 * GET /api/competitors/[id]/social-media
 * Retrieve social media intelligence data for a competitor
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
    
    // Validate query parameters
    const url = new URL(request.url);
    const { platform, limit, offset } = querySchema.parse({
      platform: url.searchParams.get('platform'),
      limit: url.searchParams.get('limit') || '50',
      offset: url.searchParams.get('offset') || '0'
    });

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

    // Build query conditions
    let whereConditions = and(
      eq(intelligenceData.competitor_id, competitorId),
      eq(intelligenceData.user_id, authResult.user.id),
      eq(intelligenceData.source_type, 'social_media')
    );

    if (platform) {
      whereConditions = and(
        whereConditions,
        eq(intelligenceData.data_type, `${platform}_analysis`)
      );
    }

    // Fetch social media intelligence data
    const socialMediaData = await db
      .select()
      .from(intelligenceData)
      .where(whereConditions)
      .orderBy(desc(intelligenceData.collected_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: intelligenceData.id })
      .from(intelligenceData)
      .where(whereConditions);

    return NextResponse.json({
      success: true,
      data: {
        competitor: {
          id: competitor.id,
          name: competitor.name,
          social_media_handles: competitor.social_media_handles
        },
        intelligence: socialMediaData.map(item => ({
          id: item.id,
          platform: item.data_type?.replace('_analysis', ''),
          collected_at: item.collected_at,
          processed_at: item.processed_at,
          importance: item.importance,
          confidence: item.confidence,
          extracted_data: item.extracted_data,
          tags: item.tags
        })),
        pagination: {
          limit,
          offset,
          total: totalCount.length,
          hasMore: offset + limit < totalCount.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching social media data:', error);
    
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
 * POST /api/competitors/[id]/social-media
 * Trigger social media monitoring for a competitor
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

    // Parse request body
    const body = await request.json();
    const requestSchema = z.object({
      platforms: z.array(z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'])).optional(),
      force_refresh: z.boolean().default(false)
    });

    const { platforms, force_refresh } = requestSchema.parse(body);

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

    // Check if monitoring is active
    if (competitor.monitoring_status !== 'active') {
      return NextResponse.json(
        { error: 'Competitor monitoring is not active' },
        { status: 400 }
      );
    }

    // Start social media monitoring
    let results;
    
    if (platforms && platforms.length > 0) {
      // Monitor specific platforms
      results = [];
      for (const platform of platforms) {
        try {
          let platformData;
          switch (platform) {
            case 'linkedin':
              platformData = await socialMediaMonitor.monitorLinkedInActivity(competitorId);
              break;
            case 'twitter':
              platformData = await socialMediaMonitor.monitorTwitterActivity(competitorId);
              break;
            case 'facebook':
              platformData = await socialMediaMonitor.monitorFacebookActivity(competitorId);
              break;
            case 'instagram':
              platformData = await socialMediaMonitor.monitorInstagramActivity(competitorId);
              break;
          }
          
          if (platformData) {
            results.push({
              platform,
              posts_collected: platformData.length,
              status: 'success'
            });
          }
        } catch (error) {
          console.error(`Error monitoring ${platform}:`, error);
          results.push({
            platform,
            posts_collected: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } else {
      // Monitor all platforms
      try {
        const analyses = await socialMediaMonitor.monitorCompetitor(competitorId);
        results = analyses.map(analysis => ({
          platform: analysis.platform,
          posts_collected: analysis.posts.length,
          status: 'success',
          engagement_patterns: analysis.engagementPatterns.length,
          content_themes: analysis.contentThemes.length,
          sentiment: analysis.sentiment.overall
        }));
      } catch (error) {
        console.error('Error monitoring competitor:', error);
        return NextResponse.json(
          { error: 'Failed to monitor competitor social media' },
          { status: 500 }
        );
      }
    }

    // Update competitor's last analyzed timestamp
    await db
      .update(competitorProfiles)
      .set({ 
        last_analyzed: new Date(),
        updated_at: new Date()
      })
      .where(eq(competitorProfiles.id, competitorId));

    return NextResponse.json({
      success: true,
      data: {
        competitor_id: competitorId,
        monitoring_started_at: new Date().toISOString(),
        platforms_monitored: results,
        total_platforms: results.length,
        successful_platforms: results.filter(r => r.status === 'success').length
      }
    });

  } catch (error) {
    console.error('Error starting social media monitoring:', error);
    
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