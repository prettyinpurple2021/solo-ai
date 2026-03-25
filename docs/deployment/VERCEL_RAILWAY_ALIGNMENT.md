# Vercel + Railway — stay correct and aligned

This doc is the operational companion to [ENV_VARS_VERCEL_AND_RAILWAY.md](./ENV_VARS_VERCEL_AND_RAILWAY.md). It describes **what must match** between hosts, **how to verify** production, and **how to deploy** without breaking shared contracts.

There is **no platform feature** that auto-locks Vercel and Railway to the same code version. Alignment is **environment variables + URLs + release discipline**.

---

## 1. Non-negotiables (production)

| Check | Vercel (Production) | Railway (API service) |
|--------|---------------------|-------------------------|
| One database | `DATABASE_URL` | **Same** `DATABASE_URL` (same Neon DB) |
| Shared JWT for sockets / tokens | `JWT_SECRET` | **Same** `JWT_SECRET` (32+ random chars) |
| Browser connects Socket.IO to Railway | `NEXT_PUBLIC_SOCKET_URL` = public **https** Railway base URL, **no path** | — |
| Express CORS + Socket.IO allow your site | `NEXT_PUBLIC_APP_URL` = canonical site origin | `CLIENT_URL` = **same origin** as live site (e.g. `https://yourdomain.com`) |

**Normalize URLs:** Use `https`, no trailing slash on origins, exact hostname you ship (www vs apex must match what users load).

---

## 2. Production dashboard verification (manual)

Do this after any secret rotation or domain change.

1. **DATABASE_URL** — Open Vercel → Environment Variables → Production → `DATABASE_URL`. Open Railway → Variables → `DATABASE_URL`. They must be **identical** (same connection string). Do not paste values into chat or tickets.
2. **JWT_SECRET** — Same comparison on both hosts. If they differ, Socket.IO auth and `/api/ws-token` will fail for some users.
3. **Upstash Redis** — If you use Redis-backed features, set **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`** on **both** Vercel and Railway when those code paths are active. One host missing Redis causes intermittent “works here, fails there” behavior.
4. **Cross-URLs**
   - Railway **`CLIENT_URL`** = Vercel site origin only (example: `https://solosuccessai.fun`).
   - Vercel **`NEXT_PUBLIC_SOCKET_URL`** = Railway public URL only (example: `https://your-service.up.railway.app`).
   - Vercel **`NEXTAUTH_URL`** (and usually **`NEXT_PUBLIC_APP_URL`**) = same public site origin as **`CLIENT_URL`**.

---

## 3. Local verification (automated)

From the **repository root**, with your real values in **`.env.local`** (and optional **`server/.env.local`** overrides):

```bash
npm run verify:deployment-alignment
```

This checks (among other things):

- Effective **`JWT_SECRET`** and **`DATABASE_URL`** for the Next.js root env vs the Express env load order match (see `server/env-load.ts`).
- **`CLIENT_URL`** (if set) matches **`NEXT_PUBLIC_APP_URL`** origin.
- **`NEXT_PUBLIC_SOCKET_URL`** looks consistent with local dev (`http://localhost:5000`) vs production (`https://…`).

It prints **SHA-256 prefixes** only — never full secrets — so you can compare **Vercel vs Railway** in the dashboards by computing the same prefix mentally or with a one-off hash if needed.

If **`CLIENT_URL`** and **`NEXT_PUBLIC_APP_URL`** differ but **either** origin is **localhost**, the script emits a **warning** (hybrid local setups). If **both** look like **production** hosts and they still differ, the script **fails** — that pattern would break CORS/Socket.IO in production.

Optional remote health check (no secrets):

```bash
node scripts/verify-local-vercel-railway-alignment.mjs --health-url=https://YOUR-RAILWAY-URL
```

Expect JSON including `"status":"ok"`.

---

## 4. Smoke tests (staging or production)

1. **Railway:** `GET https://<railway-host>/api/health` → `"status":"ok"`, `db` not `missing_env`.
2. **Vercel:** Open the live site, sign in.
3. **Realtime:** Open a screen that uses Socket.IO; confirm connection (no immediate auth error in client logs). Token flow uses the same **`JWT_SECRET`** on both sides.

---

## 5. Deploy discipline (shared contracts)

Vercel and Railway deploy **independently**. Use a simple rule and stick to it:

- **Default:** Connect **both** to the **same Git branch** (e.g. `main`) so releases track the same commits (still not atomic — stagger is possible).
- **Database:** Run migrations **before** or **with** the code that depends on them; avoid removing columns old servers still read until both hosts are updated.
- **Breaking JWT, socket events, or shared API shapes:** Prefer **backward-compatible** changes for one release, then remove old paths. If you must break in one step: deploy **Railway first** (or migrate DB first), then **Vercel**, or coordinate a maintenance window.
- **Stripe:** Webhook for Next lives on **Vercel** (`/api/stripe/webhook`). Duplicate Stripe env on **Railway** only if production traffic hits Express **`/api/stripe/*`**. See [ENV_VARS_VERCEL_AND_RAILWAY.md §3](./ENV_VARS_VERCEL_AND_RAILWAY.md).
- **QStash / callbacks:** Callback URLs must target your **Vercel** domain, not Railway. See [ENV_VARS_VERCEL_AND_RAILWAY.md §2](./ENV_VARS_VERCEL_AND_RAILWAY.md).

---

## 6. env.example ↔ hosting doc audit

Every name in **`env.example`** should be accounted for on **Vercel**, **Railway**, **both**, or **local-only**. The canonical placement list is [ENV_VARS_VERCEL_AND_RAILWAY.md](./ENV_VARS_VERCEL_AND_RAILWAY.md). Notes for names easy to miss:

| Variable | Notes |
|----------|--------|
| `CLIENT_URL` | **Railway** (and local Express); must match site origin. Listed in ENV_VARS Railway §3. |
| `GEMINI_API_KEY` | Primarily **Railway** for Express AI routes; root template includes it for parity. |
| `NEXT_PUBLIC_SOCKET_URL` | **Vercel** only (browser → Railway). |
| `QSTASH_*` callback URLs | **Vercel** domain paths. |
| `TEST_USER_*`, test-only vars | **Never** Production on Vercel. |

If you add a new variable to **`env.example`**, update **ENV_VARS_VERCEL_AND_RAILWAY.md** in the same PR.

---

## Related

- Variable placement: [ENV_VARS_VERCEL_AND_RAILWAY.md](./ENV_VARS_VERCEL_AND_RAILWAY.md)
- Railway GitHub setup: [RAILWAY_CONNECT.md](./RAILWAY_CONNECT.md)
- Order of operations: ENV_VARS §4
