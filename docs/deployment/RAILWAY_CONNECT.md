# Connect SoloSuccess AI to Railway (GitHub + Docker)

**Environment variables (Vercel vs Railway):** [ENV_VARS_VERCEL_AND_RAILWAY.md](./ENV_VARS_VERCEL_AND_RAILWAY.md)

**Build contract:** The API image is built from the **repository root** using **`server/Dockerfile`**. Root **[`railway.toml`](../../railway.toml)** sets `dockerfilePath = "server/Dockerfile"` so the dashboard does not need a separate Dockerfile override unless you changed it there.

---

## 1. Push code to GitHub

Railway’s Git integration reads from **GitHub** (or GitLab). Ensure **`main`** on the GitHub repository you connect (e.g. **SoloSuccess_AI**) has the commit you want to deploy.

---

## 2. Create or open the project on Railway

1. Sign in at [railway.app](https://railway.app).
2. **New project** → **Deploy from GitHub repo** → authorize and select **`SoloSuccess_AI`** (or your fork).
3. Railway may create a service automatically. If you already have a project, open the **API** service card.

---

## 3. Service settings (critical)

Open the service → **Settings**:

| Setting | Value |
|--------|--------|
| **Root Directory** | **Empty** or **`.`** (repository root — **not** `server`) |
| **Dockerfile** | Leave default if Railway reads **`railway.toml`**; otherwise set **`server/Dockerfile`**. |

The Dockerfile **`COPY**s` both `server/` and `src/lib/shared`, `src/types`, etc., so the build context **must** be the monorepo root.

**Branch:** Set the **production** branch to **`main`** (or your default).

---

## 4. Variables

Service → **Variables**. Minimum to boot and pass health checks:

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Same Neon (or Postgres) URL as Vercel |
| `JWT_SECRET` | Long random string; **must match** Vercel |
| `CLIENT_URL` | Your **Vercel** site origin, e.g. `https://your-app.vercel.app` (CORS) |

Add AI/Redis/Stripe/etc. per [ENV_VARS_VERCEL_AND_RAILWAY.md](./ENV_VARS_VERCEL_AND_RAILWAY.md) section **3**.

---

## 5. Deploy and verify

1. **Deployments** should show a build from your latest commit.
2. **Settings** → **Networking** → generate a public domain if needed.
3. Open **`https://<your-railway-host>/api/health`** — expect JSON with **`"status":"ok"`**.

---

## 6. Point Vercel at Railway

On **Vercel** → your project → **Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SOCKET_URL` | Railway public **HTTPS** root only (no path), e.g. `https://xxxx.up.railway.app` |
| `JWT_SECRET` | Same value as Railway |

Redeploy Vercel after saving.

---

## CLI alternative (optional)

From the **repo root**: `railway link` then `railway up --ci`. Do **not** use `railway up .` (CLI tarball bug). Prefer **Git-connected** deploys for a stable loop: push to GitHub → Railway builds automatically.

---

## `railway-deploy/` folder

Optional legacy packaging (separate small image). **Primary** production path is **`server/Dockerfile` + `railway.toml`**. See [railway-deploy/README.md](../../railway-deploy/README.md).
