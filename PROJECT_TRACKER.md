# PROJECT_TRACKER.md

**Last updated:** 2026-05-20  
**Authoritative launch status:** [docs/reports/PRODUCTION_REMEDIATION_TRACKER.md](docs/reports/PRODUCTION_REMEDIATION_TRACKER.md) (score, CRIT/HIGH/MED queue, verification)  
**Visual roadmap:** [docs/reports/VISUAL_PUBLIC_LAUNCH_ROADMAP.md](docs/reports/VISUAL_PUBLIC_LAUNCH_ROADMAP.md)

This file tracks **verified, still-open** product and code-quality work. The December 2025 checklist below was largely remediated; items marked **Resolved** were re-checked against the repo on **2026-05-20** and removed from the active queue.

---

## Launch-blocking (must complete before public launch)

| ID | Issue | Status | Action |
| --- | --- | --- | --- |
| **CRIT-008** | `.env.production` was once in **git history**; most credentials **rotated ~2026-04-27–05-17** (see runbook checkmarks) | **IN_PROGRESS** | Follow [CRIT-008_FINISH_CHECKLIST.md](docs/reports/CRIT-008_FINISH_CHECKLIST.md) (Zoho SMTP → reCAPTCHA → optional tail → git scrub → smoke). App email migrated off Resend to Zoho Mail SMTP — see [ZOHO_MAIL_SMTP_SETUP.md](docs/deployment/ZOHO_MAIL_SMTP_SETUP.md). |

**Readiness score:** **82/100** until CRIT-008 is fully closed (rotation tail + history scrub + verifications). Rotating keys does **not** mean “exposed again” — it means old leaked values should no longer work if rotation completed.

**Not re-exposed (as of 2026-05-20):** No new commit of `.env` / `.env.production` found in recent history; `.gitignore` still blocks env files. **Still at risk:** old values may remain in **git history** until Phase 5 scrub; any secret ever pasted into docs must be treated as compromised (runbook redacted 2026-05-20).

---

## Active code-quality & polish (non-blocking for compile, but real debt)

### Environment & scripts

- [x] **`scripts/verify-websocket.ts`** — Uses `process.env.STRIPE_SECRET_KEY` when set (no hardcoded dummy key).
- [ ] **`scripts/optimize-images-simple.mjs` (lines 102–116)** — When ImageMagick is missing, copies originals as “placeholder” optimized files instead of failing. Prefer non-zero exit in CI/production image pipelines so missing tooling is obvious.
- [ ] **`scripts/patch-stripe.js`** — Postinstall stub labeled “placeholder”; either document as intentional no-op or delete if unused.

### UI / content / SEO

- [ ] **`src/app/layout.tsx` (line 244)** — Comment `{/* Search engine verification placeholders */}`; add real Google/Bing verification meta tags when you have tokens, or remove the comment block.
- [ ] **`src/lib/collaboration-hub.ts` (line 462)** — Comment still mentions simulating placeholder collaboration data; confirm production path never uses fake data and delete or implement real fetch-only behavior.
- [ ] **Design system colors** — Many components still use raw hex instead of Tailwind semantic tokens (`tailwind.config.ts`). Ongoing refactor; not launch-blocking if visuals are acceptable.

### Documentation / process

- [ ] **`env.example`** — Keep placeholder values only; production secrets live in Vercel/Railway dashboards (team process, not a code change).

---

## Operator verification (you run on live preview/production)

These are **procedures**, not repo defects. Evidence tables live in the linked runbooks.

- [ ] **Launch smoke tests** — [docs/reports/LAUNCH_SMOKE_TEST_RUNBOOK.md](docs/reports/LAUNCH_SMOKE_TEST_RUNBOOK.md) (`npm run smoke` against preview/prod URL)
- [ ] **Monitoring dry run** — [docs/deployment/MONITORING_VERIFICATION.md](docs/deployment/MONITORING_VERIFICATION.md)

---

## Resolved (2026-05-20 verification — no longer open)

| Former item | Verdict |
| --- | --- |
| `course-player.tsx` placeholder module content | **Resolved** — Renders `activeModule.content` via `ReactMarkdown` / quiz flow |
| `use-subscription.ts` TODOs / hardcoded billing fields | **Resolved** — Hook uses API-backed `Subscription` shape; no TODOs at former lines |
| `MessageInterface.tsx` `handleDelete` stub | **Resolved** — `DELETE` to `/api/collaboration/sessions/.../messages/...` (file: `src/components/collaboration/MessageInterface.tsx`) |
| `server-polyfills.ts` `File.stream()` throws | **Resolved** — `ReadableStream` implementation present |
| `src/sanity/lib/client.ts` placeholder project/dataset | **Resolved** — Path removed; no `placeholder-project-id` / `placeholder-dataset` in repo |
| `landing-sections.tsx` `href="#"` dead links | **Resolved** — Footer/platform links use `#features`, `#agents`, `#pricing`, `/contact`, etc. |
| `email-campaign-builder.tsx` dead `#` CTAs | **Resolved** — Listed path not present; no matching open file in tree |

---

## Current engineering baseline (verified 2026-05-20)

| Check | Result |
| --- | --- |
| `npm run validate` (lint + type-check) | Pass |
| CI `.github/workflows/ci.yml` | `validate` + Jest + `next build --webpack` on PR/push to `main` |
| `npm audit --omit=dev` (root) | **0 critical / 0 high**; residual **low** (`elliptic` / `@stackframe/stack`) and **moderate** (`brace-expansion` in some transitive paths) — track via Dependabot / overrides |
| `server/` / `railway-deploy/` audit | **0 vulnerabilities** (per production tracker) |
| PWA / Workbox dev advisory chain | **Resolved** (2026-03-29 `serialize-javascript` override) |

For historical findings archive, see [docs/reports/COMPREHENSIVE_AUDIT_REPORT.md](docs/reports/COMPREHENSIVE_AUDIT_REPORT.md).
