import { BoardroomOrchestrator } from "../../../../server/src/services/boardroom/orchestrator";

describe("BoardroomOrchestrator", () => {
  let orchestrator: BoardroomOrchestrator;

  beforeEach(() => {
    orchestrator = new BoardroomOrchestrator();
  });

  it("should determine the next speaker", async () => {
    const nextSpeaker = await orchestrator.getNextSpeaker("session-1", []);
    expect(nextSpeaker).toBeDefined();
  });

  it("should generate a response from an agent", async () => {
    const response = await orchestrator.generateResponse("agent-1", "session-1", "Hello");
    expect(response).toBeDefined();
    expect(response.content).toBe("Mock response from agent-1");
  });

  it("should cycle through speakers", async () => {
    const speaker1 = await orchestrator.getNextSpeaker("session-1", []);
    const speaker2 = await orchestrator.getNextSpeaker("session-1", [{ agentId: speaker1 }]);
    expect(speaker1).not.toBe(speaker2);
  });
});
