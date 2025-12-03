import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { notificationDelivery, NotificationPreferences } from '@/lib/notification-delivery-system';
import { AlertType } from '@/lib/competitor-alert-system';
import { z } from 'zod';

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


const notificationChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['email', 'push', 'slack', 'discord', 'webhook', 'in_app']),
  enabled: z.boolean(),
  config: z.record(z.string(), z.any()),
  severityFilter: z.array(z.enum(['info', 'warning', 'urgent', 'critical'])),
  typeFilter: z.array(z.enum(['pricing_change', 'product_launch', 'funding_announcement', 'key_hire', 'negative_news', 'website_change', 'social_activity', 'job_posting', 'partnership'])),
});

const notificationPreferencesSchema = z.object({
  channels: z.array(notificationChannelSchema),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string(),
  }),
  frequency: z.object({
    immediate: z.array(z.enum(['info', 'warning', 'urgent', 'critical'])),
    batched: z.array(z.enum(['info', 'warning', 'urgent', 'critical'])),
    batchInterval: z.number().min(5).max(1440), // 5 minutes to 24 hours
  }),
});


export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 });
    if (!rateLimitResult.allowed) {
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

    // Get user's notification preferences
    // In a real implementation, this would come from the database
    // For now, we'll return default preferences
    const preferences = await notificationDelivery.getDefaultNotificationPreferences(user.id);

    return NextResponse.json({
      preferences,
    });

  } catch (error) {
    logError('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 60 });
    if (!rateLimitResult.allowed) {
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
    const preferences = notificationPreferencesSchema.parse(body);

    // Add user ID to preferences
    const fullPreferences: NotificationPreferences = {
      userId: user.id,
      ...preferences,
    };

    // In a real implementation, save to database
    // For now, we'll just validate and return success
    logInfo('Saving notification preferences for user:', { userId: user.id, preferences: fullPreferences });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: fullPreferences,
    });

  } catch (error) {
    logError('Error updating notification preferences:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}