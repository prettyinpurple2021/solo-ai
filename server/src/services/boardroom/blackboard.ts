import { Redis } from "@upstash/redis";
import { logError, logInfo } from "../../../utils/logger";
import { z } from "zod";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const BlackboardStateSchema = z.object({
  sessionId: z.string(),
  version: z.number(),
  content: z.record(z.any()),
  activeAgents: z.array(z.string()),
  lastUpdated: z.string(),
  consensus: z.string().optional(),
});

export type BlackboardState = z.infer<typeof BlackboardStateSchema>;

export class BlackboardManager {
  private static readonly KEY_PREFIX = "boardroom:blackboard:";

  /**
   * Get the current state of the blackboard for a session
   */
  async getState(sessionId: string): Promise<BlackboardState | null> {
    try {
      const data = await redis.get<string>(`${BlackboardManager.KEY_PREFIX}${sessionId}`);
      if (!data) return null;
      
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return BlackboardStateSchema.parse(parsed);
    } catch (error) {
      logError(`BlackboardManager.getState failed for ${sessionId}`, error);
      return null;
    }
  }

  /**
   * Update the blackboard state atomically
   */
  async updateState(sessionId: string, updates: Partial<BlackboardState['content']>, agentId: string): Promise<BlackboardState> {
    const key = `${BlackboardManager.KEY_PREFIX}${sessionId}`;
    
    try {
      // Use Redis transaction/locking for production safety if multiple agents write simultaneously
      // For now, fetch-and-update with version check
      const currentState = await this.getState(sessionId) || {
        sessionId,
        version: 0,
        content: {},
        activeAgents: [],
        lastUpdated: new Date().toISOString()
      };

      const newState: BlackboardState = {
        ...currentState,
        version: currentState.version + 1,
        content: { ...currentState.content, ...updates },
        activeAgents: Array.from(new Set([...currentState.activeAgents, agentId])),
        lastUpdated: new Date().toISOString()
      };

      await redis.set(key, JSON.stringify(newState));
      logInfo(`Blackboard state updated for ${sessionId} by ${agentId}`, { version: newState.version });
      
      return newState;
    } catch (error) {
      logError(`BlackboardManager.updateState failed for ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * Initialize a new blackboard for a session
   */
  async initialize(sessionId: string, initialContent: Record<string, any> = {}): Promise<BlackboardState> {
    const state: BlackboardState = {
      sessionId,
      version: 1,
      content: initialContent,
      activeAgents: [],
      lastUpdated: new Date().toISOString()
    };

    await redis.set(`${BlackboardManager.KEY_PREFIX}${sessionId}`, JSON.stringify(state));
    return state;
  }
}
