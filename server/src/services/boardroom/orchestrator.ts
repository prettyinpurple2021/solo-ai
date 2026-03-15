import { db } from "../../../db";
import { boardroomSessions, boardroomMessages } from "../../../../src/lib/shared/db/schema";
import { eq, asc } from "drizzle-orm";
import { AgentId } from "../../../../src/types";
import { GoogleGenAI } from "@google/genai";

export class BoardroomOrchestrator {
  private agents = [AgentId.ROXY, AgentId.ECHO, AgentId.LEXI];
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    }
  }

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
    if (!this.ai) {
      return { content: `Agent ${agentId} is currently offline. (API Key missing)` };
    }

    try {
      const history = await this.getSessionHistory(sessionId);
      const conversationContext = history.map(m => `${m.role === 'user' ? 'Founder' : m.agentId}: ${m.content}`).join('\n');

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const prompt = `
        You are ${agentId}, a member of the SoloSuccess AI C-Suite.
        
        CONVERSATION HISTORY:
        ${conversationContext}
        
        NEW MESSAGE:
        ${message}
        
        INSTRUCTIONS:
        - Respond as ${agentId} with your specific expertise and personality.
        - Keep it professional, strategic, and concise (max 3-4 sentences).
        - Direct your response to the founder or the previous speaker if appropriate.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { content: response.text().trim() || "Consensus pending..." };
    } catch (error) {
      console.error(`Error generating response for ${agentId}:`, error);
      return { content: `Agent ${agentId} encountered a neural synchronization error.` };
    }
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
