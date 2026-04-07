# Incident response and rollback (SoloSuccess AI)

Last updated: 2026-04-06  
Stack reminder: **Vercel** hosts Next.js (site + Next `/api/*`). **Railway** hosts the Express app in `server/` (REST + Socket.IO). See also `docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md`.

---

## 1) Severity (how big is the fire?)

| Level | Meaning | First response |
|-------|---------|----------------|
| **Sev-1** | Paying users blocked (cannot sign in, pay, or use core dashboard) or data loss risk | Stop shipping changes; focus on rollback + comms |
| **Sev-2** | Major feature broken, workaround exists | Fix forward or rollback same day |
| **Sev-3** | Minor bug, cosmetic, or internal-only | Normal backlog |

---

## 2) Escalation (fill in your real contacts)

Copy this table somewhere you will actually look during an outage (printed page, password manager note, or team wiki). **Do not put secrets here.**

| Role | Name | How to reach |
|------|------|--------------|
| Owner / decision maker | *(you)* | |
| Hosting — Vercel | Dashboard + support | [vercel.com](https://vercel.com) |
| Hosting — Railway | Dashboard + support | [railway.app](https://railway.app) |
| Payments — Stripe | Dashboard | [dashboard.stripe.com](https://dashboard.stripe.com) |
| DB — Neon | Console | Your Neon project dashboard |

---

## 3) Detection (where to look first)

1. **Vercel** → Project → **Deployments** — failed build or new production deploy time matches incident start?
2. **Vercel** → **Logs** (or Runtime Logs) — 5xx spikes, auth errors, Stripe webhook failures?
3. **Railway** → Service → **Logs** — Socket/API errors, database connection errors?
4. **Stripe** → **Developers** → **Webhooks** — failed deliveries to `/api/stripe/webhook` (or your configured path)?
5. **Sentry** (if `SENTRY_DSN` is configured) — new issues or error rate jump?

---

## 4) Rollback — Vercel (Next.js frontend)

Goal: put users back on the **last known good** deployment.

1. Open Vercel → your project → **Deployments**.
2. Find the deployment that was healthy **before** the incident (timestamp/commit message).
3. Use **⋯** on that deployment → **Promote to Production** (wording may vary slightly; equivalent: assign production traffic to that deployment).

**After rollback:** confirm `GET /api/health` and `GET /api/health/deps` on the **production domain** return JSON with `status: "ok"` (see `docs/reports/LAUNCH_SMOKE_TEST_RUNBOOK.md`).

---

## 5) Rollback / restart — Railway (Express + Socket.IO)

1. Railway → your API service → **Deployments**.
2. If the bad change is a **new deploy**: redeploy the previous **successful** deployment (Railway UI: rollback or redeploy from history, depending on your workflow).
3. If the service is **crashing**: check **Variables** (missing `DATABASE_URL`, `JWT_SECRET` mismatch with Vercel, etc.) against `docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md`.
4. **JWT mismatch symptom:** users logged in on the web app but realtime or API calls fail auth — Vercel and Railway must share the same `JWT_SECRET` (or `AUTH_SECRET`).

---

## 6) Stripe / billing incidents

- **Webhook failures:** Stripe retries; fix the endpoint (5xx, wrong URL, wrong signing secret) then use Stripe dashboard to **resend** critical events if needed.
- **Accidental bad deploy:** avoid changing Stripe **live** price IDs in production without a checklist; keep test mode for rehearsal.

---

## 7) Database (Neon)

- **Migrations:** If a migration caused the incident, **do not** run ad-hoc fixes in production without a written backout plan. Prefer restore from Neon backup / PITR if your plan supports it, or forward-fix with a tested migration.
- **Connection exhaustion:** check Neon dashboard metrics; reduce pool size or fix connection leaks in long-running workers.

---

## 8) Communication (simple template)

**Status page / email / social (optional):**

> We are investigating reports of [symptom]. We will update this message within [30–60] minutes.

**Resolved:**

> The issue affecting [area] is resolved. If you still see problems, sign out and sign in again, or contact [support email].

---

## 9) After the incident

1. Write **3–5 bullets**: root cause, fix, what we will do to prevent repeat.
2. Update `docs/reports/PRODUCTION_REMEDIATION_TRACKER.md` work log if the fix touched production behavior or env.
