import { z } from 'zod';

/**
 * Validates the structured output from a Dominator class agent.
 */
export const DominatorAgentOutputSchema = z.object({
  agentId: z.string(),
  content: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

export type DominatorAgentOutput = z.infer<typeof DominatorAgentOutputSchema>;

/**
 * Validates the payload for Socket.IO "Boardroom" collaboration events.
 */
export const BoardroomEventSchema = z.object({
  type: z.enum(['agent_collaboration', 'goal_update', 'market_data_update']),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});

export type BoardroomEvent = z.infer<typeof BoardroomEventSchema>;

/**
 * Standardized server response format for all Server Actions and API routes.
 */
export const ServerResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ServerResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
