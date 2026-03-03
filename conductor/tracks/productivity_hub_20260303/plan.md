# Implementation Plan: Autonomous Productivity Hub

## Phase 1: Tool Use Infrastructure
- [ ] Task: Define Agent Tool Registry and Schema
    - Define Zod schemas for all tool inputs
    - Implement a centralized registry for available agent capabilities
- [ ] Task: Refactor AI Router for Function Calling
    - Update `src/app/api/chat/route.ts` to support Vercel AI SDK tool calling or manual tool selection
    - Implement tool selection logic based on agent personality and user request

## Phase 2: Integration Hardening (Email & Communication)
- [ ] Task: Implement Resend Service
    - Create `src/lib/services/email-service.ts` using Resend
    - Implement `sendEmail` tool for agents
- [ ] Task: Human-in-the-Loop Approval System
    - Create `agent_actions` table in DB to track pending and executed actions
    - Implement UI component for action approval/rejection

## Phase 3: Scheduling & Calendar Automation
- [ ] Task: Hardened Google Calendar Service
    - Refactor existing Google integration into a production-ready service
    - Implement `getSchedule` and `createEvent` tools
- [ ] Task: Conflict Resolution Logic
    - Enable agents to suggest alternate times based on calendar availability

## Phase 4: Execution HUD & Dashboard
- [ ] Task: Execution Log UI
    - Implement a real-time log of agent actions in the dashboard
- [ ] Task: Immersive UI Feedback
    - Add animations and state indicators for "Executing Tool..." states

## Phase 5: Final Verification
- [ ] Task: E2E Integration Testing
    - Playwright tests for full agent-to-execution flows
- [ ] Task: Conductor - User Manual Verification 'Autonomous Productivity Hub' (Protocol in workflow.md)
