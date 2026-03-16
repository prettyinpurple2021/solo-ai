# 🚀 LANCH READINESS CHECKLIST

## 🛑 RELEASE BLOCKERS (MUST FIX)

### 🚨 HARDCODED VALUE & MOCK AUDIT (COMPREHENSIVE)

*The following items were identified via exhaustice codebase scan and MUST be resolved.*

| Priority | File | Issue | Remediation | Status |
| ---------- | ------ | ------- | ------------- | -------- |
| 🔴 **CRITICAL** | `server/routes/dashboard.ts` (Line 87) | **Hardcoded Subscription Tier**: `subscription_tier: 'free'` | **MUST FIX**: Query the `users` table to get real tier. Paying users currently get Free tier. | ✅ FIXED |
| 🔴 **CRITICAL** | `server/routes/ai.ts` (Line 351) | **Empty AI Insights**: `insights: []` | Implement actual AI insight generation or remove feature. | ✅ FIXED |
| 🔴 **CRITICAL** | `src/middleware.ts` (Line 4) | **Demo Session Tracking**: "Simple in-memory session tracking for demo/dev" | Verify if cookie-based approach is sufficient for V1 or Replace with Redis/DB session store. | ✅ FIXED |
| 🔴 **CRITICAL** | `src/lib/auth-utils.ts` (Line 55) | **Security Risk**: `createToken` returns `"mock-token"` | Delete this function or implement real JWT generation. | ✅ FIXED |
| 🔴 **CRITICAL** | `src/lib/recaptcha.ts` (Lines 12, 163) | **Security Risk**: Uses `"demo"` keys | Replace with `process.env.RECAPTCHA_SITE_KEY`. | ✅ FIXED |
| 🔴 **CRITICAL** | `src/lib/message-router.ts` | **Dead Code**: `processAgentResponse` is unused. | Connect this logic to the chat interface; currently agents do reply. | ✅ FIXED |
| 🟠 High | `src/lib/opportunity-recommendation-system.ts` | **Fake Intelligence**: Hardcoded scoring (returns 7, 8, 6, etc.) | Implement real scoring logic based on market data/user profile. | ✅ FIXED |
| 🟠 High | `src/lib/session-manager.ts` | **Broken State**: `getSessionState` returns `null` | Implement database lookup for session state. | ✅ FIXED |
| 🟠 High | `src/lib/revenue-tracking.ts` | **Missing Features**: logic is placeholder/todo | Implement specific revenue calculation logic. | ✅ FIXED |
| 🟠 High | `src/lib/learning-engine.ts` | **Fake Assessment**: `createSkillAssessment` returns mock | Connect to AI generation for real assessments. | ✅ FIXED |
| 🟡 Medium | `src/lib/auth.ts` (Line 17) | **Build Fallback**: Uses mock adapter if DB fails | Acceptable for build, but ensure monitoring alerts if this triggers in prod. | ✅ HARDENED |
| 🟡 Medium | `server/routes/dashboard.ts` (Line 37) | **Logic Gap**: Missing `dueDate` assumes all tasks active | Add `dueDate` to schema or update logic. | ✅ FIXED |
| 🟡 Medium | `src/lib/analytics.ts` (Line 157) | **Todo**: "Implement session tracking middleware" | Implement or remove Todo if `middleware.ts` covers this. | ✅ FIXED |
| 🟡 Medium | `src/lib/social-media-monitor.ts` | **Cleanup**: Comments about "Removed mock data" | Verify real API integration is functioning. | ✅ VERIFIED |

### 💳 Payments & Subscriptions

- [x] **SYNC LIMITS**: `src/lib/stripe.ts` limits DO NOT MATCH `src/lib/subscription-utils.ts`.
  - *Action:* Updated `stripe.ts` and server configs to reflect strict tiering.
- [x] **WEBHOOKS**: Verify `server/routes/stripe.ts` or `src/app/api/webhooks/stripe/route.ts` handles:
  - `customer.subscription.updated` (tier changes)
  - `customer.subscription.deleted` (access revocation)
  - `invoice.payment_failed` (grace period/lockout)

### 🧠 AI & Backend

- [x] **Environment Variables**:
  - [x] `GEMINI_API_KEY`: Verified usage in production code.
  - [x] `GOOGLE_CLIENT_ID`: Verified for auth.
- [x] **AI Routes**: Verified `server/routes/ai.ts` is reachable and standardized on Gemini 2.5 Pro.

### 🛠 Type Safety

- [x] **Strict Mode**: `npm run type-check` passed with zero errors.

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

- [x] **Empty States**: Verified "The Briefcase" and "The War Room" look good with 0 data.
- [x] **Loading States**: Verified skeletons/spinners on AI generation.
- [x] **Mobile**: Basic responsiveness check on Dashboard.

## 📝 POST-LAUNCH

- [ ] PayPal Integration (Deferred)
- [ ] Advanced Learning Algorithms (Deferred)
