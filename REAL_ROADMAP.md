# 🗺️  INTERNAL DEVELOPER ROADMAP (REAL)

## � CRITICAL PATH (Launch Blockers)

### 1. 🛑 Technical Debt & Fakes Cleanup (IMMEDIATE)
- [ ] **Revive AI Agents**: Fix `message-router.ts` where `processAgentResponse` is dead code.
- [ ] **Real Intelligence**: Replace hardcoded scoring in `opportunity-recommendation-system.ts`.
- [ ] **Session State**: Implement `getSessionState` and session restoration logic in `session-manager.ts`.
- [ ] **Subscription Enforcement**: Sync `stripe.ts` limits with `subscription-utils.ts`.

### 2. 💳 Stripe & Subscription Integrity
- [ ] **Sync Tier Limits**: Ensure `stripe.ts` reflects:
    - Free: 10 msgs/day, 2 agents (Aura + ?), 50MB storage.
    - Accelerator: 100 msgs/day, 8 agents, 1GB storage.
    - Dominator: Unlimited msgs, All agents, 10GB storage.
- [ ] **Webhook Verification**: Test `customer.subscription.updated` handling.

### 3. 🧠 AI & Backend Integration
- [ ] Connect `TacticalRoadmap.tsx` to `geminiService` (currently hardcoded).
- [ ] Verify `server/routes/ai.ts` endpoint reachability.

### 4. 🛡️ Type Safety & Build
- [ ] Run `npm run type-check` and resolve all errors.
- [ ] Verify build with `npm run build`.

---

## � PHASE 2 (Post-Launch)
- [ ] PayPal Integration
- [ ] Advanced Learning Algorithms
- [ ] Global Revenue Aggregation
