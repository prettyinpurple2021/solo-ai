# Launch smoke test runbook (preview & production)

Last updated: 2026-04-06  
Companion: `scripts/smoke-auth.mjs` · tracker: `docs/reports/PRODUCTION_REMEDIATION_TRACKER.md`  
Related: `docs/deployment/INCIDENT_AND_ROLLBACK_RUNBOOK.md` · `docs/deployment/MONITORING_VERIFICATION.md`

## What this is (plain language)

A **smoke test** is a quick “does the building catch fire when we turn the lights on?” check. You prove that the live site responds, critical services (database, auth secrets) look wired, and the main user paths still work—**before** you invite a large audience.

---

## 1) Pick your target

| Environment | Typical URL | Notes |
|-------------|-------------|--------|
| **Vercel preview** | Your PR preview URL | Best place to run **full** automated signup + API checks (creates a throwaway user). |
| **Production** | Your public domain | Prefer **read-only** automated checks (`SMOKE_SKIP_SIGNUP=1`) plus **manual** flows with a real or dedicated test account so you do not spam the DB with random signups. |

Set the base URL **only** via environment variable (never commit URLs if they embed secrets):

```bash
# Windows PowerShell
$env:SMOKE_BASE_URL="https://your-preview-or-prod-host.example"
npm run smoke

# Skip signup + JWT API roundtrip (recommended for production domain)
$env:SMOKE_SKIP_SIGNUP="1"
npm run smoke
```

```bash
# macOS / Linux
SMOKE_BASE_URL="https://your-preview-or-prod-host.example" npm run smoke
SMOKE_BASE_URL="https://..." SMOKE_SKIP_SIGNUP=1 npm run smoke
```

---

## 2) Automated checks (`npm run smoke`)

The script:

1. **GET** `/` — expects an HTTP status **below 500** (site serves).
2. **GET** `/api/health` — expects **200** and JSON `status: "ok"`.
3. **GET** `/api/health/deps` — expects **200** and JSON `status: "ok"` (database ping, required env vars present on the server).
4. Unless **`SMOKE_SKIP_SIGNUP=1`**: **POST** `/api/auth/signup` with a unique email, then **GET** `/api/auth/user` and **GET/POST** `/api/briefcases` (create + list).

**Exit code `0`** = all automated steps passed; **`1`** = at least one failure (see console output).

---

## 3) Manual checklist — auth & session

Complete in the browser on the same **SMOKE_BASE_URL** host. Record pass/fail in the evidence table (section 6).

| Step | Action | Expected |
|------|--------|----------|
| M1 | Open `/register` | Registration UI loads, no 5xx error page |
| M2 | Register a **new** test user (use a unique email) OR sign in with your dedicated smoke account | Success path; lands in or toward dashboard |
| M3 | Open `/login`, sign out if needed, sign **in** | Session restored; dashboard reachable |
| M4 | Sign **out** from the app UI | Session cleared; protected routes redirect or gate |

---

## 4) Manual checklist — billing (Stripe)

Use **Stripe test mode** on non-production, or real cards only if you intentionally test production billing.

| Step | Action | Expected |
|------|--------|----------|
| B1 | Dashboard → **Billing** (or `/dashboard/billing`) | Page loads; current plan shown |
| B2 | Start **checkout** for a paid tier (if offered) | Redirects to Stripe Checkout |
| B3 | Complete or cancel test payment per Stripe test rules | Returns to app without unhandled error |
| B4 | Open **customer portal** (manage subscription) | Opens Stripe portal or graceful message if not applicable |
| B5 | **Cancel** subscription (test account) | Confirmed in UI + Stripe dashboard / webhook eventually consistent |
| B6 | **Reactivate** (if applicable) | UI reflects active state |

API surface (for debugging with an authenticated session): `/api/billing/subscription`, `/api/billing/checkout`, `/api/billing/portal`, `/api/billing/cancel-subscription`, `/api/billing/reactivate-subscription`.

---

## 5) Manual checklist — AI, briefcase, dashboard APIs

| Step | Action | Expected |
|------|--------|----------|
| A1 | `/dashboard/agents` — open **Aura** (or default agent), send one short message | Message appears in thread; no hard error boundary |
| A2 | Briefcase — **upload** a small PDF or text file | Upload succeeds; file listed |
| A3 | **Download** the file you uploaded | File opens or saves correctly |
| A4 | **Delete** the test file (if UI allows) | Removed from list |
| D1 | Dashboard home loads | Main widgets / navigation work |
| D2 | **GET** `/api/dashboard` (browser devtools: same-origin fetch while logged in, or use session cookie) | **200** with JSON payload (not 401/500) |

---

## 6) Evidence table (copy per run)

| ID | Check | Pass/Fail | Notes | Runner | Date (UTC) |
|----|--------|-----------|-------|--------|------------|
| A | `npm run smoke` (full) | | | | |
| A′ | `SMOKE_SKIP_SIGNUP=1 npm run smoke` | | | | |
| M1–M4 | Auth manual | | | | |
| B1–B6 | Billing manual | | | | |
| A1–A4, D1–D2 | AI / briefcase / dashboard | | | | |

**Sev-1 / Sev-2 guidance:** Any **5xx** on core auth, billing checkout, or health/deps **error** status → treat as launch-blocking until resolved.

---

## 7) Optional: Playwright against a deployed URL

Playwright is configured with **`E2E_BASE_URL`** in `playwright.config.ts`. To exercise **critical-flow** specs against a deployment (requires valid **`TEST_USER_EMAIL`** / **`TEST_USER_PASSWORD`** for that environment):

```bash
# Example: do not commit real credentials; set locally or in CI secrets
$env:E2E_BASE_URL="https://your-host.example"
$env:TEST_USER_EMAIL="your-dedicated-smoke-user@example.com"
$env:TEST_USER_PASSWORD="your-secure-password"
npx playwright test tests/critical-flows.spec.ts --project=chromium
```

---

## 8) After the run

1. Attach or link this completed evidence table in **`PRODUCTION_REMEDIATION_TRACKER.md`** (work log) or your launch ticket.  
2. Tick **“Critical flow smoke tests pass in preview/prod”** in `docs/reports/VISUAL_PUBLIC_LAUNCH_ROADMAP.md` when all P0 rows are **Pass**.
