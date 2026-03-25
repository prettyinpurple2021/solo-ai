# Launch checklist

**Authoritative status:** Use **[docs/reports/PRODUCTION_REMEDIATION_TRACKER.md](docs/reports/PRODUCTION_REMEDIATION_TRACKER.md)** for scores, DONE/OPEN items, and verification commands. This file is a **human pre-flight list** only.

---

## Before each public release

1. **Quality gates (local or CI)**  
   - `npm run validate`  
   - `npm test -- --runInBand`  
   - For risky UI/API changes: `npm run build` (or rely on Vercel’s production build on preview/production).

2. **Deploy & env**  
   - Confirm **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)** — no missing secrets; `NEXT_PUBLIC_*` only on Vercel; DB/JWT/Stripe server secrets on the correct host(s).  
   - Optional: `npm run verify:deployment-alignment` (and Railway `GET /api/health` if applicable).

3. **Smoke test in production or preview**  
   - Sign up / login, one gated dashboard route, one paid or Stripe-adjacent flow if billing changed.  
   - Railway/API health if the Express API is in the path for that release.

4. **Dependencies**  
   - `npm audit --omit=dev` — expect known transitive advisories (see tracker **Known non-blocking residuals**); no critical/high regressions.

---

## Product / business verification (not fully automated)

These are **worth checking** before launch; they are **not** the same as “file X is missing.”

| Topic | What to verify | Notes |
|--------|----------------|--------|
| Subscription vs Stripe | User `subscription_tier` and feature gates match what Stripe prices + webhooks apply. | Limits and agent access are centralized in **`src/lib/subscription-utils.ts`**; **`src/lib/stripe.ts`** is Stripe SDK + checkout/portal — compare **behavior** across the app, not duplicate constants in one file. |
| Custom agents registry | Collaboration system loads the full agent roster. | **`agent-collaboration-system.ts`** registers **ten** agents: **`aura`**, **`finn`**, plus **`roxy`**, **`blaze`**, **`echo`**, **`lumi`**, **`vex`**, **`lexi`**, **`nova`**, **`glitch`**. **Aura** and **Finn** are core team members on every tier (**`AGENT_ACCESS`** in **`subscription-utils.ts`**). |
| Route protection | Protected routes redirect when logged out. | Next.js uses **`src/proxy.ts`** (session + gating), **not** `src/middleware.ts`. Saying “middleware is missing” is **incorrect** for this repo. |

---

## AI draft output (safe location)

**`npm run internal:audit`** writes **draft** Markdown only under **`docs/internal/generated/`** (gitignored): `LAUNCH_CHECKLIST_DRAFT.md`, `ROADMAP_DRAFT.md`, or `launch-readiness-raw.md` if the model response is malformed. It **does not** overwrite this file. Copy useful items here by hand after review.
