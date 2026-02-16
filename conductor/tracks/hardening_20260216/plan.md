# Implementation Plan: Final Production Hardening & Infrastructure Alignment

## Phase 1: Shared Internal Library Foundation
- [ ] Task: Initialize `/lib/shared` directory and build configuration
    - [ ] Create `/lib/shared` directory
    - [ ] Set up `tsconfig.json` or path aliases for cross-project imports (Next.js & Express)
- [ ] Task: Define Core Shared Schemas
    - [ ] Implement Zod schemas for Dominator Agent outputs
    - [ ] Implement Zod schemas for Socket.IO "Boardroom" events
    - [ ] Implement standardized Server Response interfaces
- [ ] Task: Conductor - User Manual Verification 'Shared Internal Library Foundation' (Protocol in workflow.md)

## Phase 2: Database & Transaction Hardening
- [ ] Task: Drizzle Schema Audit & Refactor
    - [ ] Audit all schemas for strict nullability and indexing
    - [ ] Ensure `pgvector` alignment for Briefcase RAG
- [ ] Task: Implement Transactional Orchestration
    - [ ] Refactor multi-step agent workflows to use `db.transaction()`
- [ ] Task: Conductor - User Manual Verification 'Database & Transaction Hardening' (Protocol in workflow.md)

## Phase 3: Next.js 16.1 Architecture Migration
- [ ] Task: RSC Data Fetching Migration
    - [ ] Refactor existing routes to use React Server Components for data fetching
- [ ] Task: Server Actions Migration
    - [ ] Convert client-side mutations/API calls to `'use server'` actions
    - [ ] Implement standardized error handling in all Server Actions
- [ ] Task: Conductor - User Manual Verification 'Next.js 16.1 Architecture Migration' (Protocol in workflow.md)

## Phase 4: Authentication & Feature Gating
- [ ] Task: Stripe-Based Feature Gating
    - [ ] Implement Middleware for Stripe subscription validation
    - [ ] Apply tier-based gating for Accelerator and Dominator features
- [ ] Task: Conductor - User Manual Verification 'Authentication & Feature Gating' (Protocol in workflow.md)

## Phase 5: RAG & Real-Time Intelligence Hardening
- [ ] Task: Briefcase RAG Grounding
    - [ ] Update Briefcase RAG logic to include source citations in agent responses
- [ ] Task: Socket.IO Zod Integration
    - [ ] Integrate shared Zod schemas into the Express Socket.IO event handlers
- [ ] Task: Conductor - User Manual Verification 'RAG & Real-Time Intelligence Hardening' (Protocol in workflow.md)

## Phase 6: Final Audit & Verification
- [ ] Task: Environment Security Audit
    - [ ] Audit `.env` files for `NEXT_PUBLIC_` exposures
- [ ] Task: Playwright E2E Test Suite
    - [ ] Implement E2E tests for Subscription Gate
    - [ ] Implement E2E tests for Real-Time Blackboard
    - [ ] Implement E2E tests for Briefcase RAG logic
- [ ] Task: Conductor - User Manual Verification 'Final Audit & Verification' (Protocol in workflow.md)
