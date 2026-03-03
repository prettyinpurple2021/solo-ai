
'use server'

import { authenticateAction } from '@/lib/auth-server';
import { AgentActionService } from '@/lib/services/agent-action-service';
import { revalidatePath } from 'next/cache';

export async function createAgentAction(data: {
  agentId: string;
  actionType: string;
  payload: any;
  requiresApproval?: boolean;
}) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  return await AgentActionService.createAction({
    userId: user.id,
    ...data
  });
}

export async function approveAgentAction(actionId: string) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  const result = await AgentActionService.approveAction(actionId, user.id);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/agents');
  
  return result;
}

export async function rejectAgentAction(actionId: string) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  const result = await AgentActionService.rejectAction(actionId, user.id);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/agents');
  
  return result;
}
