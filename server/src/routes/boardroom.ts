import { Router } from "express";
import { BoardroomOrchestrator } from "../services/boardroom/orchestrator";
import { db } from "../../db";
import { boardroomSessions } from "../../db/schema";
import { eq } from "drizzle-orm";

export const boardroomRouter = Router();
const orchestrator = new BoardroomOrchestrator();

boardroomRouter.post("/sessions", async (req, res) => {
  const { title, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const session = await db.insert(boardroomSessions).values({
    id: crypto.randomUUID(),
    userId,
    title: title || "New Strategic Session",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();

  res.status(201).json(session[0]);
});

boardroomRouter.get("/sessions/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const history = await orchestrator.getSessionHistory(sessionId);
  res.json(history);
});

boardroomRouter.post("/sessions/:sessionId/messages", async (req, res) => {
  const { sessionId } = req.params;
  const { message, agentId } = req.body;

  // Save user message
  await orchestrator.saveMessage(sessionId, agentId || "user", "user", message);

  // Get history for context
  const history = await orchestrator.getSessionHistory(sessionId);
  
  // Determine next speaker
  const nextSpeaker = await orchestrator.getNextSpeaker(sessionId, history);
  
  // Generate response
  const response = await orchestrator.generateResponse(nextSpeaker, sessionId, message);
  
  // Save agent message
  await orchestrator.saveMessage(sessionId, nextSpeaker, "assistant", response.content);

  res.status(201).json({
    agentId: nextSpeaker,
    content: response.content
  });
});
