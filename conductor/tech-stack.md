# Technology Stack: SoloSuccess AI

## Core Infrastructure
- **Frontend Framework:** Next.js 16.1 (App Router) for high-performance, server-first rendering.
- **Backend Runtime:** Node.js with Express.js for specialized API handling and orchestration.
- **Real-Time Layer:** Socket.IO for sub-second, bidirectional agent collaboration visualization.
- **Language:** TypeScript (Mandatory 100% coverage, `any` strictly prohibited).

## Database & Persistence
- **ORM:** Drizzle ORM for type-safe, performant SQL interactions.
- **Primary Database:** PostgreSQL (Managed, with strict transactional integrity).
- **Vector Intelligence:** `pgvector` for RAG-based document retrieval and pattern matching.
- **Caching/Queue (Optional/Planned):** Upstash Redis for high-speed state persistence and queueing.

## AI & Orchestration
- **Model SDKs:** `openai`, `anthropic`, and `instructor` / `langchain` for structured JSON output.
- **Validation:** `Zod` for mandatory schema enforcement across all AI-to-System boundaries.
- **Pattern:** Custom Multi-Agent Orchestration (FSM and Blackboard patterns).

## Authentication & Security
- **Auth Provider:** `NextAuth.js` (Auth.js v5) for production-grade identity management.
- **Security Logic:** `jose` for secure JWT handling and strict CSRF/Input sanitization.
- **Compliance:** Automated auditing via "Guardian AI" integration layer.

## UI/UX Engineering
- **Styling:** Tailwind CSS with a "Command Center" utility-first approach.
- **Component Library:** `shadcn/ui` for high-fidelity, accessible UI elements.
- **Animations:** `Framer Motion` for smooth, low-latency interface transitions.

## Production Standards (Architect's Enforcement)
- **Structured Outputs:** Mandatory use of OpenAI Structured Outputs or Anthropic Tool Use with Zod schema parsing. Raw string agent responses are PROHIBITED.
- **Next.js 16.1 Patterns:** ALL database mutations must use `'use server'` Server Actions. Initial data fetching MUST use React Server Components (RSC) to minimize client bundle size.
- **Feature Gating:** All 'Accelerator' and 'Dominator' tier features must be protected by Middleware-level permission checks, shared Zod schema validation, and Stripe subscription status validation.
- **Resilience:** Route-level and Component-level Error Boundaries with standardized server-side response patterns.
- **Testing:** Production-ready unit and integration tests using Jest and Playwright.
