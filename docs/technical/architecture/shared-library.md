# Shared Internal Library Foundation (Phase 1)

## Overview
The Shared Internal Library Foundation provides a standardized, type-safe communication layer between the various services of the SoloSuccess AI platform. It ensures that data structures are consistent across the Next.js frontend, API routes, and the standalone Express Socket.IO server.

## Core Schemas

### 1. `ServerResponseSchema`
Standardizes the response format for all API routes and Server Actions.

**Structure:**
- `success`: boolean
- `data`: any (Required if `success` is `true`)
- `error`: string (Optional, recommended if `success` is `false`)
- `message`: string (Optional)
- `meta`: Object (Optional)
  - `timestamp`: ISO Date string
  - `requestId`: string (Optional)
  - `version`: string (Optional)

### 2. `BoardroomEventSchema`
A discriminated union for Socket.IO events within the "Boardroom" collaboration namespace.

**Event Types:**
- `agent_collaboration`: Validates payload for agent-to-agent messages.
- `goal_update`: Validates payload for shared objective progress.
- `market_data_update`: Validates payload for real-time external data feeds.

### 3. `DominatorAgentOutputSchema`
Standardizes the structured output produced by high-level ("Dominator" class) AI agents.

**Structure:**
- `agentId`: string (e.g., "roxy", "echo")
- `content`: string (The primary response text)
- `timestamp`: ISO Date string
- `metadata`: Key-Value record (Optional, supports string, number, or boolean values)

## Implementation Details

- **Location**: `lib/shared/schemas.ts`
- **Validation**: Performed using [Zod](https://zod.dev/).
- **Type Inference**: TypeScript types are automatically inferred from the schemas to ensure compile-time safety.

## Usage Guidelines

### API Responses
Always use the `createSuccessResponse` and `createErrorResponse` utilities from `src/lib/api-response.ts`. These utilities automatically validate the response structure against the `ServerResponseSchema`.

### Real-Time Events
Socket.IO handlers in `server/src/realtime/boardroom.ts` use `BoardroomEventSchema.parse()` to validate incoming data before broadcasting or processing.

### Agent Logic
When an agent completes a task, wrap its output in the `DominatorAgentOutputSchema` format to ensure the frontend can parse it consistently.
