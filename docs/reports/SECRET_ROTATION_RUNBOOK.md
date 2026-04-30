# Secret Rotation Runbook — CRIT-008

> **Trigger:** `.env.production` containing real production secrets was committed to git history
> (commit `34980ff6` and predecessors; file deleted in `cef2a0ad` on 2026-01-11).
> Even though the file is no longer in HEAD, **all secrets are recoverable from git history**.
> 
> **Repo:** `prettyinpurple2021/SoloSuccess_AI` (private) — limits blast radius but does not eliminate risk.
> 
> **Owner:** Frances Loggins
> **Created:** 2026-04-27
> **Status:** IN_PROGRESS

## Instructions

Work through each phase **in order**. For each secret:

1. Generate the **new** value in the service dashboard
2. Update it in **every** deployment environment listed
3. Deploy / restart the affected service
4. Verify the feature still works
5. **Then** revoke / disable the old value

**Environments to update for each secret:**

| Abbrev | Environment | How to set                                             |
| ------ | ----------- | ------------------------------------------------------ |
| **V**  | Vercel      | Dashboard → Project → Settings → Environment Variables |
| **R**  | Railway     | Dashboard → Project → Variables                        |
| **L**  | Local       | `.env.local` in project root                           |

---

## Phase 1 — CRITICAL: Database & Authentication

### 1. Neon PostgreSQL Password

| Detail                         | Value                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Variable**                   | `DATABASE_URL`                                                                                                                    |
| **Compromised value contains** | password `npg_QIj0fGxldW6J`, host `ep-royal-wave-ahafdikl`                                                                        |
| **Rotate at**                  | [console.neon.tech](https://console.neon.tech) → Project `hidden-snow-05992338` → **Roles** → `neondb_owner` → **Reset password** |
| **Update in**                  | V, R, L                                                                                                                           |
| **Verify**                     | App connects; `/api/health/deps` returns `status: ok`                                                                             |

**New connection string format:**

```text
postgresql://neondb_owner:npg_rJM7CiZUu9TK@ep-royal-wave-ahafdikl.c-3.us-east-1.aws.neon.tech/solosuccess-database?sslmode=require&channel_binding=require
```

- [x] New password generated
- [x] Vercel updated
- [x] Railway updated
- [x] Local `.env.local` updated
- [x] Vercel redeployed
- [x] Railway restarted
- [x] `/api/health/deps` verified
- [x] Old password is now invalid (Neon resets immediately)

---

### 2. Neon API Key

| Detail        | Value                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Variable**  | `NEON_API_KEY`                                                                                                                |
| **Rotate at** | [console.neon.tech](https://console.neon.tech) → Account icon → **Account Settings** → **API Keys** → Revoke old → Create new |
| **Update in** | L (and CI/scripts if used)                                                                                                    |
| **Verify**    | Any Neon CLI/API calls work                                                                                                   |

- [x] New key generated
- [x] Old key revoked
- [x] Updated in local env / scripts (UPDATED IN ENV ONLY)

---

### 3. JWT_SECRET & AUTH_SECRET

> ⚠️ **Rotating these will invalidate ALL active user sessions.** Users must re-login.
> Plan for a low-traffic window or send advance notice.

| Detail           | Value                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Variables**    | `JWT_SECRET`, `AUTH_SECRET`                                                                                             |
| **Generate new** | Run twice: `openssl rand -base64 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| **Update in**    | V, R, L                                                                                                                 |
| **Verify**       | Login flow works; authenticated API calls succeed                                                                       |

- [x] New `JWT_SECRET` generated
- [x] New `AUTH_SECRET` generated
- [x] Vercel updated (both)
- [x] Railway updated (both)
- [x] Local `.env.local` updated (both)
- [x] Vercel redeployed
- [x] Railway restarted
- [ ] Login flow verified
- [x] Old sessions confirmed expired

---

## Phase 2 — CRITICAL: Payment & AI API Keys

### 4. Stripe (LIVE keys)

> ⚠️ **These are LIVE Stripe keys, not test keys.** Handle with extreme care.

| Detail        | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| **Variables** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Rotate at** | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)               |
| **Update in** | V, R, L                                                                            |

**Steps:**

1. **Secret key:** Click "Roll key" — Stripe allows old key for 24h during transition
2. **Publishable key:** Regenerate (less critical but do it since it was exposed alongside the secret key)
3. **Webhook secret:** Dashboard → Webhooks → your endpoint → "Reveal signing secret" (if you recreate the endpoint, you get a new secret)
- [x] `STRIPE_SECRET_KEY` rolled
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` regenerated
- [x] `STRIPE_WEBHOOK_SECRET` regenerated
- [x] All three updated in Vercel
- [x] All three updated in Railway
- [x] All three updated in local `.env.local`
- [x] Vercel redeployed
- [x] Railway restarted
- [ ] Checkout flow verified
- [ ] Webhook delivery verified (Stripe Dashboard → Webhooks → Recent deliveries)
- [x] Old secret key expired (24h after roll)

---

### 5. OpenAI API Key

| Detail        | Value                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| **Variable**  | `OPENAI_API_KEY`                                                                                           |
| **Rotate at** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Delete compromised key → Create new |
| **Update in** | V, R, L                                                                                                    |
| **Verify**    | AI features using OpenAI respond correctly                                                                 |

- [x] Old key deleted
- [x] New key created
- [x] Updated in V, R, L
- [x] Deployed, not verified

---

### 6. Anthropic API Key

| Detail        | Value                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **Variable**  | `ANTHROPIC_API_KEY`                                                                                           |
| **Rotate at** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) → Disable old → Create new |
| **Update in** | V, R, L                                                                                                       |
| **Verify**    | AI features using Claude respond correctly                                                                    |

- [x] Old key disabled
- [x] New key created
- [x] Updated in V, R, L
- [x] Deployed 

---

## Phase 3 — HIGH: Infrastructure Services

### 7. Upstash Redis

| Detail        | Value                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Variables** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                                                                             |
| **Rotate at** | [console.upstash.com](https://console.upstash.com) → Database `famous-satyr-79261` → **Reset password** or regenerate REST token |
| **Update in** | V, R, L                                                                                                                          |
| **Verify**    | Redis-backed features work (caching, rate limiting, 2FA codes)                                                                   |

- [ ] Token regenerated
- [ ] Updated in V, R, L
- [ ] Deployed & verified

---

### 8. Upstash QStash

| Detail        | Value                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| **Variables** | `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`                 |
| **Rotate at** | [console.upstash.com](https://console.upstash.com) → QStash → **Signing Keys** → Rotate |
| **Update in** | V, R, L                                                                                 |
| **Verify**    | Background job processing works                                                         |

Note: QStash signing key rotation is a two-step process — `NEXT` becomes `CURRENT`, and a new `NEXT` is generated. Update both.

- [ ] Token regenerated
- [ ] Signing keys rotated
- [ ] Updated in V, R, L
- [ ] Deployed & verified

---

### 9. Resend Email API Key

| Detail        | Value                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| **Variable**  | `RESEND_API_KEY`                                                             |
| **Rotate at** | [resend.com/api-keys](https://resend.com/api-keys) → Delete old → Create new |
| **Update in** | V, R, L                                                                      |
| **Verify**    | Send a test email or trigger a transactional flow                            |

- [ ] Old key deleted
- [ ] New key created
- [ ] Updated in V, R, L
- [ ] Deployed & verified

---

### 10. Twitter/X API Credentials

| Detail        | Value                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Variables** | `TWITTER_APP_KEY`, `TWITTER_APP_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`                              |
| **Rotate at** | [developer.x.com](https://developer.x.com/en/portal/dashboard) → Your App → **Keys and tokens** → Regenerate all four |
| **Update in** | V, R, L                                                                                                               |
| **Verify**    | Twitter integration features work                                                                                     |

- [ ] All four credentials regenerated
- [ ] Updated in V, R, L
- [ ] Deployed & verified

---

### 11. Stack Auth

| Detail        | Value                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Variables** | `STACK_SECRET_SERVER_KEY`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`                              |
| **Rotate at** | Stack Auth dashboard → Project `a1c8e783-0b8c-4824-87e9-579ad25ae0dd` → Settings → Regenerate keys |
| **Update in** | V, L                                                                                               |
| **Verify**    | Stack Auth login (if still active); otherwise just revoke                                          |

> If Stack Auth is no longer used in production, simply **revoke** the keys and remove the env vars from Vercel.

- [ ] Keys revoked or regenerated
- [ ] Updated or removed from V, L

---

## Phase 4 — MEDIUM: Remaining Services

### 12. VAPID Keys (Push Notifications)

> ⚠️ Rotating VAPID keys **invalidates all existing push subscriptions**. Users must re-subscribe.

| Detail           | Value                                               |
| ---------------- | --------------------------------------------------- |
| **Variables**    | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| **Generate new** | `npx web-push generate-vapid-keys`                  |
| **Update in**    | V, L                                                |
| **Verify**       | Push notification subscription + delivery           |

- [ ] New VAPID keypair generated
- [ ] Updated in V, L
- [ ] Deployed & verified

---

### 13. Google Cloud API Key

| Detail        | Value                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Variable**  | `GOOGLE_CLOUD_API_KEY`                                                                                                                                                  |
| **Rotate at** | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → Delete old key → Create new → **Restrict to reCAPTCHA Enterprise API** |
| **Update in** | V, L                                                                                                                                                                    |
| **Verify**    | reCAPTCHA validation works                                                                                                                                              |

- [ ] Old key deleted
- [ ] New key created (with API restriction)
- [ ] Updated in V, L
- [ ] Deployed & verified

---

### 14. Brave Search API Key

| Detail        | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| **Variable**  | `BRAVE_API_KEY`                                                                |
| **Rotate at** | [brave.com/search/api](https://brave.com/search/api/) → Dashboard → Regenerate |
| **Update in** | V, R, L                                                                        |
| **Verify**    | Brave search features work                                                     |

- [ ] Key regenerated
- [ ] Updated in V, R, L
- [ ] Deployed & verified

---

### 15. Gitea Access Token

| Detail                    | Value                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| **Variable**              | `GITEA_ACCESS_TOKEN`                                                |
| **Action**                | Revoke at old Gitea instance settings → Applications → Revoke token |
| **No replacement needed** | Gitea was removed from the project                                  |

- [ ] Token revoked

---

### 16. Context7 API Key

| Detail        | Value                           |
| ------------- | ------------------------------- |
| **Variable**  | `CONTEXT7_API_KEY`              |
| **Rotate at** | Context7 dashboard → Regenerate |
| **Update in** | L (dev tooling only)            |

- [ ] Key regenerated
- [ ] Updated in local env

---

## Phase 5 — Git History Scrubbing (Recommended)

Remove `.env.production` from **all** git history so the old secrets cannot be recovered even with repo access.

```powershell
# Install git-filter-repo (requires Python 3.5+)
pip install git-filter-repo

# From repo root — removes .env.production from every commit
git filter-repo --invert-paths --path .env.production --force

# Force push rewritten history
git push --force --all origin
git push --force --tags origin
```

> After force push, all collaborators must re-clone the repository.

- [ ] `git filter-repo` executed
- [ ] Force push completed
- [ ] Collaborators notified to re-clone

---

## Post-Rotation Evidence Table

| #   | Service                     | Rotated? | Old Key Disabled? | Verified Working? | Date     |
| --- | --------------------------- | -------- | ----------------- | ----------------- | -------- |
| 1   | Neon DB Password            | DONE     | YES               | YES               | 04/27/26 |
| 2   | Neon API Key                | DONE     | YES               | YES               | 04/27/26 |
| 3   | JWT_SECRET                  | DONE     | N/A               |                   | 04/27/26 |
| 4   | AUTH_SECRET                 | DONE     | N/A               |                   | 04/27/26 |
| 5   | Stripe Secret Key           | DONE     | YES               |                   | 04/28/26 |
| 6   | Stripe Webhook Secret       | DONE     | YES               |                   | 04/27/26 |
| 7   | Stripe Publishable Key      | DONE     | YES               |                   | 04/27/26 |
| 8   | OpenAI API Key              | DONE     | YES               |                   | 04/28/26 |
| 9   | Anthropic API Key           | DONE     | YES               |                   | 04/28/26 |
| 10  | Upstash Redis Token         |          |                   |                   |          |
| 11  | QStash Token + Signing Keys |          |                   |                   |          |
| 12  | Resend API Key              |          |                   |                   |          |
| 13  | Twitter/X (all 4)           |          |                   |                   |          |
| 14  | Stack Auth Keys             |          |                   |                   |          |
| 15  | VAPID Keys                  |          |                   |                   |          |
| 16  | Google Cloud API Key        |          |                   |                   |          |
| 17  | Brave API Key               |          |                   |                   |          |
| 18  | Gitea Token                 |          |                   |                   |          |
| 19  | Context7 API Key            |          |                   |                   |          |
| 20  | Git history scrubbed        |          | N/A               | N/A               |          |
