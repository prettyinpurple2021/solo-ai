# Roadmap

High-level direction only; delivery order follows **[docs/reports/PRODUCTION_REMEDIATION_TRACKER.md](docs/reports/PRODUCTION_REMEDIATION_TRACKER.md)** and product priorities.

## Phase 1 — Launch / stabilize

- Keep CI green (`validate` + Jest on `main`); run full **`npm run build`** or Vercel build before major releases.
- Monitoring: structured logging (`@/lib/logger`), optional `LOG_INGEST_URL`, error tracking if configured.
- Harden billing path: Stripe webhooks, subscription tier on user record, and **`subscription-utils`** / gating aligned after price or tier changes.

## Phase 2 — Growth / features

- Deeper analytics and usage visibility for founders.
- Agent and template expansion where subscription tiers support it (see **`AGENT_ACCESS`** in **`subscription-utils.ts`**).

## Phase 3 — Scale

- Cost and performance as usage grows (DB indexes, caching, background jobs).
- API / integration surface where it supports partnerships (without rushing public API before product fit).

---

*Previously this file was corrupted by an automated audit script that merged checklist content and stray markdown fences. The launch checklist now lives in **LAUNCH_CHECKLIST.md**; this file is roadmap-only.*
