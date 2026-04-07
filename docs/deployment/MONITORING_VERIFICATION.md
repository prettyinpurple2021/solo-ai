# Monitoring and alerting — one-time verification (dry run)

Last updated: 2026-04-06  

**Purpose:** Before public launch, prove that you can **see** errors and traffic when something goes wrong. This is a **manual rehearsal**; it does not replace automated tests.

**Do not** paste secrets, DSNs, or API keys into this file or into tickets.

---

## 1) Preconditions

- [ ] You have **Production** access on **Vercel** and **Railway** (and **Neon**, **Stripe** as needed).
- [ ] If using **Sentry**, the app has `SENTRY_DSN` set only on the server side as documented in `env.example` / `ENV_VARS_VERCEL_AND_RAILWAY.md`.

---

## 2) Vercel — logs and deployments

1. Open **Vercel** → project → **Deployments** → confirm the latest **Production** deployment matches the commit you expect.
2. Open **Logs** (or Observability / Runtime logs, depending on UI).
3. Load your production homepage in a browser to generate traffic.
4. **Pass criteria:** You see **recent requests** and no unexplained flood of **5xx** for normal browsing.

**Optional dry-run (staging/preview only):** Trigger a **known** 404 or hit a test route that returns 401 — confirm the log line appears and is readable (no need to break production).

---

## 3) Railway — API / Socket service

1. Open **Railway** → your Express service → **Logs**.
2. From the browser, use a feature that hits the API or Socket (e.g. dashboard action that uses `NEXT_PUBLIC_SOCKET_URL`).
3. **Pass criteria:** Correlated log lines appear; no repeating crash loop.

---

## 4) Sentry (if enabled)

1. Open your Sentry project for SoloSuccess AI.
2. In **Issues**, note the baseline (open issue count).
3. Optionally trigger a **non-production** error (preview/staging) using a controlled test, or wait for natural traffic.
4. **Pass criteria:** A test error shows up as an **issue** with a stack trace and release/environment tags if configured.

If Sentry is **not** configured, skip this section and record “N/A — Sentry not in use.”

---

## 5) Stripe webhooks (production or test mode)

1. **Stripe** → **Developers** → **Webhooks** → select your endpoint.
2. Confirm **recent deliveries**: mostly **2xx**; investigate any **4xx/5xx**.
3. **Pass criteria:** Signing secret on Vercel matches the endpoint; failed deliveries have a clear error message (fix forward).

---

## 6) Neon (database)

1. Neon console → your project → **Monitoring** (CPU, connections, storage).
2. **Pass metrics:** No sustained **connection errors** in app logs during normal use; compute not pegged at 100% during idle.

---

## 7) Evidence (copy to tracker or ticket)

| Check | Pass / N/A / Fail | Notes | Date (UTC) | Verifier |
|-------|-------------------|-------|------------|----------|
| Vercel logs visible | | | | |
| Railway logs visible | | | | |
| Sentry (if used) | | | | |
| Stripe webhooks | | | | |
| Neon monitoring | | | | |

When all applicable rows are **Pass** or **N/A**, you may mark **“Monitoring and alerting verified with dry run”** on `docs/reports/VISUAL_PUBLIC_LAUNCH_ROADMAP.md`.
