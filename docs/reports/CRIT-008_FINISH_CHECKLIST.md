# CRIT-008 — Finish checklist (founder walkthrough)

**Last updated:** 2026-05-20  
**Full detail:** [SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md)  
**Track progress:** check boxes here, then mirror dates in the runbook evidence table.

You already finished the **hardest** rotations (database, login secrets, Stripe, AI keys, Redis). This guide is only what is **left**, in the safest order.

**Legend:** **V** = Vercel env vars · **R** = Railway env vars · **L** = your local `.env` / `.env.local` (never commit these)

---

## Step 0 — Extra safety (do this first if you pushed docs after ~May 17)

If commit `84904c84` (or similar) was pushed to GitHub **before** passwords were removed from `SECRET_ROTATION_RUNBOOK.md`:

1. Open [Neon console](https://console.neon.tech) → your project → **Roles** → reset `neondb_owner` password again.
2. Copy the new `DATABASE_URL` into **V**, **R**, **L** only.
3. Redeploy Vercel + restart Railway.
4. Hit `https://www.solosuccessai.fun/api/health/deps` — should show `status: ok`.

If you are unsure whether that commit is on GitHub, resetting the DB password once more is still safe (you already know how).

---

## Step 1 — Email: Zoho Mail SMTP (replaces Resend)

**Why:** Signup emails, TOTP, briefcase invites, workflows. Code now uses **SMTP**, not Resend.

Full setup: [docs/deployment/ZOHO_MAIL_SMTP_SETUP.md](../deployment/ZOHO_MAIL_SMTP_SETUP.md)

| # | What you do | Where |
| --- | --- | --- |
| 1 | Zoho Mail → create **app-specific password** | [mail.zoho.com](https://mail.zoho.com) |
| 2 | Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FROM_EMAIL` | **V**, **R**, **L** |
| 3 | **Remove** `RESEND_API_KEY` from Vercel/Railway | Dashboards |
| 4 | **Revoke/delete** old Resend API key (if any) | [resend.com/api-keys](https://resend.com/api-keys) |
| 5 | Redeploy Vercel + restart Railway | Hosting |
| 6 | Test: 2FA code or password reset email on prod | Browser |

- [ ] Done — date: ________

---

## Step 2 — Google reCAPTCHA (not just “Google Cloud API key”)

The app uses **both**:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLOUD_API_KEY` | Server-side reCAPTCHA Enterprise API ([src/lib/recaptcha.ts](../../src/lib/recaptcha.ts)) |
| `RECAPTCHA_SECRET_KEY` | Secret for verification |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public site key in the browser |
| `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` | reCAPTCHA project id |

| # | What you do | Where |
| --- | --- | --- |
| 1 | [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) → delete old key → create new → **restrict** to reCAPTCHA Enterprise API only | GCP |
| 2 | [reCAPTCHA Enterprise](https://console.cloud.google.com/security/recaptcha) → rotate / create new site key + secret if exposed | GCP |
| 3 | Update all four variables above | **V**, **L** (Railway only if those vars exist there) |
| 4 | Redeploy Vercel | Vercel |
| 5 | Test: open `/register` and submit — no reCAPTCHA console errors | Browser |

- [ ] Done — date: ________

---

## Step 3 — VAPID push notifications (optional if you use push)

| # | What you do | Where |
| --- | --- | --- |
| 1 | In repo root PowerShell: `npx web-push generate-vapid-keys` | Your PC |
| 2 | Copy **public** → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | **V**, **L** |
| 3 | Copy **private** → `VAPID_PRIVATE_KEY` | **V**, **L** |
| 4 | Set `VAPID_CONTACT_EMAIL` to your support email | **V**, **L** |
| 5 | Redeploy Vercel | Vercel |

Note: existing users may need to re-enable push after this.

- [ ] Done (or **skipped** — not using push) — date: ________

---

## Step 4 — Brave search (market intelligence)

Only matters if you use competitor / market research features.

| # | What you do | Where |
| --- | --- | --- |
| 1 | [Brave Search API](https://brave.com/search/api/) → regenerate key | Brave |
| 2 | `BRAVE_API_KEY` | **V**, **R**, **L** |
| 3 | Redeploy + restart | Vercel + Railway |

- [ ] Done (or **skipped**) — date: ________

---

## Step 5 — Twitter / X (only if you connect Twitter in the app)

Code may use `TWITTER_API_KEY` / `TWITTER_API_SECRET` (OAuth 1.0a) **or** OAuth 2.0 client id/secret on the integration route. Rotate **every** Twitter-related var you have set in Vercel.

| # | What you do | Where |
| --- | --- | --- |
| 1 | [developer.x.com](https://developer.x.com/en/portal/dashboard) → your app → regenerate keys/tokens | X Developer |
| 2 | Update all `TWITTER_*` vars you use | **V**, **R**, **L** |
| 3 | Redeploy + restart | Vercel + Railway |
| 4 | Test: Social / Twitter connect flow in dashboard | Browser |

- [ ] Done (or **skipped**) — date: ________

---

## Step 6 — Stack Auth (usually: revoke, not rotate)

If you log in with **email/password or your main auth** and **not** Stack’s hosted UI:

| # | What you do | Where |
| --- | --- | --- |
| 1 | Stack dashboard → revoke/regenerate keys | Stack |
| 2 | **Remove** `STACK_SECRET_SERVER_KEY`, `NEXT_PUBLIC_STACK_*` from Vercel **or** replace with new keys if still required | **V**, **L** |
| 3 | Redeploy | Vercel |

- [ ] Done — date: ________

---

## Step 7 — Low priority cleanup

| Service | Action | Done? |
| --- | --- | --- |
| **Gitea** | Revoke old token only (project removed) | [ ] |
| **Context7** | Regenerate key; update **L** only (dev tooling) | [ ] |

---

## Step 8 — Verify the big stuff still works

Do these in order on **production** (`https://www.solosuccessai.fun`).

### 8a — Automated smoke (read-only)

```powershell
cd C:\Users\prett\Documents\SoloSuccess-AI
$env:SMOKE_BASE_URL="https://www.solosuccessai.fun"
$env:SMOKE_SKIP_SIGNUP="1"
npm run smoke
```

Expect exit code **0**.

- [ ] Smoke passed — date: ________

### 8b — Manual (5 minutes in browser)

| Check | Pass? |
| --- | --- |
| Log out → log back in | [ ] |
| Stripe: open billing / portal (no error) | [ ] |
| One AI chat or generation | [ ] |
| Upload a small file to briefcase (optional) | [ ] |

Fill the evidence table in [LAUNCH_SMOKE_TEST_RUNBOOK.md](./LAUNCH_SMOKE_TEST_RUNBOOK.md) section 6.

---

## Step 9 — Git history scrub (Phase 5)

**What this does:** Removes `.env.production` from **every old commit** so nobody with repo access can dig up ancient secrets.

**Warning:** Rewrites history. You must **force-push**. Only do this when you have ~30 quiet minutes.

### Before you start

- [ ] Repo is **private** (or you accept the risk)
- [ ] All rotations above are done (or old keys revoked)
- [ ] No open PRs you care about (or plan to close/rebase them)
- [ ] Backup: `git clone --mirror https://github.com/prettyinpurple2021/SoloSuccess_AI.git solosuccess-backup.git`

### Commands (PowerShell, repo root)

```powershell
# 1) Install once (needs Python)
pip install git-filter-repo

# 2) Commit any doc changes first
git status
git add -A
git commit -m "docs: CRIT-008 finish checklist and runbook redaction"

# 3) Scrub .env.production from all history
git filter-repo --invert-paths --path .env.production --force

# 4) Re-add origin (filter-repo removes remotes)
git remote add origin https://github.com/prettyinpurple2021/SoloSuccess_AI.git

# 5) Force push (DESTRUCTIVE — rewrites GitHub history)
git push --force --all origin
git push --force --tags origin
```

### After force push

- [ ] Vercel still connected to GitHub (check one deploy triggers)
- [ ] Railway still connected (check deploy)
- [ ] If you use another PC: `git fetch --all` then `git reset --hard origin/main` **or** delete folder and re-clone

- [ ] Git history scrubbed — date: ________

---

## Step 10 — Close CRIT-008 in docs

When Steps 1–9 are done:

1. Mark remaining checkboxes in [SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md).
2. Fill the evidence table dates.
3. In [PRODUCTION_REMEDIATION_TRACKER.md](./PRODUCTION_REMEDIATION_TRACKER.md), set **CRIT-008** to `DONE` and bump readiness score to **87/100** (or run the scoring rules there).
4. Update [PROJECT_TRACKER.md](../../PROJECT_TRACKER.md) launch-blocking row to **DONE**.

---

## Quick reference — what “done” looks like

| Area | You are done when… |
| --- | --- |
| **Rotation** | Old keys deleted/revoked in each provider dashboard; new values only in V/R/L |
| **No new leak** | No `.env` files committed; runbook has **no** real passwords |
| **App works** | `npm run smoke` passes; login + billing manually OK |
| **History** | `git filter-repo` + force push completed |
| **Docs** | CRIT-008 marked DONE in production tracker |

You do **not** need to rotate everything on the same day — but **Zoho SMTP + reCAPTCHA + verify login** should be before you call launch “ready.”
