# SoloSuccess AI - Gitea Migration 🚀

This directory contains the necessary configurations for our transition from GitHub to Gitea.

## 📁 Structure

- `workflows/` - Gitea Actions (Actions-compatible)
  - `test-runner.yaml` — lint, typecheck, tests, production build on every push.
  - `deploy.yaml` — on push to `main`: quality gates + **Vercel** (Next.js) + optional **Railway** (Express `server/`).

### Railway from Gitea (optional, “wired in code”)

After a successful Vercel deploy, `deploy.yaml` can run `railway up` on the `server/` directory. Add these **repository secrets** in Gitea (**Settings → Actions → Secrets**):

| Secret | Where to get it |
|--------|------------------|
| `RAILWAY_TOKEN` | Prefer: Project → **Settings** → **Tokens** → **project** token (deploy-scoped). **Alternatively**, profile → **Account settings** → **Tokens** → personal token (what Railway’s assistant often describes) — both usually work for `railway up` in CI; project tokens are narrower in scope. |
| `RAILWAY_PROJECT_ID` | Project **Settings** → **General** → copy **Project ID**. |
| `RAILWAY_ENVIRONMENT` | Exact environment name, usually `production`. |
| `RAILWAY_SERVICE` | Service **Settings** → copy **Service ID** (recommended), or the service slug/name if Railway accepts it. |

If **any** of these four are missing, the workflow **skips** Railway and only deploys Vercel (no failure).

**Do not** enable this **and** Railway’s own “deploy from Git” on the same service, or every push can trigger **two** deploys. Pick one: **Gitea → Railway CLI** (secrets above) **or** Railway’s built-in Git integration.

## 🔄 Migration Status

The project is currently being migrated to a Gitea-hosted repository to ensure complete ownership and privacy of the SoloSuccess AI codebase. All CI/CD processes are being transitioned to Gitea Actions.

---
**Last Updated:** December 30, 2025
**Status:** In Progress
