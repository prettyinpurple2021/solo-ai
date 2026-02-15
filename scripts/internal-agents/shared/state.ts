
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'scripts', 'internal-agents', 'agent-state.json');

export interface AgentState {
  social?: {
    lastProcessedCommitHash?: string;
    lastRun?: string;
  };
  blog?: {
    lastDevlogDate?: string;
  };
  docs?: {
    lastReadmeUpdate?: string;
  };
}

export function loadState(): AgentState {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading agent state:", error);
    return {};
  }
}

export function saveState(state: AgentState): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("Error saving agent state:", error);
  }
}

export function updateAgentState(agent: keyof AgentState, newState: any): void {
  const currentState = loadState();
  currentState[agent] = { ...currentState[agent], ...newState };
  saveState(currentState);
}
