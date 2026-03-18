# Implementation Plan: Deferred Features & V2 Enhancements

## Phase 1: AI & Intelligence Enhancements
- [ ] **Task: Advanced Learning Algorithms**
    - [ ] Update `src/lib/learning-engine.ts` to implement predictive path generation using Gemini 2.5 Pro.
    - [ ] Create tests to verify learning path adaptations.
- [ ] **Task: Historical Competitor Comparison**
    - [ ] Update `competitor_metrics` schema or create a time-series table for competitor snapshots.
    - [ ] Implement UI in Competitor Stalker to view historical trends (delta reporting).
- [ ] **Task: Voice NLP Pipeline**
    - [ ] Create a dedicated server-side endpoint `/api/voice/process` to handle complex NLP using Gemini 2.5 Pro.
    - [ ] Connect `voice-task-creator.tsx` to the new pipeline.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: AI & Intelligence Enhancements' (Protocol in workflow.md)**

## Phase 2: User-Driven Integrations
- [ ] **Task: PayPal Integration Setup**
    - [ ] Add PayPal OAuth flow for users to connect their accounts.
    - [ ] Update `payment_provider_connections` database logic to handle PayPal tokens.
- [ ] **Task: Outlook Calendar Support**
    - [ ] Implement Microsoft OAuth flow in `src/app/api/auth/[...nextauth]/route.ts` or custom endpoints.
    - [ ] Sync focus sessions/tasks with Outlook API.
- [ ] **Task: Global Revenue Aggregation**
    - [ ] Build a unified service to aggregate connected Stripe and PayPal revenues.
    - [ ] Update the Dashboard UI to reflect global revenue metrics.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: User-Driven Integrations' (Protocol in workflow.md)**

## Phase 3: Advanced Infrastructure
- [ ] **Task: Enterprise/Team Schema**
    - [ ] Update database schema to support Organizations/Teams and role-based access control.
    - [ ] Implement team invitation logic.
- [ ] **Task: Advanced File Previews**
    - [ ] Install `react-doc-viewer` or similar library.
    - [ ] Update `file-preview-modal.tsx` to dynamically load the viewer for `.xlsx`, `.pptx`, and `.docx` files.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Advanced Infrastructure' (Protocol in workflow.md)**