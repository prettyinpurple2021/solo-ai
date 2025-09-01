import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { alertSystem } from '@/lib/competitor-alert-system';
import { z } from 'zod';

const getCompetitorAlertsSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
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

    const competitorId = parseInt(params.id);
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { limit } = getCompetitorAlertsSchema.parse(Object.fromEntries(searchParams));

    // Get alerts for specific competitor
    const alerts = await alertSystem.getAlertsByCompetitor(
      authResult.user.id,
      competitorId,
      limit
    );

    return NextResponse.json({
      alerts,
      competitor_id: competitorId,
      pagination: {
        limit,
        total: alerts.length,
      },
    });

  } catch (error) {
    console.error('Error fetching competitor alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}