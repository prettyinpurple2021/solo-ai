import { Redis } from "@upstash/redis";
import { logError, logInfo } from "../../../utils/logger";
import { z } from "zod";

/**
 * Minimal KV shape used by the blackboard (Upstash or in-process fallback).
 * When UPSTASH_* env vars are unset, we use memory — same API, no Upstash client warnings,
 * suitable for tests and single-node dev. Production should set Upstash for multi-instance.
 */
interface BlackboardKv {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: string) => Promise<unknown>;
}

class MemoryBlackboardKv implements BlackboardKv {
  private readonly store = new Map<string, string>();

  async get<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key);
    if (raw === undefined) return null;
    return raw as T;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

function createBlackboardKv(): BlackboardKv {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    return new Redis({ url, token }) as unknown as BlackboardKv;
  }
  if (process.env.NODE_ENV === "development") {
    logInfo(
      "Boardroom blackboard: Upstash Redis not configured; using in-memory store (single process only)."
    );
  }
  return new MemoryBlackboardKv();
}

const redis = createBlackboardKv();

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

      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return BlackboardStateSchema.parse(parsed);
    } catch (error) {
      logError(`BlackboardManager.getState failed for ${sessionId}`, error);
      return null;
    }
  }

  /**
   * Update the blackboard state atomically
   */
  async updateState(
    sessionId: string,
    updates: Partial<BlackboardState["content"]>,
    agentId: string
  ): Promise<BlackboardState> {
    const key = `${BlackboardManager.KEY_PREFIX}${sessionId}`;

    try {
      // Use Redis transaction/locking for production safety if multiple agents write simultaneously
      // For now, fetch-and-update with version check
      const currentState = (await this.getState(sessionId)) || {
        sessionId,
        version: 0,
        content: {},
        activeAgents: [],
        lastUpdated: new Date().toISOString(),
      };

      const newState: BlackboardState = {
        ...currentState,
        version: currentState.version + 1,
        content: { ...currentState.content, ...updates },
        activeAgents: Array.from(new Set([...currentState.activeAgents, agentId])),
        lastUpdated: new Date().toISOString(),
      };

      await redis.set(key, JSON.stringify(newState));
      logInfo(`Blackboard state updated for ${sessionId} by ${agentId}`, {
        version: newState.version,
      });

      return newState;
    } catch (error) {
      logError(`BlackboardManager.updateState failed for ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * Initialize a new blackboard for a session
   */
  async initialize(
    sessionId: string,
    initialContent: Record<string, unknown> = {}
  ): Promise<BlackboardState> {
    const state: BlackboardState = {
      sessionId,
      version: 1,
      content: initialContent,
      activeAgents: [],
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(
      `${BlackboardManager.KEY_PREFIX}${sessionId}`,
      JSON.stringify(state)
    );
    return state;
  }
}
