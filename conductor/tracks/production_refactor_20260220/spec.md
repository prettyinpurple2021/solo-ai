# Specification: Production-Ready Refactor & Architectural Consolidation

**Track ID:** `production_refactor_20260220`
**Type:** Refactor / Core Infrastructure

## 1. Overview
SoloSuccess AI is currently in a "feature-complete but technically fragmented" state. This track focuses on the comprehensive refactor required to transition the codebase from a technical-debt-heavy prototype to a production-hardened, type-safe, and architecturally unified application. We will eliminate all mocks, enforce strict TypeScript standards, and consolidate the project structure under a modern Next.js 16.1 architecture.

## 2. Structural Consolidation
* **Unify under `src/`**: All source code will be moved into a unified `src/` directory.
    * `/app` -> `/src/app` (Merging with existing `/src/app`).
    * `/components` -> `/src/components`.
    * `/lib`, `/hooks`, `/utils` -> `/src/lib`, `/src/hooks`, `/src/utils`.
* **API Merging**: Root `app/api` logic will be migrated into the `/src/app/api` architecture. Architectural patterns from `src/app/api` (React 19 / Next.js 16 compliant) will be used as the template, while feature-rich logic from root `app/api` will be integrated.
* **Express Server ("Engine Room") Scope**: The standalone Node/Express server will be narrowed exclusively to real-time orchestration (Socket.IO), the **Collaborative Blackboard** pattern, **Inter-Agent Communication**, and caching. This persistent Node process is required for stateful multi-agent interactions.
* **Next.js Integration**: All user-facing API logic, primary data-fetching, and business logic will be moved to Next.js API Routes or Server Actions for better integration with the React 19 ecosystem.

## 3. Production Quality & "Zero-Mock" Policy
* **Eliminate Placeholders**: All 150+ TODOs, FIXMEs, and hardcoded "for now" mocks identified in the audit will be replaced with real, production-ready logic.
* **Analytics & Data**: Replace all mock analytics snapshots and "70% active users" assumptions with real database-driven calculations.
* **Type Safety (Strict & Immediate)**:
    * Enable `strict: true` in `tsconfig.json`.
    * Zero-`any` policy: Remove all 78+ `any` type casts in components and 100+ instances in the server logic.
    * Implement proper Express types in the server routes to eliminate `as any` casting of middlewares.
* **Zero Tolerance Build**: Update the build pipeline to fail immediately on any linting or type-check errors.

## 4. Database & Transaction Hardening
* **Drizzle Schema Audit**: Audit all schemas for nullability, proper indexing, and `pgvector` alignment.
* **Row Level Security (RLS)**: Move data isolation to the database level for `users`, `briefcases`, and `tasks`.
* **CHECK Constraints**: Implement physical Postgres-level constraints (e.g., `xp >= 0`, `level > 0`).
* **Transactional Integrity**: All multi-step operations (Signups, Billing, AI Agents) must be wrapped in `db.transaction()`.
* **Mandatory Migrations**: Enforce schema changes through strictly managed Drizzle migrations (no `db:push` in production).

## 5. Security & Validation
* **Zod Everywhere**: Implement mandatory Zod validation for all Server Actions and API routes, prioritizing Auth, Payments, and AI paths.
* **Input Sanitization**: Ensure all `req.body` and `params` are validated before processing.
* **Environment Security**: Audit `.env` files to ensure zero sensitive keys are exposed via `NEXT_PUBLIC_`.

## 6. Acceptance Criteria
* [ ] Project structure unified under `/src/` with no duplicate `app` directories.
* [ ] Build passes with `strict: true` and zero lint/type errors.
* [ ] All TODO/Mock/Placeholder comments removed and replaced with real logic.
* [ ] Database schema audits complete with RLS and CHECK constraints implemented.
* [ ] Zod validation implemented for all critical paths.
* [ ] Express server scope successfully narrowed and type-hardened.

## 7. Out of Scope
* New feature development (focus is purely on refactoring existing features).
* V2 Roadmap items (PayPal integration, Advanced Multi-Modal training).
