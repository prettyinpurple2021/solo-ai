
import { db } from '@/db';
import { agentActions } from '@/shared/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { EmailService } from '../email-service';
import { GoogleCalendarService } from './google-calendar-service';
import { logError, logInfo } from '@/lib/logger';
import { toolRegistry } from '../agents/tools/registry';

export type AgentActionStatus = 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';

export class AgentActionService {
  /**
   * Create a new pending action from an agent
   */
  static async createAction(params: {
    userId: string;
    agentId: string;
    actionType: string;
    payload: any;
    requiresApproval?: boolean;
  }) {
    const { userId, agentId, actionType, payload, requiresApproval = true } = params;

    try {
      // Validate payload against registry
      const validatedPayload = toolRegistry.validateParams(actionType, payload);

      const [action] = await db.insert(agentActions).values({
        userId,
        agentId,
        actionType,
        payload: validatedPayload,
        status: requiresApproval ? 'pending_approval' : 'approved',
        requiresApproval,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      logInfo(`Agent action created: ${actionType} for user ${userId}`, { actionId: action.id });

      // If no approval required, execute immediately
      if (!requiresApproval) {
        this.executeAction(action.id);
      }

      return { success: true, action };
    } catch (error) {
      logError('Failed to create agent action:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Approve an action
   */
  static async approveAction(actionId: string, userId: string) {
    try {
      const [updated] = await db.update(agentActions)
        .set({
          status: 'approved',
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(agentActions.id, actionId), eq(agentActions.userId, userId)))
        .returning();

      if (!updated) return { success: false, error: 'Action not found' };

      // Trigger execution
      this.executeAction(actionId);

      return { success: true, action: updated };
    } catch (error) {
      logError('Failed to approve action:', error);
      return { success: false, error };
    }
  }

  /**
   * Reject an action
   */
  static async rejectAction(actionId: string, userId: string) {
    try {
      const [updated] = await db.update(agentActions)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(and(eq(agentActions.id, actionId), eq(agentActions.userId, userId)))
        .returning();

      return { success: !!updated };
    } catch (error) {
      logError('Failed to reject action:', error);
      return { success: false, error };
    }
  }

  /**
   * Internal method to execute an approved action
   */
  private static async executeAction(actionId: string) {
    const action = await db.query.agentActions.findFirst({
      where: eq(agentActions.id, actionId)
    });

    if (!action || action.status !== 'approved') return;

    try {
      await db.update(agentActions)
        .set({ status: 'executing', executedAt: new Date() })
        .where(eq(agentActions.id, actionId));

      let result: any;

      switch (action.actionType) {
        case 'sendEmail':
          const emailParams = action.payload as any;
          const sent = await EmailService.sendEmail({
            to: emailParams.to,
            subject: emailParams.subject,
            html: emailParams.body,
            text: emailParams.body,
          });
          result = { sent };
          break;
        
        case 'scheduleMeeting':
          const meetingParams = action.payload as any;
          result = await GoogleCalendarService.createEvent(action.userId, {
            title: meetingParams.title,
            description: meetingParams.description,
            startTime: meetingParams.startTime,
            endTime: meetingParams.endTime,
            attendees: meetingParams.attendees,
            location: meetingParams.location
          });
          break;
        
        // Placeholder for other tools
        default:
          throw new Error(`Execution for ${action.actionType} not yet implemented`);
      }

      await db.update(agentActions)
        .set({
          status: 'completed',
          result,
          updatedAt: new Date(),
        })
        .where(eq(agentActions.id, actionId));

      logInfo(`Agent action completed: ${actionId}`);
    } catch (error) {
      logError(`Execution failed for action ${actionId}:`, error);
      await db.update(agentActions)
        .set({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown execution error',
          updatedAt: new Date(),
        })
        .where(eq(agentActions.id, actionId));
    }
  }

  /**
   * Get actions for a user
   */
  static async getActions(userId: string, limit = 20) {
    return await db.query.agentActions.findMany({
      where: eq(agentActions.userId, userId),
      orderBy: [desc(agentActions.createdAt)],
      limit
    });
  }
}
