import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { alertSystem } from '@/lib/competitor-alert-system';
import { z } from 'zod';

const getAlertsSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  severity: z.enum(['info', 'warning', 'urgent', 'critical']).optional(),
  type: z.string().optional(),
  unread_only: z.string().optional().transform(val => val === 'true'),
});

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = getAlertsSchema.parse(Object.fromEntries(searchParams));

    // Get alerts
    const alerts = await alertSystem.getActiveAlerts(authResult.user.id, params.limit);
    
    // Filter by severity if specified
    let filteredAlerts = alerts;
    if (params.severity) {
      filteredAlerts = alerts.filter(alert => alert.severity === params.severity);
    }

    // Filter by type if specified
    if (params.type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.alert_type === params.type);
    }

    // Filter by unread if specified
    if (params.unread_only) {
      filteredAlerts = filteredAlerts.filter(alert => !alert.is_read);
    }

    // Get alert statistics
    const stats = await alertSystem.getAlertStats(authResult.user.id);

    return NextResponse.json({
      alerts: filteredAlerts,
      stats,
      pagination: {
        limit: params.limit,
        total: filteredAlerts.length,
      },
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const processIntelligenceSchema = z.object({
  intelligence_id: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 });
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

    // Parse request body
    const body = await request.json();
    const { intelligence_id } = processIntelligenceSchema.parse(body);

    // Process intelligence for alerts
    const result = await alertSystem.processIntelligenceForAlerts(intelligence_id);

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Error processing intelligence for alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}