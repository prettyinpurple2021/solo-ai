import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server';
import { authenticateRequest} from '@/lib/auth-server';
import { rateLimitByIp} from '@/lib/rate-limit';
import { alertSystem} from '@/lib/competitor-alert-system';
import { z} from 'zod';
import { db } from '@/db';
import { competitorAlerts } from '@/db/schema';
import { eq } from 'drizzle-orm';




const updateAlertSchema = z.object({
  action: z.enum(['mark_read', 'archive']),
});


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const alertId = params.id;

    // Parse request body
    const body = await request.json();
    const { action } = updateAlertSchema.parse(body);

    // Perform the requested action
    switch (action) {
      case 'mark_read':
        await alertSystem.markAlertAsRead(alertId, user.id);
        break;
      case 'archive':
        await alertSystem.archiveAlert(alertId, user.id);
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${action === 'mark_read' ? 'marked as read' : 'archived'} successfully`,
    });

  } catch (error) {
    logError('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const alertId = params.id;

    // Get alert details
    const [alert] = await db.select()
      .from(competitorAlerts)
      .where(eq(competitorAlerts.id, alertId))
      .limit(1);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (alert.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
    });

  } catch (error) {
    logError('Error fetching alert details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}