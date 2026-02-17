import { db } from "../../../db";
import { boardroomSessions, boardroomMessages } from "../../../../lib/shared/db/schema";
import { eq, asc } from "drizzle-orm";
import { AgentId } from "../../../../src/types";

export class BoardroomOrchestrator {
  private agents = [AgentId.ROXY, AgentId.ECHO, AgentId.LEXI];

  async getNextSpeaker(sessionId: string, history: { agentId: string }[]): Promise<string> {
    if (history.length === 0) {
      return this.agents[0];
    }
    const lastSpeaker = history[history.length - 1].agentId;
    const lastIndex = this.agents.indexOf(lastSpeaker as AgentId);
    const nextIndex = (lastIndex + 1) % this.agents.length;
    return this.agents[nextIndex];
  }

  async generateResponse(agentId: string, sessionId: string, message: string): Promise<{ content: string }> {
    // In a real implementation, this would call the AI service
    // For now, we still return mock content but the structure is ready
    return { content: `Mock response from ${agentId} regarding: ${message.substring(0, 20)}...` };
  }

  async saveMessage(sessionId: string, agentId: string, role: "user" | "assistant", content: string) {
    return await db.insert(boardroomMessages).values({
            sessionId,
            agentId,
            role,
            content,
            metadata: {},
            createdAt: new Date()
        }).returning();
  }

  async getSessionHistory(sessionId: string) {
    return await db.select()
      .from(boardroomMessages)
      .where(eq(boardroomMessages.sessionId, sessionId))
      .orderBy(asc(boardroomMessages.createdAt));
  }
}
