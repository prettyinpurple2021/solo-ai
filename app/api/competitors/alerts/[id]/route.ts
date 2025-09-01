import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { rateLimitByIp } from '@/lib/rate-limit';
import { alertSystem } from '@/lib/competitor-alert-system';
import { z } from 'zod';

const updateAlertSchema = z.object({
  action: z.enum(['mark_read', 'archive']),
});

export async function PATCH(
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

    const alertId = parseInt(params.id);
    if (isNaN(alertId)) {
      return NextResponse.json(
        { error: 'Invalid alert ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action } = updateAlertSchema.parse(body);

    // Perform the requested action
    switch (action) {
      case 'mark_read':
        await alertSystem.markAlertAsRead(alertId, authResult.user.id);
        break;
      case 'archive':
        await alertSystem.archiveAlert(alertId, authResult.user.id);
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${action === 'mark_read' ? 'marked as read' : 'archived'} successfully`,
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const alertId = parseInt(params.id);
    if (isNaN(alertId)) {
      return NextResponse.json(
        { error: 'Invalid alert ID' },
        { status: 400 }
      );
    }

    // Get alert details (this would need to be implemented in the alert system)
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      alert: {
        id: alertId,
        message: 'Alert details endpoint - to be implemented',
      },
    });

  } catch (error) {
    console.error('Error fetching alert details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}