# Where each environment variable goes (Vercel vs Railway)

**Production layout for this repo:** **Vercel** = Next.js (website + `/api/*` routes). **Railway** = Express app in `server/` (REST + Socket.IO).

Use **Vercel** → Project → **Settings** → **Environment Variables** → scope **Production**.  
Use **Railway** → your API service → **Variables**.

**Railway UI:** You might have a **single** project card (e.g. “SoloSuccess AI”). That **one** service **is** the API — open it and use the **Variables** tab. The display name is whatever you chose; it does not have to say “API”.

**Rule of thumb:** If the name starts with `NEXT_PUBLIC_`, it **only** goes on **Vercel** (it is sent to the browser). Secrets almost never use that prefix.

---

## 1. Same value on BOTH Vercel and Railway

Copy/paste the **same** string in both places.

| Variable | Why |
|----------|-----|
| `DATABASE_URL` | One production Postgres (e.g. Neon). Both apps read/write the same data. |
| `JWT_SECRET` | Must match so login/session tokens and `/api/ws-token` work with Railway Socket.IO. Use a long random string (32+ characters). |

**Optional duplicate (only if you use Redis-backed features):**

| Variable | Why |
|----------|-----|
| `UPSTASH_REDIS_REST_URL` | Next.js and Express both have code paths that talk to Redis. |
| `UPSTASH_REDIS_REST_TOKEN` | Same as above. |

If you are not sure, set them on **both** once you have an Upstash Redis database—it avoids “works on the site but not on the API” surprises.

---

## 2. Vercel only (Next.js)

Set these on **Vercel Production**. Do **not** put `NEXT_PUBLIC_*` values on Railway unless you have a unusual setup (you don’t need to).

### Required for the app to start cleanly

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Your live site, e.g. `https://yourdomain.com` |
| `DATABASE_URL` | Same as Railway |
| `JWT_SECRET` | Same as Railway |

### Required for normal login (NextAuth)

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | Long random (32+). Run `npx auth secret` locally to generate one. |
| `NEXTAUTH_URL` | Usually same base URL as `NEXT_PUBLIC_APP_URL` |
| `NEXTAUTH_SECRET` | Legacy/alternate; set if your project already uses it |

### WebSockets in the browser → Railway

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SOCKET_URL` | **Railway public HTTPS URL only** (no path), e.g. `https://xxxx.up.railway.app`. So the browser opens Socket.IO against Railway, not Vercel. |

### Public URLs for the client

| Variable | Typical production |
|----------|--------------------|
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api` if APIs live on Next |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |

### Stripe (webhook + checkout on Next)

Stripe’s webhook in this codebase is implemented under **Next** (`/api/stripe/webhook`). These belong on **Vercel**:

| Variable |
|----------|
| `STRIPE_SECRET_KEY` |
| `STRIPE_WEBHOOK_SECRET` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `STRIPE_ACCELERATOR_PRICE_ID` |
| `STRIPE_DOMINATOR_PRICE_ID` |
| `STRIPE_ACCELERATOR_YEARLY_PRICE_ID` (if you use yearly) |
| `STRIPE_DOMINATOR_YEARLY_PRICE_ID` (if you use yearly) |

### OAuth (only if you enabled Google/GitHub login)

| Variable |
|----------|
| `GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` |
| `GITHUB_CLIENT_ID` |
| `GITHUB_CLIENT_SECRET` |

### Stack Auth (only if you use Stack instead of / alongside NextAuth)

| Variable |
|----------|
| `NEXT_PUBLIC_STACK_PROJECT_ID` |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` |
| `STACK_SECRET_SERVER_KEY` |

### AI (Next.js API routes / server components)

| Variable |
|----------|
| `OPENAI_API_KEY` |
| `ANTHROPIC_API_KEY` |
| `GOOGLE_GENERATIVE_AI_API_KEY` |
| `GOOGLE_AI_API_KEY` |

### Email, push, captcha, analytics (Next)

| Variable |
|----------|
| `RESEND_API_KEY`, `FROM_EMAIL` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL` (and `VAPID_PUBLIC_KEY` if used) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID`, `RECAPTCHA_SECRET_KEY`, `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_API_KEY` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_AMPLITUDE_API_KEY`, `LOG_INGEST_URL` |

### Queues / workers (callbacks hit your **site** URL)

| Variable | Notes |
|----------|--------|
| `QSTASH_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | From Upstash QStash |
| `QSTASH_WORKER_CALLBACK_URL`, `QSTASH_ONBOARDING_CALLBACK_URL` | Must be **https URLs on your Vercel domain** (paths QStash will call) |

### PayPal, feature flags, misc (Next)

| Variable |
|----------|
| `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| `ENABLE_AGENT_MESSAGE_PUMP`, `ENABLE_NOTIFICATION_PROCESSOR`, `VALIDATE_ENV`, caps, `FEATURE_*` |
| `NEXT_PUBLIC_PERFORMANCE_MONITOR`, `NEXT_PUBLIC_DISABLE_EXIT_INTENT`, `NEXT_PUBLIC_USE_BACKEND_STORAGE` |
| `INTERNAL_API_KEY`, `INTERNAL_AGENT_SECRET`, `ENCRYPTION_KEY`, `ADMIN_EMAILS`, `BRAVE_API_KEY`, `NOTIFICATION_JOB_TOKEN` |
| `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `TWITTER_API_KEY`, `TWITTER_API_SECRET` |
| `SENTRY_DSN` (for Next/Sentry if configured) |

### Do NOT put on Vercel (local / CI only)

| Variable | Notes |
|----------|--------|
| `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` | Tests only — never Production. |

---

## 3. Railway only (Express `server/`)

Set these on **Railway** for the **API** service. In the service **Settings**, **Root Directory** must be the **repository root** (empty or `.`); the image is built with **`server/Dockerfile`** via root **`railway.toml`** (not a `server`-only root).

### Strongly recommended / required for a sane API

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Same as Vercel |
| `JWT_SECRET` | Same as Vercel |
| `CLIENT_URL` | Your **Vercel** site origin, e.g. `https://yourdomain.com` (CORS + redirects) |
| `PORT` | Often **set automatically by Railway**; if you override, it must match what the container listens on. |

### AI + Redis used by Express routes

| Variable | Notes |
|----------|--------|
| `GEMINI_API_KEY` | Google GenAI on the Express server (`/api/ai`, boardroom, etc.) |
| `OPENAI_API_KEY` | Server-side embeddings and agents that call OpenAI |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Tasks, usage, blackboard, etc. |

### Stripe on Express (optional duplicate)

Express also mounts `/api/stripe/*`. If **anything** (app, scripts, mobile) calls your **Railway** URL for Stripe, set the same Stripe secrets and price IDs on **Railway**.  
If **all** checkout and webhooks go through **Vercel**, you still **must** keep Stripe webhook vars on **Vercel**; Railway Stripe vars are only needed if those Express routes are used in production.

| Variable |
|----------|
| `STRIPE_SECRET_KEY` |
| `STRIPE_WEBHOOK_SECRET` |
| `STRIPE_ACCELERATOR_PRICE_ID`, `STRIPE_DOMINATOR_PRICE_ID`, yearly IDs |

### Observability

| Variable |
|----------|
| `SENTRY_DSN` |
| `DEBUG_SERVER_LOGS` (e.g. `0` or `1`) |

---

## 4. Order of operations (minimal path)

1. Deploy **Railway** (`server/`), add **DATABASE_URL**, **JWT_SECRET**, **NODE_ENV**, **CLIENT_URL**, **GEMINI_API_KEY**, **Upstash** (if you have them). Copy the **public HTTPS** Railway URL.  
2. Open `https://<railway-url>/api/health` — should return JSON with `"status":"ok"`.  
3. On **Vercel**, set everything in sections **1** and **2**, including **`NEXT_PUBLIC_SOCKET_URL` = Railway URL** (same secret **JWT_SECRET**).  
4. Redeploy **Vercel**.

Step-by-step Railway (GitHub): **[RAILWAY_CONNECT.md](./RAILWAY_CONNECT.md)**.

---

## 5. Full name list (template)

Every name the project might read is still listed in **`env.example`** at the repo root. This document tells you **which host** each group belongs on; `env.example` is the checklist of **names**.
