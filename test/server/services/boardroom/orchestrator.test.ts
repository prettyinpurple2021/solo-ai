import { BoardroomOrchestrator } from "../../../../server/src/services/boardroom/orchestrator";
import { jest } from '@jest/globals';

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: "Mock response from agent-1" }),
    },
  })),
}));

describe("BoardroomOrchestrator", () => {
  let orchestrator: BoardroomOrchestrator;
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    orchestrator = new BoardroomOrchestrator();
  });

  afterAll(() => {
    if (originalGeminiKey) {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("should determine the next speaker", async () => {
    const nextSpeaker = await orchestrator.getNextSpeaker("session-1", []);
    expect(nextSpeaker).toBeDefined();
  });

  it("should generate a response from an agent", async () => {
    const response = await orchestrator.generateResponse("agent-1", "session-1", "Hello");
    expect(response).toBeDefined();
    expect(response.content).toContain("currently offline");
  });

  it("should cycle through speakers", async () => {
    const speaker1 = await orchestrator.getNextSpeaker("session-1", []);
    const speaker2 = await orchestrator.getNextSpeaker("session-1", [{ agentId: speaker1 }]);
    expect(speaker1).not.toBe(speaker2);
  });
});
