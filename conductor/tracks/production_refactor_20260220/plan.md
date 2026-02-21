# Implementation Plan: Production-Ready Refactor

## Phase 1: Project Structure Consolidation
- [x] Task: Consolidate root `app` and `src/app` into unified `src/app` (d5adf3c)
    - [x] Move root `app/` contents to `src/app/`
    - [x] Merge duplicate logic in `src/app/api` and `app/api`, favoring `src/app` architecture
    - [x] Remove empty root directories
- [x] Task: Consolidate components, hooks, and lib into `src/` (d5adf3c)
    - [x] Move root `components/` to `src/components/`
    - [x] Move root `hooks/`, `utils/`, `lib/` to `src/` equivalents
- [ ] Task: Update path aliases and imports
    - [ ] Update `tsconfig.json` paths
    - [ ] Run a global search and replace for relative imports to new aliases
- [ ] Task: Conductor - User Manual Verification 'Project Structure Consolidation' (Protocol in workflow.md)

## Phase 2: Database & Transaction Hardening
- [ ] Task: Schema Audit & RLS Implementation
    - [ ] Write tests for data isolation (RLS)
    - [ ] Audit Drizzle schemas for nullability and indexes
    - [ ] Implement Postgres CHECK constraints
    - [ ] Implement Row Level Security for `users`, `briefcases`, and `tasks`
- [ ] Task: Type Hardening & Transactional Integrity
    - [ ] Fix `any` cast in `server/db/index.ts`
    - [ ] Wrap Signups and Billing operations in `db.transaction()`
- [ ] Task: Conductor - User Manual Verification 'Database & Transaction Hardening' (Protocol in workflow.md)

## Phase 3: Core Type Safety & Build Enforcement
- [ ] Task: Strict TypeScript Enforcement
    - [ ] Enable `strict: true` in `tsconfig.json`
    - [ ] Remove `any` from `src/components/` (78+ instances)
    - [ ] Remove `any` from `src/lib/` and `src/services/`
- [ ] Task: Build Pipeline Hardening
    - [ ] Update `package.json` build scripts to fail on lint/type errors
    - [ ] Verify build fails correctly on a deliberate type error
- [ ] Task: Conductor - User Manual Verification 'Core Type Safety & Build Enforcement' (Protocol in workflow.md)

## Phase 4: API & Server Action Refactor (Zero-Mock)
- [ ] Task: Replace Analytics & Dashboard Mocks
    - [ ] Write integration tests for real analytics data
    - [ ] Replace `app/api/analytics/preview` mocks with real DB queries
    - [ ] Implement real calculations for "active users" and "historical snapshots"
- [ ] Task: Critical Path Zod Validation
    - [ ] Implement Zod validation for Auth routes
    - [ ] Implement Zod validation for Payments/Stripe routes
    - [ ] Implement Zod validation for AI Agent actions
- [ ] Task: Replace all remaining TODOs/Mocks
    - [ ] Iterate through all 150+ identified TODOs and implement real logic
- [ ] Task: Conductor - User Manual Verification 'API & Server Action Refactor' (Protocol in workflow.md)

## Phase 5: Real-time & Express Server Hardening
- [ ] Task: Express Server Scope Reduction & Hardening
    - [ ] Refactor `server/` to remove non-real-time logic
    - [ ] Implement proper Express Request/Response types (remove `as any` from middlewares)
    - [ ] Enforce Zod validation on all Socket.IO event payloads
- [ ] Task: Collaborative Blackboard State Safety
    - [ ] Harden the state synchronization logic between agents in the Express server
- [ ] Task: Conductor - User Manual Verification 'Real-time & Express Server Hardening' (Protocol in workflow.md)

## Phase 6: Final Audit & Verification
- [ ] Task: Environment & Security Audit
    - [ ] Audit all `.env` files for secret leaks
    - [ ] Verify RLS is active and blocking unauthorized cross-user access
- [ ] Task: Playwright E2E Verification
    - [ ] Implement E2E tests for Subscription Gating
    - [ ] Implement E2E tests for the Collaborative Blackboard
- [ ] Task: Conductor - User Manual Verification 'Final Audit & Verification' (Protocol in workflow.md)
