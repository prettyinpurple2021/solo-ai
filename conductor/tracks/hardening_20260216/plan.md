# Implementation Plan: Final Production Hardening & Infrastructure Alignment

## Phase 1: Shared Internal Library Foundation [checkpoint: 8b84fcd]
- [x] Task: Initialize `/lib/shared` directory and build configuration (4dd280f)
    - [x] Create `/lib/shared` directory
    - [x] Set up `tsconfig.json` or path aliases for cross-project imports (Next.js & Express)
- [x] Task: Define Core Shared Schemas (4dd280f)
    - [x] Implement Zod schemas for Dominator Agent outputs
    - [x] Implement Zod schemas for Socket.IO "Boardroom" events
    - [x] Implement standardized Server Response interfaces
- [x] Task: Conductor - User Manual Verification 'Shared Internal Library Foundation' (Protocol in workflow.md)

## Phase 2: Database & Transaction Hardening [COMPLETED]
- [x] Task: Drizzle Schema Audit & Refactor
    - [x] Audit all schemas for strict nullability and indexing
    - [x] Ensure `pgvector` alignment for Briefcase RAG
- [x] Task: Implement Transactional Orchestration
    - [x] Refactor multi-step agent workflows to use `db.transaction()`
- [x] Task: Conductor - User Manual Verification 'Database & Transaction Hardening' (Protocol in workflow.md)

## Phase 3: Next.js 16.1 Architecture Migration [IN PROGRESS]
- [~] Task: RSC Data Fetching Migration
    - [x] Refactor Dashboard, Templates, Competitors, Briefcase, and Slaylist to use RSC
    - [x] Refactor Nexus and Collaboration to use RSC
    - [~] Refactor War Room to use RSC
    - [ ] Complete remaining routes (Intelligence details, Workflow builder)
- [~] Task: Server Actions Migration
    - [x] Implement Profile, Template, and Task Server Actions
    - [x] Implement Community and Collaboration Server Actions
    - [x] Integrate Actions into Client Components
    - [ ] Complete remaining mutations
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
