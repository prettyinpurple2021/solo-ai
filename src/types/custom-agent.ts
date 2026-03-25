export interface AgentContext {
  [key: string]: unknown;
  decisionPatterns?: Array<{
    framework: string;
    outcome: boolean;
    timestamp: Date;
  }>;
  growthPatterns?: Array<{
    strategy: string;
    revenueImpact: string; // or number, based on usage, inferred as any/unknown previously
    timestamp: Date;
  }>;
  salesPatterns?: Array<{
    motion: string;
    outcome: boolean | undefined;
    timestamp: Date;
  }>;
  contentPatterns?: Array<any>; // Using any for now to unblock, can refine later
  problemPatterns?: Array<any>;
  analysisPatterns?: Array<any>;
  compliancePatterns?: Array<any>;
  designPatterns?: Array<any>;
  technicalPatterns?: Array<any>;
}

export interface AgentInteraction {
  type: string;
  framework?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface AgentOutcome {
  success: boolean;
  error?: string;
  result?: unknown;
}

export interface AgentRelationship {
  agentId: string;
  collaborationHistory: Array<{
    timestamp: Date;
    interaction: AgentInteraction;
    outcome: AgentOutcome;
  }>;
  trustLevel: number;
  specialization: string;
}

export interface AgentMemory {
  userId: string;
  context: AgentContext;
  preferences: Record<string, unknown>;
  history: Array<{
    timestamp: Date;
    interaction: string;
    outcome: string;
    learning: string;
  }>;
  relationships: Record<string, AgentRelationship>;
}
