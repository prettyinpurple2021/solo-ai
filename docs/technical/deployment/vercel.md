# Deploying to Vercel (production)

## Prerequisites

- GitHub (or GitLab/Bitbucket) repo connected to [Vercel](https://vercel.com).
- Node **20+** (matches `package.json` `engines`).

## One-time project setup

1. In Vercel: **Add New Project** → import this repository.
2. Framework preset: **Next.js** (default). Root directory: repository root (unless you use a monorepo subfolder).
3. Build command: `npm run build` (default). Output: Next.js default.
4. Install command: `npm install` (default).

## Environment variables

1. Copy names from the repo root [`env.example`](../../../env.example) (values are **never** committed).
2. In Vercel: **Settings → Environment Variables**, add each name for **Production** (and Preview/Development as needed).
3. For client-side keys, use the `NEXT_PUBLIC_*` names only; keep secrets server-only.

More context: [`docs/VERCEL_ENV_SETUP.md`](../../VERCEL_ENV_SETUP.md).

The Express/socket server under `server/` is **not** the Vercel serverless app. If you use a separate API host, set the frontend’s API base URL via the appropriate env vars (see `env.example`) and rewrites if configured.

## Deploy

- **Production:** merge to your production branch (often `main`) or run **Deploy** from the Vercel dashboard.
- **Preview:** open a PR; Vercel creates a preview URL automatically.

## Verify after deploy

- Smoke-test auth, API routes, and any features that depend on server env vars.
- Use Vercel **Speed Insights** / Lighthouse on the live URL to confirm LCP/CLS trends (lab scores vary from field data).
