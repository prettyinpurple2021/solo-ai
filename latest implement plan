# Implementation Plan for Deferred Features

This plan addresses all requested functionality that was previously marked as "deferred," "stubbed," "TODO," or "V2" to ensure immediate production-readiness.

## User Review Required
> [!IMPORTANT]
> **API Implementation for 2FA / TOTP**: The current [src/lib/auth-client.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts) has stubs for [verifyTOTP](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts#85-87) and [resend2FACode](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts#87-88). To fully implement these, we will map them to `/api/auth/totp/*`. I plan to implement these backend API routes. Please confirm if there is a specific TOTP provider/library (`otplib`, `@stackframe/stack` integration, etc.) you want used on the backend.
> 
> **Redis Syncing**: I will use `@upstash/redis` to persist collaboration sessions in [CollaborationHub](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/collaboration-hub.ts#85-623) as requested by the V2 comment. Please confirm you have `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your environment.

## Proposed Changes

### Subscription Hook
*   Changes to resolve the manual inference of `billingCycle` and `cancelAtPeriodEnd` flags.

#### [MODIFY] [use-subscription.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/hooks/use-subscription.ts)
- Replace `billingCycle: 'monthly', // TODO: Infer from price interval if needed` with `billingCycle: subData.interval || 'monthly'`
- Replace `cancelAtPeriodEnd: false // TODO: Backend should return this flag` with `cancelAtPeriodEnd: !!subData.cancelAtPeriodEnd`

---

### Authentication Client & API
*   Full implementation of the 2FA methods without placeholders.

#### [MODIFY] [auth-client.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts)
- Implement [verifyTOTP](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts#85-87) to call `POST /api/auth/totp/verify` instead of returning a stub response.
- Implement [resend2FACode](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/auth-client.ts#87-88) to call `POST /api/auth/totp/resend`.

#### [NEW] API Routes for TOTP (e.g. `src/app/api/auth/totp/verify/route.ts`)
- Implement the actual backend validation logic to support the auth client using standard Next.js 16.1 App Router API routes.

---

### Server Polyfills
*   Completing the [File](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/server-polyfills.ts#13-55) polyfill.

#### [MODIFY] [server-polyfills.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/server-polyfills.ts)
- Implement standard Web Streams `ReadableStream` instead of throwing an error for [stream()](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/server-polyfills.ts#50-54).

---

### Blaze Growth Intelligence
*   Removing arbitrary disablements of core logic.

#### [MODIFY] [blaze-growth-intelligence.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/blaze-growth-intelligence.ts)
- Remove `// TEMPORARILY DISABLED` comments.
- Verify and fully enable the AI methods so they run in production without fallback responses.

---

### V2 Architecture Features
*   Implementing immediate solutions for V2-marked stubs.

#### [MODIFY] [competitor-enrichment-service.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/competitor-enrichment-service.ts)
- Replace static personnel extraction heuristic for `"Full DOM parsing deferred to specialized microservice (V2)"` with robust `generateText` DOM parsing using the AI model to guarantee accuracy in V1.

#### [MODIFY] [agent-collaboration.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/agent-collaboration.ts)
- Uncomment and implement `toConfig = getTeamMemberConfig(toAgent)` logic for handoffs.

#### [MODIFY] [collaboration-hub.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/collaboration-hub.ts)
- Implement the V2 optimization: "Keep sessions in-memory for low-latency, syncing to Redis periodically". Use Upstash Redis for session state persistence across instances.

#### [MODIFY] [schema/gamification.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/lib/shared/db/schema/gamification.ts)
- Define `market_victories` table.

#### [MODIFY] [api/competitive-intelligence/gamification/route.ts](file:///c:/Users/prett/Documents/SoloSuccess-AI/src/app/api/competitive-intelligence/gamification/route.ts)
- Remove the V1 placeholder comment.
- Implement the `unlock_achievement` and `record_victory` actions to properly insert rows into the `user_achievements` and `market_victories` tables.

## Verification Plan

### Automated Tests
- Run `npm run type-check` to secure TypeScript integrity.
- Run `npm run lint` for coding standard verification.

### Manual Verification
- View a user's subscription state to confirm `billingCycle` and `cancelAtPeriodEnd` reflect accurate backend properties.
- Test the 2FA flows through `/login` to trigger the actual TOTP endpoint.
- Verify Redis cache updates when initiating or updating a Collaboration session.
