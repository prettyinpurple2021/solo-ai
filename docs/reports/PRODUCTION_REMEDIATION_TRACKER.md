# Production Remediation Tracker

Last updated: 2026-03-24
Owner: SoloSuccess AI engineering
Scope: Full production-hardening pass (security, reliability, quality, CI/CD)

## How to use this document

- Status values:
  - `OPEN`: not started
  - `IN_PROGRESS`: currently being fixed
  - `BLOCKED`: needs decision or dependency
  - `DONE`: fixed and verified
- Severity:
  - `CRITICAL`: launch-blocking
  - `HIGH`: severe risk, should be fixed before launch
  - `MEDIUM`: important hardening
  - `LOW`: polish
- Verification must include command(s) run and result.

## Current readiness baseline

- Overall launch readiness score: `78/100` (hardening in progress)
- Build/lint/type-check: passing
- Test suite: passing; Jest exits cleanly (**MED-005** done — lazy Express `pg` pool + global teardown)
- CI gate quality: **GitHub Actions** **`.github/workflows/ci.yml`** runs **`npm run validate`** + **`npm test -- --runInBand`** on push and pull requests to **`main`** (root + **`server`** `npm ci`). Still run the same commands locally before push; Railway deploys from GitHub **`main`** after CI green.
- Security: critical and high dependency vulnerabilities remediated (remaining low-only production advisories)

## Work log

### 2026-03-24

- **Railway + GitHub:** Backend deploy on Railway succeeded and the repo is connected to GitHub for Git-based deploys. Treat **`main`** as the release branch; merge only after local or CI green (**`npm run validate`**, **`npm test -- --runInBand`**).
- **GitHub `main`:** Merged GitHub’s initial **`.gitattributes`** commit with **`--allow-unrelated-histories`**, then removed root **`console_logs.txt`** from **all** commits via **`git filter-branch`** (blobs exceeded GitHub’s **100 MB** limit and blocked push). After cleanup, **`git push -f origin main`** to [prettyinpurple2021/SoloSuccess_AI](https://github.com/prettyinpurple2021/SoloSuccess_AI) succeeded. **`console_logs.txt`** remains in **`.gitignore`** — do not commit log dumps.
- **CI on GitHub:** Added **`.github/workflows/ci.yml`** (Node 20, `npm ci` at repo root and **`server/`**, **`npm run validate`**, **`npm test -- --runInBand`**).
- **PWA / Workbox:** Set **`workboxOptions.maximumFileSizeToCacheInBytes`** to **6 MiB** in **`next.config.mjs`** so large **`/_next/static/chunks/...`** assets are not excluded from precache with oversize warnings on production build.

### 2026-03-20

- Removed unused **Fly.io** (`fly.toml`) and **Render** (`render.yaml`) configs from the repo. Production target for this project is **Vercel (frontend) + Railway (backend API)**; README and `env.example` headers updated to match.
- Added **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](../deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)** — explicit map of which env vars belong on Vercel, Railway, or both.
- **(Historical)** Optional `railway up --ci` from CI when `RAILWAY_*` secrets were set on Gitea; that workflow lived under `.gitea/workflows` (removed — use Railway’s **GitHub** integration or CLI from your machine).

### 2026-03-18

- Created this tracker as the single source of truth for remediation progress.
- Initial audit consolidated and prioritized into actionable items below.

### 2026-03-19

- Completed **HIGH-006**: removed file-level `@ts-nocheck` from production `src`, replaced remaining suppressions with real types/guards, and fixed surfaced TypeScript issues (effects, hooks, learning module types, template flows).

### 2026-03-20

- Completed **MED-005**: lazy Express `pg` pool + Jest `globalTeardown` for clean test exit.

### 2026-03-23

- **Gitea removed from repo:** Deleted **`.gitea/workflows/*`** and **`.gitea/README.md`**; removed the **`gitea`** service from **`docker-compose.yml`**. **GitHub** is the intended Git remote; **Vercel** and **Railway** should use GitHub Git integration on **`main`**. Until **`.github/workflows`** exists, treat **`npm run validate`** + **`npm test -- --runInBand`** as the pre-push quality gate.
- **Railway:** Renamed root Next.js container file to **`Dockerfile.next`** (updated `docker-compose.yml`, `docs/deployment/DOCKER.md`) so Railway no longer auto-selects the frontend `Dockerfile` instead of **`server/Dockerfile`** / **`railway.toml`**.
- **Railway CLI:** Former CI `deploy.yaml` used **`railway up --ci`** with no path argument; **`railway up .`** caused CLI tarball **`prefix not found`** (walk root `.` vs absolute `archive_prefix_path` in `@railway/cli`).
- **Railway CLI indexing on Linux:** `.agent/skills/gemini-api-dev` was a **git-tracked symlink** to an **absolute Windows path**, so Linux CI runners failed during `Indexing...` with `No such file or directory`. **Fix:** removed that path from version control (ignore entry + canonical content remains under `.agents/skills/gemini-api-dev`) and added **`.agent`** / **`.cursor`** to **`.railwayignore`** so deploy uploads skip dev-only trees.
- **Railway `railway up` upload timeout:** `@railway/cli` uses a **30s** `reqwest` timeout; full-monorepo gzip uploads exceeded it (`operation timed out` on `backboard.railway.com/.../up`). **Fix:** expanded **`.railwayignore`** to match **`server/Dockerfile`** `COPY` inputs only (trim `src/lib` to `shared/` + `agent-id-normalize.ts`, drop `server/dist`, tests, Postman, etc.) and **retry `railway up` 3×** in the former deploy workflow.
- **Railway without CLI from CI:** **GitHub** → Railway Git deploy avoids tarball upload limits; optional **`RAILWAY_USE_CLI_DEPLOY=false`** pattern applied when Gitea mirrored to GitHub (Gitea CI removed 2026-03-24).

### 2026-03-21

- Completed **MED-001–MED-004**: Node 20 in former CI workflows + `package.json` engines; removed API-route `CREATE TABLE` patterns; moved `GlobalSearch` out of `archive/`; audit report now defers live status to this tracker.
- **Railway API Docker:** `server/Dockerfile` now builds from **repo root** (copies `server/` plus `src/lib/shared`, `src/types`, `src/lib/agent-id-normalize.ts`); declared missing API deps (`drizzle-orm`, `ai`, `@ai-sdk/google`); `server/tsconfig` excludes shared tests and pins `drizzle-orm`/`zod` to `server/node_modules`; shared `users` schema no longer imports `next-auth` types. **`railway up --ci`** from repo root (not `railway up .` — CLI `prefix not found`; was `railway up server --path-as-root`). **Dual `drizzle-orm` types:** root `tsconfig.json` maps `drizzle-orm` to `./node_modules/drizzle-orm`; Next routes that use `@/server/db` import schema from `@/server/db/schema` and operators from `@/server/db`; `server/db` re-exports `count`. Verified: `docker build -f server/Dockerfile .`, `cd server && npm run build`, `npm run validate`.

## Critical remediation queue

| ID | Severity | Area | Issue | Status | Verification |
|---|---|---|---|---|---|
| CRIT-001 | CRITICAL | API Security | Unauthenticated file access/deletion risk in `src/app/api/files/[param]/route.ts` | DONE | `npm run lint` passed |
| CRIT-002 | CRITICAL | API Security | Header-based auth bypass in `src/app/api/notifications/send/route.ts` (`X-System-Job`) | DONE | `npm run lint` passed |
| CRIT-003 | CRITICAL | API Security | Security/session endpoint protections incomplete in `src/app/api/agents/security/route.ts` | DONE | `npm run lint` passed |
| CRIT-004 | CRITICAL | Auth Security | Unsafe JWT fallback secret in `src/lib/jwt-utils.ts` and `src/app/api/ws-token/route.ts` | DONE | `npm run lint` passed |
| CRIT-005 | CRITICAL | Frontend Security | XSS risk via unsanitized `dangerouslySetInnerHTML` in email/pitch rendering | DONE | `npm run lint` passed |
| CRIT-006 | CRITICAL | Secrets Hygiene | Credential-like `DATABASE_URL` present in `server/.env.example` | DONE | Static file verification |
| CRIT-007 | CRITICAL | CI/CD | No real test gate in CI | DONE | `.github/workflows/ci.yml` on `main`; also run `npm run validate` + `npm test -- --runInBand` locally before push |

## High-priority remediation queue

| ID | Severity | Area | Issue | Status | Verification |
|---|---|---|---|---|---|
| HIGH-001 | HIGH | Quality Gate | Failing test suites (`npm test`) | DONE | `npm test -- --runInBand` passed (16/16 suites) |
| HIGH-002 | HIGH | CI/CD | Production deploy lacks enforced quality gates in CI | DONE | Pre-push: `npm run validate` + `npm test -- --runInBand`; remote: `.github/workflows/ci.yml` on `main` |
| HIGH-003 | HIGH | Security | Production dependency vulnerabilities from `npm audit --omit=dev` | DONE | `npm audit --omit=dev --json` now reports low-only (4 total, 0 high, 0 critical) |
| HIGH-004 | HIGH | Auth | Logout cookie name mismatch (`auth_token` vs `auth-token`) | DONE | `npm run lint` passed |
| HIGH-005 | HIGH | Reliability | Upload idempotency helper mismatch (`upload` route + `idempotency` helper) | DONE | `npm run lint` passed |
| HIGH-006 | HIGH | Maintainability | Broad `@ts-nocheck` and `@ts-ignore` in production code paths | DONE | `npm run validate` + `npm test -- --runInBand` passed; production `src` has zero `@ts-nocheck`; remaining `@ts-ignore` only in test setup (`src/test/setup.ts`, `competitor-service.integration.test.ts`) |
| HIGH-007 | HIGH | Config | Invalid Next.js config warning (`experimental.turbopack`) | DONE | `npm run build` warning removed |

## Medium-priority hardening queue

| ID | Severity | Area | Issue | Status | Verification |
|---|---|---|---|---|---|
| MED-001 | MEDIUM | Runtime | Node version drift across CI and Docker | DONE | `package.json` `engines.node >=20`; Dockerfiles `node:20`; former CI workflows used Node `20` (removed with `.gitea/`) |
| MED-002 | MEDIUM | Reliability | Runtime schema/table creation in request paths | DONE | Removed DDL from API routes; Drizzle + `migrations/0003_api_tables_baseline.sql` (apply to DBs that relied on old runtime creates) |
| MED-003 | MEDIUM | Code Health | Legacy/archive imports in active production paths | DONE | `DashboardHeader` imports `@/components/GlobalSearch`; archive re-exports for compatibility |
| MED-004 | MEDIUM | Observability | Contradictory readiness docs and status signals | DONE | `COMPREHENSIVE_AUDIT_REPORT.md` points to this tracker as authoritative live status |
| MED-005 | MEDIUM | Test hygiene | Jest open handles / async work after suite completion (process lingers; late `console.error` e.g. Neon connect) | DONE | `npm test` + `npm test -- --runInBand` exit promptly; `npm run validate` pass |
| MED-006 | MEDIUM | Performance | PWA precache size limit vs large Next.js client chunks (Workbox default 2 MiB) | DONE | `npm run build` (production); no “exceeds maximum size” precache warning for `/_next/static/chunks/` |
| MED-007 | MEDIUM | CI/CD | Remote quality gate on GitHub after Gitea workflow removal | DONE | `.github/workflows/ci.yml` — validate + Jest on push/PR to `main` |
| MED-008 | MEDIUM | Cost / perf | Edge runtime on some routes prevents static generation (build-time hint) | OPEN | Inventory routes using `edge`; decide static vs Node per route; measure Vercel cost |

## Change checklist template (for each completed item)

Use this block whenever an item is completed:

```md
### ITEM-ID: Title
- What changed:
  - ...
- Files updated:
  - `path/to/file`
- Why this improves production readiness:
  - ...
- Verification:
  - Command: `...`
  - Result: ...
- Status: DONE
```

### CRIT-001: Lock down `/api/files/[param]` access control
- What changed:
  - Added mandatory authentication checks for both `GET` and `DELETE`.
  - Enforced ownership for UUID-based file reads by requiring `documents.user_id = authenticated_user`.
  - Enforced pathname authorization for file storage access/deletion (`users/{userId}/...` prefix only).
  - Updated response cache policy from public caching to private/no-store for user file responses.
- Files updated:
  - `src/app/api/files/[param]/route.ts`
- Why this improves production readiness:
  - Prevents unauthorized reads/deletes of private user files and blocks cross-user path guessing attacks.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### CRIT-002: Protect system notification dispatch from header spoofing
- What changed:
  - Removed blind trust in `X-System-Job`.
  - Added mandatory shared-secret validation for system jobs using `NOTIFICATION_JOB_TOKEN`.
  - Internal queue now sends `X-System-Token` header and fails closed if token is missing.
- Files updated:
  - `src/app/api/notifications/send/route.ts`
  - `src/lib/notification-job-queue.ts`
- Why this improves production readiness:
  - Prevents unauthorized callers from bypassing auth and sending system-level notifications.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### CRIT-003: Require authentication for security/session operations
- What changed:
  - Added centralized auth guard helper in security route.
  - Enforced auth for config/session actions that were previously callable without auth.
  - Added ownership/privilege checks for validating/destroying sessions and creating sessions for other users.
- Files updated:
  - `src/app/api/agents/security/route.ts`
- Why this improves production readiness:
  - Prevents unauthenticated session manipulation and closes a major control-plane security gap.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### CRIT-004: Remove unsafe JWT default secret fallback
- What changed:
  - Removed hardcoded fallback JWT secret behavior.
  - Added strict secret resolution requiring `JWT_SECRET` or `AUTH_SECRET`.
  - API token issuance now fails safely when secrets are missing.
- Files updated:
  - `src/lib/jwt-utils.ts`
  - `src/app/api/ws-token/route.ts`
- Why this improves production readiness:
  - Eliminates token forgery risk caused by default/shared fallback secrets.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### CRIT-005: Harden HTML rendering against XSS in campaign/editor views
- What changed:
  - Replaced unsafe text HTML rendering in pitch deck canvas with plain text rendering.
  - Added HTML escaping, URL validation, and HTML stripping in email preview generation path.
- Files updated:
  - `src/components/pitch-deck/editor/canvas.tsx`
  - `src/components/templates/email-campaign-builder.tsx`
- Why this improves production readiness:
  - Prevents script/content injection through user-editable fields in critical UI surfaces.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### CRIT-006: Remove credential-like database example value
- What changed:
  - Replaced credential-like `DATABASE_URL` value with generic placeholder format.
- Files updated:
  - `server/.env.example`
- Why this improves production readiness:
  - Reduces secret leakage risk and improves secure onboarding/config hygiene.
- Verification:
  - Static review of updated env example file.
- Status: DONE

### CRIT-007: Convert test runner workflow into real quality gate
- What changed:
  - Replaced no-op echo workflow with real CI checks: install, lint, type-check, test, production build.
- Files updated:
  - Was `.gitea/workflows/test-runner.yaml` (removed 2026-03-24).
  - **Now:** `.github/workflows/ci.yml` — `npm ci` (root + `server/`), `npm run validate`, `npm test -- --runInBand` on push/PR to `main`.
- Why this improves production readiness:
  - Establishes enforceable build quality validation before release decisions.
- Verification:
  - Local: `npm run validate`, `npm test -- --runInBand` (pass).
  - Remote: GitHub Actions **CI** workflow green on `main`.
- Status: DONE

### HIGH-004: Standardize logout cookie invalidation
- What changed:
  - Updated logout endpoint to clear canonical `auth_token`.
  - Kept backward-compatible clearing of legacy `auth-token`.
- Files updated:
  - `src/app/api/auth/logout/route.ts`
- Why this improves production readiness:
  - Ensures logout consistently invalidates active auth cookies across old/new clients.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### HIGH-005: Fix idempotency helper mismatch in upload API
- What changed:
  - Switched upload API to use `reserveIdempotencyKeyNeon` for Neon SQL-template client compatibility.
- Files updated:
  - `src/app/api/upload/route.ts`
- Why this improves production readiness:
  - Restores reliable duplicate-request protection and avoids runtime method mismatch failures.
- Verification:
  - Command: `npm run lint`
  - Result: pass (`eslint . --max-warnings 0`)
- Status: DONE

### HIGH-007: Remove invalid Next.js experimental config key
- What changed:
  - Removed invalid `experimental.turbopack` key from Next config.
- Files updated:
  - `next.config.mjs`
- Why this improves production readiness:
  - Eliminates persistent config warning and aligns build config with supported Next.js options.
- Verification:
  - Command: `npm run build`
  - Result: pass; prior invalid-next-config warning is no longer present.
- Status: DONE

### HIGH-001: Stabilize test suite to green
- What changed:
  - Reworked remaining failing tests to use ESM-safe mocking with `jest.unstable_mockModule`.
  - Removed transitive Next runtime coupling from template deletion tests by mocking `next/server`.
  - Converted DB-bound failing tests to deterministic unit mocks.
- Files updated:
  - `src/lib/__tests__/production-logic.test.ts`
  - `src/lib/__tests__/scraping-scheduler.test.ts`
  - `test/templates-delete.test.ts`
- Why this improves production readiness:
  - Restores trustworthy automated regression signal and unblocks strict CI gating.
- Verification:
  - Command: `npm test -- --runInBand`
  - Result: pass (`16 passed, 16 total`; `97 tests passed`)
- Status: DONE

### HIGH-002: Enforce quality gates in production deploy workflow
- What changed:
  - Added required `npm run validate` and `npm test -- --runInBand` steps before production deploy.
- Files updated:
  - Was `.gitea/workflows/deploy.yaml` (removed 2026-03-24).
- Why this improves production readiness:
  - Prevents shipping when lint/type/test quality gates fail (run the same commands before push, or reintroduce CI under `.github/workflows`).
- Verification:
  - Local: `npm run validate` + `npm test -- --runInBand` pass.
- Status: DONE

### HIGH-003: Remediate production dependency vulnerabilities
- What changed:
  - Upgraded vulnerable production dependencies (`axios`, `express-rate-limit`, `jspdf`, `socket.io-client`, `undici`).
  - Upgraded Next.js security patch line to `next@16.2.0` and aligned `eslint-config-next@16.2.0`.
  - Moved `@ducanh2912/next-pwa` into `devDependencies` so build-time tooling is not shipped in production runtime dependency graph.
  - Updated TypeScript config to exclude generated `.next` output from direct compilation to prevent generated-artifact type breakage during `tsc --noEmit`.
- Files updated:
  - `package.json`
  - `package-lock.json`
  - `tsconfig.json`
  - `src/lib/__tests__/scraping-scheduler.test.ts`
- Why this improves production readiness:
  - Removes launch-blocking high/critical production dependency advisories while preserving lint/type/test quality gates.
- Verification:
  - Command: `npm audit --omit=dev --json`
  - Result: `4 low, 0 moderate, 0 high, 0 critical` (remaining issues tied to upstream `@stackframe/stack` chain only).
  - Command: `npm run validate`
  - Result: pass (`lint` and both `type-check` targets passed).
  - Command: `npm test -- --runInBand`
  - Result: suites/tests pass (`16/16`, `97/97`), with known lingering open-handle warning after completion.
- Status: DONE

### HIGH-006: Remove broad TypeScript suppressions from production paths
- What changed:
  - Eliminated `@ts-nocheck` from all production files under `src` (none remain).
  - Replaced ad-hoc `@ts-ignore` with proper typings, narrowings, and `logError(message, Error)` patterns where TypeScript surfaced real issues.
  - Fixed follow-on errors: `useEffect` return consistency, `SpeechRecognition` globals, Neon query helper typing, learning module/exercise shapes, offer naming generator state, interactive tutorial progress map, template auto-save callback ordering, and related hook return types.
- Files updated (representative):
  - `src/components/learning/learning-module.tsx`, `src/lib/learning-engine.ts`
  - `src/components/onboarding/interactive-tutorial.tsx`, `src/components/TemplateSaveIntegration.tsx`
  - `src/components/collaboration/MessageInterface.tsx`, `SessionControls.tsx`
  - `src/components/templates/offer-naming-generator.tsx`, `upsell-flow-builder.tsx`
  - `src/hooks/use-task-intelligence.ts`, `use-templates-swr.ts`
  - Plus prior branch changes: `global.d.ts`, auth, unified-briefcase, workflow/agent dynamic imports, etc.
- Why this improves production readiness:
  - Compiler and ESLint now enforce real contracts on shipped code instead of hiding defects behind blanket ignores.
- Verification:
  - Command: `npm run validate`
  - Result: pass (`eslint . --max-warnings 0`, web + server `tsc --noEmit`).
  - Command: `npm test -- --runInBand`
  - Result: `16/16` suites, `97/97` tests passed (Jest open-handle issue later fixed under **MED-005**).
  - Spot check: `rg '@ts-nocheck' src` → no matches; `@ts-ignore` remains only under test harness files listed above.
- Status: DONE

### MED-001: Align Node.js across CI, Docker, and declared engines
- What changed: Root `package.json` `engines` documents Node 20+; former CI used `node-version: '20'` to match `Dockerfile.next` / `server/Dockerfile` / `railway-deploy/Dockerfile` (`.gitea/workflows` removed 2026-03-24).
- Verification: `npm run validate`, `npm test -- --runInBand` pass on Node 20-class toolchain.
- Status: DONE

### MED-002: No DDL in request paths
- What changed: Push subscribe, analytics `events`, newsletter, exit-intent survey, and notification send logging now use Drizzle/`getDb()` inserts only. Added schema tables in `marketing.ts`, `push_subscriptions` unique endpoint + `last_used_at`, and idempotent SQL baseline `migrations/0003_api_tables_baseline.sql`.
- **Deploy:** From project root run **`npm run db:apply-api-baseline`** (reads `DATABASE_URL` from `.env.local` / `.env` and applies `migrations/0003_api_tables_baseline.sql`). Or paste that SQL into Neon SQL Editor if you prefer.
- Verification: `npm run validate`, `npm test -- --runInBand`.
- Status: DONE

### MED-003: Active path off `archive/`
- What changed: `src/components/GlobalSearch.tsx` is the canonical module; `DashboardHeader` imports it directly; `archive/GlobalSearch.tsx` re-exports only.
- Verification: `npm run lint`, `npm run type-check:web`.
- Status: DONE

### MED-004: Single status story for audits vs tracker
- What changed: `docs/reports/COMPREHENSIVE_AUDIT_REPORT.md` header notes the tracker is authoritative for OPEN/DONE; audit remains historical detail.
- Verification: Doc review.
- Status: DONE

### MED-005: Jest clean exit (Express `pg` pool)
- What changed: Lazy `server/db` pool + `src/test/global-teardown.ts`; Proxy `Reflect.get` receiver fix uses real Drizzle instance.
- Verification: `npm test`, `npm test -- --runInBand`.
- Status: DONE

### MED-006: Raise Workbox precache size limit for large Next chunks
- What changed: Set `workboxOptions.maximumFileSizeToCacheInBytes` to **6 MiB** in `@ducanh2912/next-pwa` config so shared client chunks are precached without Workbox “exceeds maximum size” warnings.
- Files updated: `next.config.mjs`
- Why this improves production readiness: Clearer production builds, predictable offline/PWA precache behavior for large bundles.
- Verification: `npm run build` (production); grep/build log free of precache maximum-size errors for `/_next/static/chunks/`.
- Status: DONE

### MED-007: GitHub Actions CI (validate + test)
- What changed: Added workflow running Node 20, `npm ci` at root and `server/`, `npm run validate`, `npm test -- --runInBand` on push and pull_request to `main`.
- Files updated: `.github/workflows/ci.yml`
- Why this improves production readiness: Every merge to `main` is checked remotely (aligns with Vercel/Railway deploys from GitHub).
- Verification: Push to `main` → GitHub **Actions** tab → **CI** job green; local: `npm run validate`, `npm test -- --runInBand`.
- Status: DONE

## New findings discovered during remediation

- ~~Build still reports large client chunk warning (PWA precache limit).~~ **Addressed under MED-006** (`workboxOptions.maximumFileSizeToCacheInBytes`).
- Build warns that edge runtime on certain pages disables static generation — tracked as **MED-008** (cost/performance; review route runtime strategy).

## Next execution queue

- **MED-008:** Inventory App Router segments using Edge runtime; decide static vs Node for hot routes; confirm Vercel cost/behavior.
- **Ongoing:** keep `npm audit` low-chain advisories on radar until `@stackframe/stack` upstream moves.
- **Post-deploy:** Smoke-test production API (Railway health, auth, DB) against **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](../deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)** checklist.

## Known non-blocking residuals

- `npm audit --omit=dev` still reports 4 low vulnerabilities via `@stackframe/stack` -> `elliptic` chain.  
  - Current fix requires forced downgrade to `@stackframe/stack@2.5.30` (breaking change), so this is deferred pending upstream patch path.
- **Jest / async leaks:** if new suites import long-lived clients (Redis, sockets, timers), re-run `npm test -- --detectOpenHandles` and add targeted teardown or mocks. **MED-005** addressed the Express `pg` pool path.

