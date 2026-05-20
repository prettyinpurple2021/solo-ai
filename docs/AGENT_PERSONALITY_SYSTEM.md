# AI Agent Personality System

## Overview

The AI Agent Personality System is a modular framework that enables contextual, emotionally-aware AI agents to work alongside solo founders. Each agent has a distinct archetype with customizable personality traits, mood adaptations, and collaboration patterns.

**Location**: `src/lib/ai-personality-system.ts`, `src/lib/agent-collaboration.ts`

## Architecture

### Core Components

#### 1. **UserContext Interface**
Captures the founder's current state to enable adaptive responses:

```typescript
interface UserContext {
  id: string
  name: string
  preferences: {
    workStyle: "focused" | "collaborative" | "flexible"
    communicationStyle: "direct" | "encouraging" | "detailed"
    goals: string[]
    challenges: string[]
  }
  currentMood: "energized" | "stressed" | "focused" | "tired" | "motivated"
  timeOfDay: "morning" | "afternoon" | "evening" | "late-night"
  recentActivity: string[]
  achievements: string[]
}
```

#### 2. **AgentPersonality Interface**
Defines the personality configuration for each agent:

```typescript
interface AgentPersonality {
  basePersonality: string                    // Core identity
  moodAdaptations: Record<string, string>    // Mood-specific responses
  timeBasedGreetings: Record<string, string> // Time-of-day greetings
  achievementCelebrations: string[]          // Celebration messages
  motivationalQuotes: string[]               // Motivational messages
  contextualResponses: Record<string, string> // Context-specific responses
}
```

#### 3. **PersonalityEngine Class**
Orchestrates personality-aware responses:

- `generateContextualResponse()`: Builds context-aware prompts for AI models
- `updateUserContext()`: Updates user preferences and mood in real-time
- `getGreeting()`: Returns time-appropriate greeting for an agent
- `getCelebration()`: Returns achievement celebration message
- `getMotivationalQuote()`: Returns motivational support message

### Agent Archetypes

SoloSuccess AI includes 10 specialized agent personalities:

| Agent | Role | Communication Style | Specialization |
|-------|------|---------------------|-----------------|
| **Roxy** | Operations Architect | Efficient, precise | System optimization, scheduling |
| **Blaze** | Growth Vector Processor | High-velocity, metric-focused | Scaling, acceleration, metrics |
| **Echo** | Signal Amplification | Resonant, authentic | Brand, marketing, engagement |
| **Lumi** | Protocol Guardian | Meticulous, secure | Compliance, risk, stability |
| **Vex** | Efficiency Node | Detail-oriented, pragmatic | Debugging, reliability, QA |
| **Lexi** | Compliance Algorithm | Analytical, data-first | Analysis, insights, patterns |
| **Nova** | Innovation Protocol | Product-minded, outcome-driven | UX, feature design, roadmap |
| **Glitch** | System Override Specialist | Playful, creative | Edge cases, testing, fixes |
| **Aura** | Emotional Support Agent | Empathetic, grounding | Founder wellness, energy management |
| **Finn** | Financial Operations Engine | Data-driven, profit-focused | Revenue, profitability, pricing |

## Usage

### 1. Initialize Personality Engine

```typescript
import { PersonalityEngine } from "@/lib/ai-personality-system"

const userContext = {
  id: "user-123",
  name: "Alex",
  preferences: {
    workStyle: "focused",
    communicationStyle: "direct",
    goals: ["Launch product", "Raise funding"],
    challenges: ["Time management", "Technical decisions"]
  },
  currentMood: "energized",
  timeOfDay: "morning",
  recentActivity: ["Wrote 5 blog posts", "Met with 3 investors"],
  achievements: ["Shipped MVP", "Hit 100 users"]
}

const engine = new PersonalityEngine(userContext)
```

### 2. Generate Contextual Response

```typescript
const response = await engine.generateContextualResponse(
  "blaze",  // Agent ID
  "How can I accelerate my growth?",  // User message
  conversationHistory  // Optional: previous messages for context
)

console.log(response)
// Output: AI-generated response with Blaze's growth-focused personality
```

### 3. Update User Context

```typescript
engine.updateUserContext({
  currentMood: "stressed",
  recentActivity: ["...new activity..."]
})

// Aura will now offer supportive, grounding responses
```

### 4. Get Personality Elements

```typescript
// Get a time-appropriate greeting
const greeting = engine.getGreeting("roxy")

// Get achievement celebration
const celebration = engine.getCelebration("nova")

// Get motivational support
const quote = engine.getMotivationalQuote("aura")
```

## Multi-Agent Collaboration

### Collaboration Manager

The `AgentCollaborationManager` orchestrates multi-agent workflows:

```typescript
import { AgentCollaborationManager } from "@/lib/agent-collaboration"

const manager = new AgentCollaborationManager()

// Create a collaboration task
const task = await manager.createCollaborationTask("product-launch")

// Execute a phase
const { output, handoff } = await manager.executePhase(
  task,
  "phase_0",
  userInput,
  previousOutputs
)
```

### Predefined Collaboration Workflows

#### Product Launch
Sequential phases: Market Research → Technical Planning → Legal Review → Marketing Strategy → Design & UX → Sales Strategy → QA → Launch Coordination

#### Business Strategy
Sequential phases: Current State Analysis → Market Opportunity → Financial Planning → Marketing Roadmap → Operational Efficiency → Risk Assessment → Implementation Plan

#### Website Redesign
Sequential phases: User Research → Technical Architecture → Content Strategy → Design System → Development Planning → Quality Testing → Launch Strategy → Project Management

### Agent Handoffs

When a phase completes, the system generates a handoff document for the next agent:

```typescript
interface AgentHandoff {
  fromAgent: string           // Agent completing the phase
  toAgent: string             // Next agent in workflow
  context: string             // Summary of completed work
  deliverables: string[]      // Key outputs
  instructions: string        // Specific guidance for next agent
}
```

## Extending the System

### Add a New Agent

1. **Define personality** in `agentPersonalities` object in `src/lib/ai-personality-system.ts`:

```typescript
newAgent: {
  basePersonality: "Your agent's core identity...",
  moodAdaptations: {
    energized: "Response when energized...",
    stressed: "Response when stressed...",
    focused: "Response when focused...",
    tired: "Response when tired...",
    motivated: "Response when motivated..."
  },
  timeBasedGreetings: {
    morning: "Morning greeting...",
    afternoon: "Afternoon greeting...",
    evening: "Evening greeting...",
    "late-night": "Late-night greeting..."
  },
  achievementCelebrations: [
    "Celebration message 1...",
    "Celebration message 2..."
  ],
  motivationalQuotes: [
    "Quote 1...",
    "Quote 2..."
  ],
  contextualResponses: {
    "context_type": "Response for this context..."
  }
}
```

2. **Create an agent class** (optional, for specialized behavior):

```typescript
// src/lib/custom-ai-agents/my-agent.ts
import { CustomAgent } from "./core-agent"

export class MyAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities = {
      frameworks: [...],
      specializations: [...],
      tools: [...],
      collaborationStyle: "..."
    }
    
    const systemPrompt = `You are MyAgent...`
    super("myagent", "My Agent", capabilities, userId, model, systemPrompt)
  }

  async processRequest(request: string, context?: any): Promise<AgentResponse> {
    // Custom logic here
  }
}
```

### Create a Collaboration Workflow

Add to `collaborationWorkflows` in `src/lib/agent-collaboration.ts`:

```typescript
"custom-workflow": {
  title: "Custom Workflow Title",
  description: "Workflow description...",
  phases: [
    {
      name: "Phase 1 Name",
      agent: "agent-id",
      description: "What this phase accomplishes..."
    },
    // ... more phases
  ]
}
```

## Best Practices

### 1. Match Communication Style to Context

Use `communicationStyle` preference to adapt responses:
- **direct**: Concise, action-oriented, no fluff
- **encouraging**: Supportive tone, celebrating progress
- **detailed**: Comprehensive explanations, full context

### 2. Leverage Mood Adaptation

Update `currentMood` frequently based on user signals:
- User mentions stress → update to "stressed"
- User completes a task → update to "motivated"
- Personality system automatically adjusts tone

### 3. Use Collaboration for Complex Tasks

Multi-phase tasks benefit from agent handoffs:
- Each agent brings expertise in their domain
- Handoff ensures context continuity
- Structured phases improve quality

### 4. Respect Time Zones

Update `timeOfDay` to provide timely support:
- Late night: Encourage rest, shorter sessions
- Morning: Energize, set daily goals
- Afternoon: Efficiency and momentum checks

## Integration Points

### With Core Agents

Each core agent (Roxy, Blaze, etc.) can be extended with the personality system:

```typescript
const agent = new RoxyAgent(userId)
const engine = new PersonalityEngine(userContext)

// Personality-aware response
const response = await engine.generateContextualResponse(
  "roxy",
  userMessage,
  conversationHistory
)
```

### With Chat Interfaces

Integrate in chat handlers:

```typescript
const { text } = await engine.generateContextualResponse(
  agentId,
  userMessage,
  chatHistory
)

// Send personality-aware response to user
sendChatMessage(text)
```

### With Dashboards

Show personality elements in UI:

```typescript
const greeting = engine.getGreeting(currentAgent)
const quote = engine.getMotivationalQuote(currentAgent)

// Display in dashboard header or sidebar
```

## Troubleshooting

### Agent Response Feels Out of Character
- Check if `currentMood` is accurately reflecting user state
- Verify agent personality configuration includes all required fields
- Ensure `communicationStyle` matches expected output tone

### Collaboration Workflow Stalls
- Verify all required agents in workflow are properly configured
- Check that `executePhase()` receives correct `previousOutputs`
- Review handoff context for clarity and completeness

### User Context Not Updating
- Call `updateUserContext()` after user state changes
- Verify new context fields are valid (e.g., valid mood values)
- Confirm PersonalityEngine instance is persisted across calls

## Performance Considerations

- **Token Usage**: PersonalityEngine builds comprehensive prompts; monitor token counts in production
- **Context Length**: Conversation history is included; truncate old messages to manage prompt size
- **Collaboration Complexity**: Handoff generation calls LLM; cache results for repeated workflows

## Related Documentation

- [AI Configuration Guide](./AI_CONFIGURATION.md) - Model setup and team member configs
- [Agent Collaboration Guide](./AGENT_COLLABORATION.md) - Detailed handoff patterns
- [Custom Agent Development](./CUSTOM_AGENT_DEVELOPMENT.md) - Building specialized agents
