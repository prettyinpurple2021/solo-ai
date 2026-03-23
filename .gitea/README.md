# SoloSuccess AI - Gitea Migration 🚀

This directory contains the necessary configurations for our transition from GitHub to Gitea.

## 📁 Structure

- `workflows/` - Gitea Actions (Actions-compatible)
  - `test-runner.yaml` — lint, typecheck, tests, production build on every push.
  - `deploy.yaml` — on push to `main`: quality gates + **Vercel** (Next.js) + optional **Railway** (Express `server/`).

### Railway: pick **one** deploy path (important)

| Mode | What happens | Gitea secrets |
|------|----------------|---------------|
| **A. CLI from Gitea** | After Vercel, `railway up` uploads a tarball (30s HTTP limit in official CLI). | All four `RAILWAY_*` below; leave `RAILWAY_USE_CLI_DEPLOY` **unset** or `true`. |
| **B. Git via GitHub mirror (recommended for Gitea)** | You push to Gitea → mirror updates GitHub → Railway builds from GitHub (no tarball). | Add **`RAILWAY_USE_CLI_DEPLOY`** = `false` and **remove** (or never set) the four `RAILWAY_*` secrets so the workflow does not also run `railway up`. |

**Never** use A and B on the **same** Railway service or you get **double deploys**.

---

### B) GitHub mirror + Railway (step by step)

Use this when Gitea is your main remote but Railway only integrates with **GitHub**.

1. **GitHub:** Create an empty repository (e.g. `your-org/SoloSuccess-AI-mirror`), default branch **`main`** (match Gitea).
2. **GitHub PAT:** [Fine-grained or classic token](https://github.com/settings/tokens) with **`Contents: Read and write`** on that repo (classic: `repo` scope).
3. **Gitea mirror:** Open your **Gitea** repo → **Settings** → **Repository** → **Mirrors** (or **Push Mirror**, depending on version) → add remote:
   - URL form: `https://github.com/OWNER/REPO.git`
   - Authentication: your GitHub username + PAT (or embed `https://USER:TOKEN@github.com/OWNER/REPO.git` if your Gitea version requires it).
   - Enable **push** mirroring on **`main`** (or “sync now” after each push until you confirm auto-sync).
4. **Verify:** Push a commit to Gitea `main` → confirm the same commit appears on GitHub `main` within a minute or two.
5. **Railway:** Project → your **API service** → **Settings** → connect **GitHub** → choose the **mirror** repo → branch **`main`**. Railway reads repo-root **`railway.toml`**, which sets **`dockerfilePath = "server/Dockerfile"`** (build context = repo root). No need to set a separate “Dockerfile path” unless the dashboard overrides it.
6. **Gitea Actions:** Add repository secret **`RAILWAY_USE_CLI_DEPLOY`** = `false` (exact). **Delete** `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT`, and `RAILWAY_SERVICE` if you had them, so the deploy job stays green and only Railway-on-GitHub deploys the API.

First deploy after connecting GitHub may require you to click **Deploy** once in Railway; afterwards pushes to GitHub (via mirror) trigger builds.

---

### A) Railway from Gitea via CLI (optional)

After a successful Vercel deploy, `deploy.yaml` runs `railway up --ci` from the **repository root** (no path argument — using `.` breaks the CLI tarball step with `prefix not found`). Ensure **`railway.toml`** and **`server/Dockerfile`** are in the repo; Railway **Root Directory** = repo root, **Dockerfile** = `server/Dockerfile` if not using config-as-code. Add these **repository secrets** in Gitea (**Settings → Actions → Secrets**):

| Secret | Where to get it |
|--------|------------------|
| `RAILWAY_TOKEN` | Prefer: Project → **Settings** → **Tokens** → **project** token (deploy-scoped). **Alternatively**, profile → **Account settings** → **Tokens** → personal token (what Railway’s assistant often describes) — both usually work for `railway up` in CI; project tokens are narrower in scope. |
| `RAILWAY_PROJECT_ID` | Project **Settings** → **General** → copy **Project ID**. |
| `RAILWAY_ENVIRONMENT` | Exact environment name, usually `production`. |
| `RAILWAY_SERVICE` | Service **Settings** → copy **Service ID** (recommended), or the service slug/name if Railway accepts it. |

If **any** of these four are missing, the workflow **skips** Railway and only deploys Vercel (no failure).

Optional explicit opt-out without deleting secrets: set **`RAILWAY_USE_CLI_DEPLOY`** to **`false`** — the Railway CLI step exits immediately (use with **mirror + GitHub** mode above).

**Do not** enable CLI deploy **and** Railway’s “deploy from Git” on the **same** service, or every push can trigger **two** deploys.

### If Railway step fails with `Unauthorized`

1. **Use a project token (best):** Railway dashboard → open **this project** → **Settings** → **Tokens** → create a token scoped to **this project** → paste into Gitea `RAILWAY_TOKEN`. Personal tokens from **Account settings** sometimes fail for `railway up` if the project lives under a team/workspace the token cannot access.
2. **No quotes in Gitea:** When pasting the token, do not include `"` or `'` around the value. Re-save the secret if unsure.
3. **Trim IDs:** `RAILWAY_PROJECT_ID` and `RAILWAY_SERVICE` must be plain UUIDs/IDs — no URL path, no spaces. `RAILWAY_ENVIRONMENT` must match the dropdown **exactly** (e.g. `production`).
4. The workflow sets **both** `RAILWAY_TOKEN` and `RAILWAY_API_TOKEN` from the same Gitea secret so either token type works with current CLI versions.

### If Railway step fails during `Indexing...` (Linux runner)

`railway up` walks the repo; **broken symlinks** (e.g. Windows-absolute paths in git) cause `No such file or directory`. The repo uses **`.railwayignore`** to exclude dev-only trees (`.agent`, `.cursor`, etc.). Do not commit symlinks that point outside the clone or use machine-specific absolute paths.

### If Railway fails with `operation timed out` on `backboard.railway.com` / `.../environment/.../up`

The official **`@railway/cli` HTTP client uses a 30-second timeout** on requests, including the gzip upload. Large monorepo tarballs often exceed that. This repo trims **`.railwayignore`** to the files **`server/Dockerfile`** actually `COPY`s (plus `railway.toml`). The deploy workflow also **retries `railway up` up to 3 times** with backoff. If it still fails, use **Railway’s Git integration** for the API service instead of CLI from Gitea, or run deploy from a network with faster egress to Railway.

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

### Job failed on `npm ci` with `ECONNRESET` / `network aborted`

That is the **npm registry connection dropping** inside the runner container (flaky internet, firewall, or rate limits)—not your app code. **Re-run the workflow**; `deploy.yaml` and `test-runner.yaml` retry `npm ci` up to **3** times with longer fetch timeouts. If it keeps failing, check that the host running **act_runner** can reach `https://registry.npmjs.org` (proxy/DNS/firewall).

## 🔄 Migration Status

The project is currently being migrated to a Gitea-hosted repository to ensure complete ownership and privacy of the SoloSuccess AI codebase. All CI/CD processes are being transitioned to Gitea Actions.

---
**Last Updated:** March 23, 2026  
**Status:** In Progress
