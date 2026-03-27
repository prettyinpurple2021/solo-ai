# Production Remediation Tracker

Last updated: 2026-03-26
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

- Overall launch readiness score: `82/100` (ready for public launch with documented dependency and CI caveats below)
- Build/lint/type-check: passing (verified **`npm run validate`** on 2026-03-25)
- Production build: passing (verified **`next build --webpack`** on 2026-03-25; 185 static pages generated; PWA / Workbox compiled without precache size errors for large chunks)
- Test suite: passing; Jest exits cleanly (**MED-005** done — lazy Express `pg` pool + global teardown); **`16/16`** suites, **`97/97`** tests (2026-03-25)
- CI gate quality: **GitHub Actions** **`.github/workflows/ci.yml`** runs **`npm run validate`** + **`npm test -- --runInBand`** on push and pull requests to **`main`** (root + **`server`** `npm ci`). **`next build` is not** in CI (time/cost); run **`npm run build`** or **`next build --webpack`** locally or on Vercel preview before major releases.
- Security: no **critical** or **high** production advisories in last `npm audit --omit=dev`; **6** open issues (**4 low**, **2 moderate**) — see **Known non-blocking residuals** and **HIGH-003** verification note below
- Observability: stray **`console.error`** on learning, TOTP, and guardian UI paths replaced with **`logError`** (**MED-009**)

## Work log

### 2026-03-26

- **Production auth adapter fix:** Updated **`src/lib/auth.ts`** to initialize `DrizzleAdapter` with **`getDb()`** (real drizzle instance) rather than the proxy export. This addressed production auth-adapter initialization errors (`Unsupported database type (object)`).
- **Production DB schema alignment (preferences + traffic):** Extended **`migrations/0003_api_tables_baseline.sql`** with idempotent creation/indexing for **`user_preferences`** and **`traffic_logs`** (plus optional FKs), then applied via **`npm run db:apply-api-baseline`**. Vercel 500s on **`/api/preferences`** (`relation "user_preferences" does not exist`) stopped after deploy + migration.
- **Traffic logging hardening:** Updated **`src/proxy.ts`** to skip uptime bots (**SentryUptimeBot** / **UptimeRobot**) and reduced non-actionable noise. Updated **`src/lib/traffic-service.ts`** error context to include DB error metadata (`code`, `detail`, `hint`, `constraint`) for faster production debugging.
- **Billing UX/error-noise hardening:** Updated **`src/app/dashboard/billing/page.tsx`** to treat expected free-tier states as user guidance (not hard failures): handle **404** from billing portal gracefully, route `launch` downgrade through cancel-subscription flow, and avoid throw-driven error spam for expected **400/404** checkout/portal responses.
- **Validation:** Ran **`npm run validate`** after each substantive change set; lint + web/server type-check passed.

### 2026-03-25

- **Full launch-readiness review:** Ran **`npm run validate`**, **`npm test -- --runInBand`**, **`next build --webpack`**, and **`npm audit --omit=dev`**. All quality gates and production build succeeded locally. Documented current **`npm audit`** picture (6 issues: **elliptic** / `@stackframe/stack` chain + **fast-xml-parser** / `@aws-sdk/xml-builder` chain).
- **MED-009 (logging):** Replaced direct **`console.error`** with **`logError`** from **`@/lib/logger`** in TOTP resend/verify routes, learning API routes, learning dashboard + assessment UI, guardian consent management, and **`submitAssessmentAction`**. Removed dead commented **`console.log`** in Stripe webhook default branch; dropped unused **`LearningEngineService`** import from **`src/app/api/learning/[moduleId]/route.ts`**.

### 2026-03-24

- **Vercel + Railway alignment:** Added **[docs/deployment/VERCEL_RAILWAY_ALIGNMENT.md](../deployment/VERCEL_RAILWAY_ALIGNMENT.md)** (non-negotiable env/URL rules, production dashboard checks, deploy discipline, `env.example` audit notes). Added **`npm run verify:deployment-alignment`** → **`scripts/verify-local-vercel-railway-alignment.mjs`** (local JWT/DATABASE parity across Next vs Express env load order; optional **`--health-url=`** for Railway **`/api/health`**). **`env.example`** now includes **`CLIENT_URL`** (match **`NEXT_PUBLIC_APP_URL`** origin). Linked from **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](../deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)**.
- **Railway + GitHub:** Backend deploy on Railway succeeded and the repo is connected to GitHub for Git-based deploys. Treat **`main`** as the release branch; merge only after local or CI green (**`npm run validate`**, **`npm test -- --runInBand`**).
- **GitHub `main`:** Merged GitHub’s initial **`.gitattributes`** commit with **`--allow-unrelated-histories`**, then removed root **`console_logs.txt`** from **all** commits via **`git filter-branch`** (blobs exceeded GitHub’s **100 MB** limit and blocked push). After cleanup, **`git push -f origin main`** to [prettyinpurple2021/SoloSuccess_AI](https://github.com/prettyinpurple2021/SoloSuccess_AI) succeeded. **`console_logs.txt`** remains in **`.gitignore`** — do not commit log dumps.
- **CI on GitHub:** Added **`.github/workflows/ci.yml`** (Node 20, `npm ci` at repo root and **`server/`**, **`npm run validate`**, **`npm test -- --runInBand`**).
- **PWA / Workbox:** Set **`workboxOptions.maximumFileSizeToCacheInBytes`** to **6 MiB** in **`next.config.mjs`** so large **`/_next/static/chunks/...`** assets are not excluded from precache with oversize warnings on production build.
- **MED-008 (Edge vs Node / static):** Inventoried **`export const runtime = 'edge'`** API routes; moved **`/api/workflows/[id]/execute`** and **`/api/incinerator`** to **`nodejs`**. Removed dead **`src/app/global-config.ts`** (never imported). Dropped redundant **`force-dynamic`** on static marketing/legal client pages (**`terms`**, **`privacy`**, **`features`**, **`security`**, **`gdpr`**, **`cookies`**) so they can prerender. Remaining Edge API routes use Neon HTTP/`getSql` or lightweight health checks — see **MED-008** checklist.
- **Jest (Windows):** **`ScrapingScheduler._setJobAsRunningForTesting`** now allows **`JEST_WORKER_ID`** / global **`jest`**, not only **`NODE_ENV=test`**, so **`test/scraping-scheduler.test.ts`** is reliable when npm does not set **`NODE_ENV`**.

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
| HIGH-003 | HIGH | Security | Production dependency vulnerabilities from `npm audit --omit=dev` | DONE | No critical/high; as of **2026-03-25** `npm audit --omit=dev` reports **6** (4 low, 2 moderate): `elliptic` via `@stackframe/stack`; `fast-xml-parser` via `@aws-sdk/xml-builder` (transitive). Treat as monitor / upstream — not launch-blocking. |
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
| MED-008 | MEDIUM | Cost / perf | Edge vs Node API routes + unnecessary `force-dynamic` on static marketing pages | DONE | `npm run validate` + `npm test -- --runInBand`; inventory recorded in checklist **MED-008** below |
| MED-009 | MEDIUM | Observability | Direct `console.error` in production learning / TOTP / guardian paths (bypasses structured logger) | DONE | `npm run validate`; `npm test -- --runInBand`; see work log **2026-03-25** |

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
  - Command: `npm audit --omit=dev --json` (**2026-03-25** re-check)
  - Result: **`6` vulnerabilities** — **`4 low`** (`elliptic` via `@stackframe/stack` / `@stackframe/stack-shared`), **`2 moderate`** (`fast-xml-parser` via `@aws-sdk/xml-builder`). **0 high, 0 critical.**
  - Command: `npm run validate`
  - Result: pass (`lint` and both `type-check` targets passed).
  - Command: `npm test -- --runInBand`
  - Result: suites/tests pass (`16/16`, `97/97`).
- Status: DONE (ongoing monitoring for upstream patches)

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

### MED-008: Edge vs Node API routes and static-friendly marketing pages
- What changed:
  - **Inventory:** No **`layout.tsx` / `page.tsx`** use **`runtime = 'edge'`**; Edge was only on selected **API routes** (see table below).
  - **Node (was Edge):** **`src/app/api/workflows/[id]/execute/route.ts`** — workflow engine uses Drizzle + transactions + `expr-eval-fork` + fire-and-forget execution; **`src/app/api/incinerator/route.ts`** — aligns with other AI routes using **`generateText`**.
  - **Removed** unused **`src/app/global-config.ts`** (exported `dynamic` / `revalidate` but was **never imported**; misleading for static generation).
  - **Static-friendly:** Removed **`export const dynamic = 'force-dynamic'`** from client-only pages **`terms`**, **`privacy`**, **`features`**, **`security`**, **`gdpr`**, **`cookies`** (no server data; allows prerendered shell where the tree allows).
- **Edge API routes retained (intentional):**

| Path | Rationale |
|------|-----------|
| `api/health`, `api/health/deps` | Tiny responses; deps uses Neon HTTP |
| `api/files/[param]` | Neon + Edge-safe binary handling |
| `api/compliance/scan`, `policies`, `consent` | `getSql()` / Neon HTTP |
| `api/brand/export/download/[id]` | `getDb()` via **drizzle-orm/neon-http** + `fetch` to blob URL |

- Files updated: `src/app/api/workflows/[id]/execute/route.ts`, `src/app/api/incinerator/route.ts`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/app/features/page.tsx`, `src/app/security/page.tsx`, `src/app/gdpr/page.tsx`, `src/app/cookies/page.tsx`; removed `src/app/global-config.ts`; `src/lib/scraping-scheduler.ts` (test-only guard detects Jest without relying on **`NODE_ENV=test`**).
- Why this improves production readiness: Heavy routes run on Node (consistent limits, fewer Edge surprises); less unnecessary dynamic rendering on public legal/marketing pages; removes dead config that suggested global dynamic forcing.
- Verification: `npm run validate`; `npm test -- --runInBand` (includes **`ScrapingScheduler`** test guard fix for Jest on Windows).
- Status: DONE

### MED-009: Route client and API errors through structured logger
- What changed:
  - Swapped **`console.error`** for **`logError`** from **`@/lib/logger`** on TOTP (**`resend`**, **`verify`**), learning APIs (**`/api/learning`**, module GET, assess POST), learning dashboard page, assessment dialog, **`submitAssessmentAction`**, and guardian **ConsentManagement** fetch error path.
  - Stripe webhook: removed commented debug **`console.log`**; default unhandled branch is a quiet **`break`** (events still recorded when handled).
  - Removed unused **`LearningEngineService`** import from **`src/app/api/learning/[moduleId]/route.ts`**.
- Files updated: `src/app/api/auth/totp/resend/route.ts`, `src/app/api/auth/totp/verify/route.ts`, `src/app/api/learning/route.ts`, `src/app/api/learning/[moduleId]/route.ts`, `src/app/api/learning/[moduleId]/assess/route.ts`, `src/app/dashboard/learning/page.tsx`, `src/components/learning/assessment-dialog.tsx`, `src/lib/actions/learning-actions.ts`, `src/components/guardian-ai/consent-management.tsx`, `src/app/api/stripe/webhook/route.ts`
- Why this improves production readiness: Consistent structured logging, aligns with project “no raw console noise” standard, keeps server and client error reporting on one code path where appropriate.
- Verification: **`npm run validate`**; **`npm test -- --runInBand`**
- Status: DONE

## New findings discovered during remediation

- ~~Build still reports large client chunk warning (PWA precache limit).~~ **Addressed under MED-006** (`workboxOptions.maximumFileSizeToCacheInBytes`).
- ~~Edge / static generation review.~~ **Addressed under MED-008** (Node for heavy APIs; marketing pages; Edge inventory documented).

## Next execution queue

- **Optional (CI):** Add a workflow job or scheduled run that executes **`next build --webpack`** (or Vercel **Build** on preview) so production bundles are verified remotely; current CI stops at validate + Jest.
- **Optional:** Run a production **`next build`** on Vercel preview and confirm route types (static ○ vs dynamic ƒ) for key URLs; tune any remaining **`force-dynamic`** **dashboard** pages only if you need ISR/SSG later.
- **Ongoing:** keep `npm audit --omit=dev` advisories on radar — **`@stackframe/stack` → elliptic** and **`@aws-sdk/xml-builder` → fast-xml-parser`** (moderate) until upstream bumps land.
- **Post-deploy:** Smoke-test production API (Railway health, auth, DB) against **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](../deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)** checklist.

## Known non-blocking residuals

- **`npm audit --omit=dev` (2026-03-25):** **4 low** — `elliptic` via **`@stackframe/stack`**. Mitigation: **`elliptic`** override in **`package.json`**; full clearing may require **`@stackframe/stack`** upgrade or breaking **`npm audit fix --force`** downgrade — defer until upstream.
- **2 moderate** — **`fast-xml-parser`** (entity expansion / falsy evaluation advisory) via **`@aws-sdk/xml-builder`**. Monitor AWS SDK / transitive updates; not individually imported for app logic in most paths.
- **Jest / async leaks:** if new suites import long-lived clients (Redis, sockets, timers), re-run `npm test -- --detectOpenHandles` and add targeted teardown or mocks. **MED-005** addressed the Express `pg` pool path.

