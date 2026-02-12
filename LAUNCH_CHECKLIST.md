# 🚀 LANCH READINESS CHECKLIST

## 🛑 RELEASE BLOCKERS (MUST FIX)

### 🚨 HARDCODED VALUE & MOCK AUDIT (COMPREHENSIVE)
*The following items were identified via exhaustice codebase scan and MUST be resolved.*

| Priority | File | Issue | Remediation |
|----------|------|-------|-------------|
| 🔴 **CRITICAL** | `server/routes/dashboard.ts` (Line 87) | **Hardcoded Subscription Tier**: `subscription_tier: 'free'` | **MUST FIX**: Query the `users` table to get real tier. Paying users currently get Free tier. |
| 🔴 **CRITICAL** | `server/routes/ai.ts` (Line 351) | **Empty AI Insights**: `insights: []` | Implement actual AI insight generation or remove feature. |
| 🔴 **CRITICAL** | `src/middleware.ts` (Line 4) | **Demo Session Tracking**: "Simple in-memory session tracking for demo/dev" | Verify if cookie-based approach is sufficient for V1 or Replace with Redis/DB session store. |
| 🔴 **CRITICAL** | `src/lib/auth-utils.ts` (Line 55) | **Security Risk**: `createToken` returns `"mock-token"` | Delete this function or implement real JWT generation. |
| 🔴 **CRITICAL** | `src/lib/recaptcha.ts` (Lines 12, 163) | **Security Risk**: Uses `"demo"` keys | Replace with `process.env.RECAPTCHA_SITE_KEY`. |
| 🔴 **CRITICAL** | `src/lib/message-router.ts` | **Dead Code**: `processAgentResponse` is unused. | Connect this logic to the chat interface; currently agents do not reply. |
| 🟠 High | `src/lib/opportunity-recommendation-system.ts` | **Fake Intelligence**: Hardcoded scoring (returns 7, 8, 6, etc.) | Implement real scoring logic based on market data/user profile. |
| 🟠 High | `src/lib/session-manager.ts` | **Broken State**: `getSessionState` returns `null` | Implement database lookup for session state. |
| 🟠 High | `src/lib/revenue-tracking.ts` | **Missing Features**: logic is placeholder/todo | Implement specific revenue calculation logic. |
| 🟠 High | `src/lib/learning-engine.ts` | **Fake Assessment**: `createSkillAssessment` returns mock | Connect to AI generation for real assessments. |
| 🟡 Medium | `src/lib/auth.ts` (Line 17) | **Build Fallback**: Uses mock adapter if DB fails | Acceptable for build, but ensure monitoring alerts if this triggers in prod. |
| 🟡 Medium | `server/routes/dashboard.ts` (Line 37) | **Logic Gap**: Missing `dueDate` assumes all tasks active | Add `dueDate` to schema or update logic. |
| 🟡 Medium | `src/lib/analytics.ts` (Line 157) | **Todo**: "Implement session tracking middleware" | Implement or remove Todo if `middleware.ts` covers this. |
| 🟡 Medium | `src/lib/social-media-monitor.ts` | **Cleanup**: Comments about "Removed mock data" | Verify real API integration is functioning. |

### 💳 Payments & Subscriptions
- [ ] **SYNC LIMITS**: `src/lib/stripe.ts` limits DO NOT MATCH `src/lib/subscription-utils.ts`.
    - *Action:* Update `stripe.ts` to reflect the strict tiering (Free: 10 msgs, Accelerator: 100 msgs, Dominator: Unlimited).
- [ ] **WEBHOOKS**: Verify `server/routes/stripe.ts` handles:
    - `customer.subscription.updated` (tier changes)
    - `customer.subscription.deleted` (access revocation)
    - `invoice.payment_failed` (grace period/lockout)

### 🧠 AI & Backend
- [ ] **Environment Variables**:
    - [ ] `GEMINI_API_KEY`: Verify it is set in production.
    - [ ] `GOOGLE_CLIENT_ID`: Verify for auth.
- [ ] **AI Routes**: Verify `server/routes/ai.ts` is actually reachable from the frontend (CORS/Proxy check).

### 🛠 Type Safety
- [ ] **Strict Mode**: Run `npm run type-check` and fix ALL errors. *Current state: Likely failing.*

## 🟡 FUNCTIONAL VERIFICATION (Manual Test)

### 1. The "Free Tier" Trap
- [ ] Create a new account.
- [ ] send 10 messages to Aura.
- [ ] **VERIFY:** 11th message fails with "Upgrade Required".

### 2. The "Accelerator" Upgrade
- [ ] Upgrade to Accelerator (Test Mode Stripe).
- [ ] **VERIFY:** Access to Blaze, Glitch, Vex unlocked.
- [ ] **VERIFY:** Chat limit increases to 100.
- [ ] **VERIFY:** Storage limit shows 1GB.

### 3. The "Dominator" Power
- [ ] Upgrade to Dominator.
- [ ] **VERIFY:** Access to ALL agents (Roxy, Lexi, Nova, etc.).
- [ ] **VERIFY:** Chat is unlimited.
- [ ] **VERIFY:** Access to "War Room" and "Competitor Stalker".

## 🟢 UI/UX POLISH
- [ ] **Empty States**: Verify "The Briefcase" and "The War Room" look good with 0 data.
- [ ] **Loading States**: Verify skeletons/spinners on AI generation.
- [ ] **Mobile**: Basic responsiveness check on Dashboard.

## 📝 POST-LAUNCH
- [ ] PayPal Integration (Deferred)
- [ ] Advanced Learning Algorithms (Deferred)