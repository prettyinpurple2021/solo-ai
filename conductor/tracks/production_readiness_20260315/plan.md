# Implementation Plan: Production Readiness Final Sweep

## Phase 1: Hardcoded Value Elimination (Critical Blockers)
- [ ] **Task: Dashboard Subscription Tier Lookup**
    - [ ] Write tests for real tier lookup in `server/routes/dashboard.ts`
    - [ ] Implement DB query to replace `subscription_tier: 'free'`
- [ ] **Task: Real AI Insights Generation**
    - [ ] Write tests for `insights` generation in `server/routes/ai.ts`
    - [ ] Implement actual AI insight logic using Gemini/OpenAI
- [ ] **Task: Persistent Session Tracking**
    - [ ] Write tests for persistent session store in `src/middleware.ts`
    - [ ] Replace in-memory tracking with Redis/DB store
- [ ] **Task: Secure JWT & Environment Key Injection**
    - [ ] Implement production JWT generation in `src/lib/auth-utils.ts`
    - [ ] Replace "demo" ReCAPTCHA keys with `process.env` references
- [ ] **Task: Agent Response Activation**
    - [ ] Write tests for `message-router.ts` response handling
    - [ ] Connect `processAgentResponse` logic to the chat interface
- [ ] **Task: Conductor - User Manual Verification 'Hardcoded Value Elimination' (Protocol in workflow.md)**

## Phase 2: Core Logic Implementation (High Priority)
- [ ] **Task: Real-World Opportunity Scoring**
    - [ ] Write tests for market-data-driven scoring in `opportunity-recommendation-system.ts`
    - [ ] Implement actual scoring logic based on user profile and market data
- [ ] **Task: DB-Backed Session State**
    - [ ] Write tests for DB lookup in `src/lib/session-manager.ts`
    - [ ] Implement database lookup for session state persistence
- [ ] **Task: Revenue Tracking Finalization**
    - [ ] Write tests for revenue calculation logic in `src/lib/revenue-tracking.ts`
    - [ ] Implement actual revenue calculation logic
- [ ] **Task: AI-Powered Learning Assessments**
    - [ ] Write tests for real assessment generation in `src/lib/learning-engine.ts`
    - [ ] Connect learning assessments to real-time AI generation
- [ ] **Task: Conductor - User Manual Verification 'Core Logic Implementation' (Protocol in workflow.md)**

## Phase 3: Payment & Subscription Consistency
- [ ] **Task: Stripe Limit Synchronization**
    - [ ] Write tests for limit consistency across `stripe.ts` and `subscription-utils.ts`
    - [ ] Synchronize and enforce tier-based messaging and storage limits
- [ ] **Task: Webhook Verification & Completion**
    - [ ] Write integration tests for Stripe webhooks (upgrade, downgrade, failure)
    - [ ] Finalize and verify handling for all lifecycle events (deletion, access revocation)
- [ ] **Task: Conductor - User Manual Verification 'Payment & Subscription Consistency' (Protocol in workflow.md)**

## Phase 4: Final Polishing & Launch Readiness
- [ ] **Task: Global Type Safety Enforcement**
    - [ ] Resolve all errors reported by `npm run type-check`
- [ ] **Task: UI/UX State Polish**
    - [ ] Implement standardized loading skeletons and empty states for all AI features
    - [ ] Conduct mobile responsiveness sweep and fix UI regressions
- [ ] **Task: Code Duplicate & Mock Audit**
    - [ ] Audit and remove redundant/duplicate code identified in the initial description
    - [ ] Perform final sweep for any remaining "mock" or "todo" comments
- [ ] **Task: Conductor - User Manual Verification 'Final Polishing & Launch Readiness' (Protocol in workflow.md)**