
import { Router } from "express";
import { BoardroomOrchestrator } from "../services/boardroom/orchestrator";

export const boardroomRouter = Router();
const orchestrator = new BoardroomOrchestrator();

boardroomRouter.post("/sessions", async (req, res) => {
  // Mock implementation for session creation
  res.status(201).json({ id: "session-1", title: "New Session" });
});

boardroomRouter.post("/sessions/:sessionId/messages", async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  // Mock getting history
  const history = [{ agentId: "user" }];
  const nextSpeaker = await orchestrator.getNextSpeaker(sessionId, history);
  const response = await orchestrator.generateResponse(nextSpeaker, sessionId, message);
  res.status(201).json(response);
});
