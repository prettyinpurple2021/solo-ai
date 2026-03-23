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

### If Railway step fails with `Unauthorized`

1. **Use a project token (best):** Railway dashboard → open **this project** → **Settings** → **Tokens** → create a token scoped to **this project** → paste into Gitea `RAILWAY_TOKEN`. Personal tokens from **Account settings** sometimes fail for `railway up` if the project lives under a team/workspace the token cannot access.
2. **No quotes in Gitea:** When pasting the token, do not include `"` or `'` around the value. Re-save the secret if unsure.
3. **Trim IDs:** `RAILWAY_PROJECT_ID` and `RAILWAY_SERVICE` must be plain UUIDs/IDs — no URL path, no spaces. `RAILWAY_ENVIRONMENT` must match the dropdown **exactly** (e.g. `production`).
4. The workflow sets **both** `RAILWAY_TOKEN` and `RAILWAY_API_TOKEN` from the same Gitea secret so either token type works with current CLI versions.

### Run a workflow without committing

There is **no** one global CLI like `vercel --prod` for Gitea itself. After `workflow_dispatch` is in the YAML (see `deploy.yaml` / `test-runner.yaml`):

1. Open the **repository** on Gitea → **Actions**.
2. Click the workflow name (e.g. **SoloSuccess-Production-Deploy**).
3. Use **Run workflow** / **Dispatch workflow** (wording depends on Gitea version) and choose branch **`main`**.

**API (optional):** with a [personal access token](https://docs.gitea.com/usage/actions#personal-access-token) that has `write:actions` (or repo scope per your server):

```bash
curl -sS -X POST \
  "https://YOUR_GITEA_HOST/api/v1/repos/OWNER/REPO/actions/workflows/deploy.yaml/dispatches" \
  -H "Authorization: token YOUR_GITEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ref":"main"}'
```

Replace `YOUR_GITEA_HOST`, `OWNER`, `REPO`, and the workflow path if your Gitea version uses a different `workflows/` identifier (some use the file name under `.gitea/workflows/`).

## 🔄 Migration Status

The project is currently being migrated to a Gitea-hosted repository to ensure complete ownership and privacy of the SoloSuccess AI codebase. All CI/CD processes are being transitioned to Gitea Actions.

---
**Last Updated:** December 30, 2025
**Status:** In Progress
