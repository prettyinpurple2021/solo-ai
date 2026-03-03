# Specification: Final Production Hardening & Infrastructure Alignment

## Overview
This track focuses on elevating the SoloSuccess AI codebase to an elite, production-ready state. It mandates a 100% transition to Next.js 16.1 architectural patterns (RSC and Server Actions), centralizes the unified state orchestration in a shared library, and hardens mission-critical infrastructure like authentication, real-time collaboration, and RAG-based intelligence.

## Goals
- **100% Next.js 16.1 Alignment:** Eliminate legacy "tutorial" patterns by refactoring all routes to use React Server Components (RSC) for data fetching and Server Actions for mutations.
- **Centralized Unified State:** Establish a `/lib/shared` directory as the single source of truth for Zod schemas and TypeScript types shared between the Express backend and Next.js frontend.
- **Hardened Infrastructure:** Ensure bulletproof reliability for authentication, database schemas, and real-time Socket.IO communication.
- **Mission-Critical Verification:** Implement E2E tests for revenue protection (Subscription Gate) and core agentic intelligence.

## Functional Requirements
1.  **Tier-Based Feature Gating:**
    - Middleware must intercept requests and validate the user's Stripe subscription status.
    - Features belonging to "Accelerator" ($19/mo) and "Dominator" ($29/mo) tiers must be strictly gated.
2.  **Deterministic Agent Collaboration:**
    - The "Boardroom" orchestration must use Zod-validated Socket.IO events to ensure agents share a consistent, type-safe global state.
3.  **High-Fidelity RAG Retrieval & Grounding:**
    - The AI-Powered Briefcase must utilize server-side RAG flows with `pgvector`.
    - **Grounding Mandate:** All agent responses generated via the Briefcase MUST include source citations to verify data origin.
4.  **Global Error Resilience:**
    - Standardized error response objects `{ success: boolean, data?: T, error?: string }` must be used across all Server Actions and API routes.

## Technical Requirements
1.  **Shared Internal Library:**
    - Directory: `/lib/shared`
    - Content: All shared Zod schemas (agent outputs, socket events) and TS interfaces.
2.  **Next.js Refactor:**
    - Convert all `useEffect` or client-side fetching to RSC.
    - Convert all form submissions and API-based mutations to `'use server'` actions.
3.  **Database & Transaction Audit:**
    - Review Drizzle schemas for strict nullability, proper indexing, and `pgvector` column alignment.
    - **Transaction Mandate:** Wrap all multi-step agentic workflows in Drizzle transactions (`db.transaction()`) to ensure absolute data integrity.
4.  **Socket.IO Security:**
    - Hardened event schemas to prevent "type-mismatch" crashes during multi-agent sessions.
5.  **Environment Security Audit:**
    - Conduct a rigorous audit of all `.env` files. Ensure ZERO sensitive secrets or API keys are exposed via the `NEXT_PUBLIC_` prefix.
6.  **Testing Suite:**
    - Playwright E2E tests for: Subscription Gate, Real-Time Blackboard, and Briefcase RAG logic.

## Acceptance Criteria
- [ ] 100% of existing routes migrated to RSC/Server Actions.
- [ ] `/lib/shared` established and utilized by both Next.js and Express.
- [ ] Middleware successfully gates features based on Stripe status.
- [ ] All multi-step agent workflows utilize database transactions.
- [ ] Agent responses from the Briefcase include verified source citations.
- [ ] Environment variable audit complete with zero secret exposures.
- [ ] Playwright tests for all three mission-critical flows pass in CI.
