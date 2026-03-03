import { z } from 'zod';

/**
 * Validates the structured output from a Dominator class agent.
 */
export const DominatorAgentOutputSchema = z.object({
  agentId: z.string(),
  content: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type DominatorAgentOutput = z.infer<typeof DominatorAgentOutputSchema>;

// Define specific schemas for each Boardroom event type
const AgentCollaborationPayloadSchema = z.object({
  agentMessage: z.string(),
  collaboratingAgentId: z.string(),
});

const GoalUpdatePayloadSchema = z.object({
  newGoal: z.string(),
  progress: z.number(),
});

const MarketDataUpdatePayloadSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
});

/**
 * Validates the payload for Socket.IO "Boardroom" collaboration events.
 */
export const BoardroomEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("agent_collaboration"),
    payload: AgentCollaborationPayloadSchema,
    timestamp: z.string().datetime(),
  }),
  z.object({
    type: z.literal("goal_update"),
    payload: GoalUpdatePayloadSchema,
    timestamp: z.string().datetime(),
  }),
  z.object({
    type: z.literal("market_data_update"),
    payload: MarketDataUpdatePayloadSchema,
    timestamp: z.string().datetime(),
  }),
]);

export type BoardroomEvent = z.infer<typeof BoardroomEventSchema>;

/**
 * Validates the collaborative blackboard state update.
 */
export const BlackboardUpdateSchema = z.object({
  sessionId: z.string().uuid(),
  agentId: z.string().min(1),
  updates: z.record(z.string(), z.any()),
  version: z.number().optional(),
});

export type BlackboardUpdate = z.infer<typeof BlackboardUpdateSchema>;

/**
 * Validates the full blackboard state structure.
 */
export const BlackboardStateSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.record(z.string(), z.any()),
  version: z.number(),
  lastUpdatedBy: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type BlackboardState = z.infer<typeof BlackboardStateSchema>;

/**
 * Chat related schemas
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  agentId: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  agentId: z.string().optional(),
  conversationId: z.string().uuid().optional(),
});

/**
 * User and Profile related schemas
 */
export const UserUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

/**
 * Standardized server response format for all Server Actions and API routes.
 */
/**
 * Standardized server response format for all Server Actions and API routes.
 */
export function createServerResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    meta: z.object({
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
      version: z.string().optional(),
    }).optional(),
  }).superRefine((data, ctx) => {
    if (data.success && data.data === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data must be present if success is true",
        path: ["data"],
      });
    }
    if (!data.success && data.error === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Error must be present if success is false",
        path: ["error"],
      });
    }
  });
}

export const ServerResponseSchema = createServerResponseSchema(z.any());


export type ServerResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
};
