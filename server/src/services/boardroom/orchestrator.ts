export class BoardroomOrchestrator {
  private agents = ["agent-1", "agent-2", "agent-3"];

  async getNextSpeaker(sessionId: string, history: { agentId: string }[]): Promise<string> {
    if (history.length === 0) {
      return this.agents[0];
    }
    const lastSpeaker = history[history.length - 1].agentId;
    const lastIndex = this.agents.indexOf(lastSpeaker);
    const nextIndex = (lastIndex + 1) % this.agents.length;
    return this.agents[nextIndex];
  }

  async generateResponse(agentId: string, sessionId: string, message: string): Promise<{ content: string }> {
    return { content: `Mock response from ${agentId}` };
  }
}
