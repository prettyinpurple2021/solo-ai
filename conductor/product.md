# Product Definition: SoloSuccess AI

## Initial Concept
SoloSuccess AI justifies its subscription value by offering a comprehensive "AI C-Suite" that replaces expensive human consultants with specialized agents and high-powered tools. The core value lies in the "Singularity" class agents—like Roxy for business coaching, Lexi for legal advice, and Echo for marketing strategy—which are designed to provide expert-level guidance immediately. This value is amplified by exclusive "Engines" available in higher tiers, such as "The Strategy Nexus" for strategic debate simulations, "The Compliance Grid" for automated legal documentation, and "The Neural Syndicate" for multi-agent collaboration. The subscription model scales with business needs, offering the Overclock Tier ($19/mo) for essential growth agents and planning tools, while the Singularity Tier ($29/mo) unlocks the full 10-agent team and unlimited capabilities, effectively delivering an entire executive board for a fraction of the cost of traditional consulting.

## Product Experience: The Command Center
- **Immersive HUD:** A high-fidelity, real-time strategic interface with "HUD" style visualizations (Radar, Tickers, Predictive Charts).
- **Proactive Intelligence:** Intelligence feeds that identify market gaps and competitor movements before they become obvious.
- **Reactive Coordination:** Agents trigger workflows and real-time alerts based on live data changes.
- **Agentic Execution:** Seamless transition from strategy to execution via integrated tools (Email, Calendar) with user oversight.

## Technical Implementation Requirements

### 1. Singularity Class Agents (Roxy, Lexi, Echo)
- **Orchestration:** Each agent is a specialized LLM node with distinct system prompts and toolsets.
- **Output Control:** All agent responses MUST be structured JSON, validated against Zod schemas before being presented to the UI.
- **State Management:** Agent conversations are persisted in PostgreSQL via Drizzle ORM with full history versioning.

### 2. The Strategy Nexus (Strategic Debate Engine)
- **Pattern:** Multi-agent orchestration using a finite-state machine (FSM).
- **Logic:** Two or more agents (e.g., "The Optimist" vs. "The Skeptic") engage in a multi-turn debate.
- **Synthesis:** A final "Arbiter" agent synthesizes the debate into a SWOT analysis and actionable risk report.

### 3. The Compliance Grid (Legal & Compliance Engine)
- **Architecture:** RAG (Retrieval-Augmented Generation) pipeline.
- **Vector Store:** Uses pgvector with OpenAI/Cohere embeddings for legal pattern matching.
- **Logic:** Context-aware document generation with verified source citations based on a verified library of legal templates and user-specific business metadata.

### 4. The Neural Syndicate (Collaboration Engine)
- **Pattern:** Blackboard architecture for multi-agent collaboration.
- **Protocol:** Agents share a global state to solve cross-functional problems (e.g., Roxy and Echo collaborating on a business plan update).
- **Communication:** Real-time updates via Socket.IO for live agent collaboration visualization.

### 5. The Productivity Nexus (Execution Hub)
- **Architecture:** Tool-enabled agents with function calling capabilities.
- **Integrations:** Google Calendar for scheduling, Resend for professional communication.
- **Safety:** Mandatory "Human-in-the-loop" approval flow for all sensitive agent actions.

## Production Constraints & Mandates

### 1. Core Engineering & Safety
- **Schema Enforcement:** Zod validation is mandatory for ALL inputs (Client -> Server Actions, API routes, and DB writes).
- **Type Safety:** 100% TypeScript coverage. `any` is strictly prohibited. Zero `type-check` errors in production code.
- **State Persistence:** Database-backed session state management for multi-agent collaboration via `SessionManager`.
- **Real-Time Intelligence:** Gemini 2.0 Flash based strategic insight generation and market-data-driven opportunity scoring.

### 2. Error Handling & Resilience
- **Global Boundaries:** React Error Boundaries at the route level and component level for graceful degradation.
- **Server Resilience:** All Server Actions must return a standardized `{ success: boolean, data?: T, error?: string }` response object.
- **Logging:** Centralized error logging for all agentic failures (e.g., token limits, hallucination detection via self-critique).

### 3. Infrastructure & Scaling
- **Database:** Drizzle ORM + PostgreSQL with transactional integrity for all multi-step agent operations.
- **Payments:** Strict gatekeeping of features via Stripe subscription status checks in middleware and Server Actions.
- **Security:** CSRF protection, input sanitization, and session-based authentication via NextAuth.js with JWT strategy.
