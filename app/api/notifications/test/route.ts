import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { notificationDelivery } from '@/lib/notification-delivery-system';
import { CompetitorAlert } from '@/hooks/use-competitor-alerts';
import { z } from 'zod';

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const testNotificationSchema = z.object({
  channel_type: z.enum(['email', 'push', 'slack', 'discord', 'webhook']),
  severity: z.enum(['info', 'warning', 'urgent', 'critical']).default('info'),
  config: z.record(z.string(), z.any()).optional(),
});


export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 5, window: 60 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
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
    const { channel_type, severity, config } = testNotificationSchema.parse(body);

    // Create a test alert
    const testAlert: CompetitorAlert = {
      id: 999999,
      competitor_id: 1,
      alert_type: 'product_launch',
      severity,
      title: 'Test Notification - Competitor Product Launch',
      description: 'This is a test notification to verify your notification channel is working correctly. A competitor has launched a new product that may impact your market position.',
      is_read: false,
      created_at: new Date().toISOString(),
      competitor_name: 'Test Competitor Inc.',
      competitor_threat_level: 'medium',
      user_id: user.id,
    };

    // Create test channel configuration
    const testChannel = {
      id: `test_${channel_type}`,
      name: `Test ${channel_type.charAt(0).toUpperCase() + channel_type.slice(1)}`,
      type: channel_type,
      enabled: true,
      config: config || {},
      severityFilter: [],
      typeFilter: [],
    };

    // Deliver test notification
    const result = await notificationDelivery['deliverToChannel'](testAlert, testChannel);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Test notification sent successfully via ${channel_type}`
        : `Failed to send test notification: ${result.error}`,
      result,
    });

  } catch (error) {
    logError('Error sending test notification:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid test parameters', // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: (error as any).errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}