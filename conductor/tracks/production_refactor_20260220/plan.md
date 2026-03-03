# Implementation Plan: Production-Ready Refactor

## Phase 1: Project Structure Consolidation [checkpoint: c3b282f]
- [x] Task: Consolidate root `app` and `src/app` into unified `src/app` (d5adf3c)
    - [x] Move root `app/` contents to `src/app/`
    - [x] Merge duplicate logic in `src/app/api` and `app/api`, favoring `src/app` architecture
    - [x] Remove empty root directories
- [x] Task: Consolidate components, hooks, and lib into `src/` (d5adf3c)
    - [x] Move root `components/` to `src/components/`
    - [x] Move root `hooks/`, `utils/`, `lib/` to `src/` equivalents
- [x] Task: Update path aliases and imports (0709d4e)
    - [x] Update `tsconfig.json` paths
    - [x] Run a global search and replace for relative imports to new aliases
- [x] Task: Conductor - User Manual Verification 'Project Structure Consolidation' (Protocol in workflow.md) (c3b282f)

## Phase 2: Database & Transaction Hardening [checkpoint: adbb2ce]
- [x] Task: Schema Audit & RLS Implementation (adbb2ce)
    - [x] Write tests for data isolation (RLS)
    - [x] Audit Drizzle schemas for nullability and indexes
    - [x] Implement Postgres CHECK constraints
    - [x] Implement Row Level Security for `users`, `briefcases`, and `tasks`
- [x] Task: Type Hardening & Transactional Integrity (adbb2ce)
    - [x] Fix `any` cast in `server/db/index.ts`
    - [x] Wrap Signups and Billing operations in `db.transaction()`
- [x] Task: Conductor - User Manual Verification 'Database & Transaction Hardening' (Protocol in workflow.md) (adbb2ce)

## Phase 3: Core Type Safety & Build Enforcement [checkpoint: b0f6575]
- [x] Task: Strict TypeScript Enforcement (b0f6575)
    - [x] Enable `strict: true` in `tsconfig.json`
    - [x] Remove `any` from `src/components/` (78+ instances)
    - [x] Remove `any` from `src/lib/` and `src/services/`
- [x] Task: Build Pipeline Hardening (b0f6575)
    - [x] Update `package.json` build scripts to fail on lint/type errors
    - [x] Verify build fails correctly on a deliberate type error
- [x] Task: Conductor - User Manual Verification 'Core Type Safety & Build Enforcement' (Protocol in workflow.md) (b0f6575)

## Phase 4: API & Server Action Refactor (Zero-Mock) [checkpoint: 68d639f]
- [x] Task: Replace Analytics & Dashboard Mocks (68d639f)
    - [x] Write integration tests for real analytics data
    - [x] Replace `app/api/analytics/preview` mocks with real DB queries
    - [x] Implement real calculations for "active users" and "historical snapshots"
- [x] Task: Implement 'Aura' User-Facing Agent Logic (68d639f)
    - [x] Define Aura's specialized system prompt and toolset
    - [x] Implement production-ready orchestration for Aura sessions
    - [x] Ensure Aura conversation persistence in Neon
- [x] Task: Critical Path Zod Validation (68d639f)
    - [x] Implement Zod validation for Auth routes
    - [x] Implement Zod validation for Payments/Stripe routes
    - [x] Implement Zod validation for AI Agent actions
- [x] Task: Replace all remaining TODOs/Mocks (68d639f)
    - [x] Iterate through all 150+ identified TODOs and implement real logic
- [x] Task: Conductor - User Manual Verification 'API & Server Action Refactor' (Protocol in workflow.md) (68d639f)

## Phase 5: Real-time & Express Server Hardening [checkpoint: 2ed7a8d]
- [x] Task: Express Server Scope Reduction & Hardening (2ed7a8d)
    - [x] Refactor `server/` to remove non-real-time logic
    - [x] Implement proper Express Request/Response types (remove `as any` from middlewares)
    - [x] Enforce Zod validation on all Socket.IO event payloads
- [x] Task: Collaborative Blackboard State Safety (2ed7a8d)
    - [x] Harden the state synchronization logic between agents in the Express server
- [x] Task: Conductor - User Manual Verification 'Real-time & Express Server Hardening' (Protocol in workflow.md) (2ed7a8d)

## Phase 6: Final Audit & Verification [checkpoint: complete]
- [x] Task: Environment & Security Audit (68d639f)
    - [x] Audit all `.env` files for secret leaks
    - [x] Verify RLS is active and blocking unauthorized cross-user access
- [x] Task: Playwright E2E Verification (68d639f)
    - [x] Implement E2E tests for Subscription Gating
    - [x] Implement E2E tests for the Collaborative Blackboard
- [x] Task: Conductor - User Manual Verification 'Final Audit & Verification' (Protocol in workflow.md) (complete)

## Phase: Review Fixes
- [~] Task: Apply review suggestions
