import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { socialMediaJobProcessor } from '@/lib/social-media-job-processor';
import { socialMediaScheduler } from '@/lib/social-media-scheduler';
import { z } from 'zod';

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/competitors/social-media/processor
 * Get social media job processor status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const { user, error } = await authenticateRequest();
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get processor status
    const processorStatus = socialMediaJobProcessor.getStatus();

    // Get monitoring statistics for the user
    const monitoringStats = await socialMediaScheduler.getMonitoringStats(user.id);

    return NextResponse.json({
      success: true,
      data: {
        processor: processorStatus,
        monitoring_stats: monitoringStats,
        system_info: {
          version: '1.0.0',
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logError('Error getting processor status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitors/social-media/processor
 * Trigger manual processing or control processor operations
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const { user, error } = await authenticateRequest();
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const requestSchema = z.object({
      action: z.enum(['start', 'stop', 'process_now', 'analyze_competitor']),
      competitor_id: z.number().optional(),
      interval_minutes: z.number().min(5).max(1440).optional() // 5 minutes to 24 hours
    });

    const { action, competitor_id, interval_minutes } = requestSchema.parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = { action };

    switch (action) {
      case 'start':
        socialMediaJobProcessor.start(interval_minutes || 15);
        result.message = `Social media processor started with ${interval_minutes || 15} minute intervals`;
        result.status = socialMediaJobProcessor.getStatus();
        break;

      case 'stop':
        socialMediaJobProcessor.stop();
        result.message = 'Social media processor stopped';
        result.status = socialMediaJobProcessor.getStatus();
        break;

      case 'process_now':
        // Trigger immediate processing
        await socialMediaJobProcessor.processJobsManually();
        result.message = 'Manual processing completed';
        result.processed_at = new Date().toISOString();
        break;

      case 'analyze_competitor':
        if (!competitor_id) {
          return NextResponse.json(
            { error: 'competitor_id is required for analyze_competitor action' },
            { status: 400 }
          );
        }

        // Trigger analysis for specific competitor
        const analysisResult = await socialMediaJobProcessor.analyzeCompetitorManually(competitor_id);
        result.message = `Analysis completed for competitor ${competitor_id}`;
        result.analysis_result = analysisResult;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logError('Error processing processor action:', error);

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
 * PUT /api/competitors/social-media/processor
 * Update processor configuration
 */
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Authentication
    const { user, error } = await authenticateRequest();
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const configSchema = z.object({
      interval_minutes: z.number().min(5).max(1440).optional(),
      auto_start: z.boolean().optional(),
      max_concurrent_jobs: z.number().min(1).max(10).optional(),
      cleanup_days: z.number().min(7).max(365).optional()
    });

    const config = configSchema.parse(body);

    // Update processor configuration
    // Note: In a real implementation, you'd store this configuration in a database
    // and the processor would read from it

    const message = 'Processor configuration updated';
    const updates: string[] = [];

    if (config.interval_minutes) {
      // Restart processor with new interval
      socialMediaJobProcessor.stop();
      socialMediaJobProcessor.start(config.interval_minutes);
      updates.push(`Interval changed to ${config.interval_minutes} minutes`);
    }

    if (config.cleanup_days) {
      // Trigger cleanup with new retention period
      await socialMediaScheduler.cleanupOldResults(config.cleanup_days);
      updates.push(`Cleanup retention set to ${config.cleanup_days} days`);
    }

    return NextResponse.json({
      success: true,
      data: {
        message,
        updates,
        current_config: config,
        processor_status: socialMediaJobProcessor.getStatus()
      }
    });

  } catch (error) {
    logError('Error updating processor configuration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}