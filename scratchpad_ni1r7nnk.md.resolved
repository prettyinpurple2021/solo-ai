# Task Checklist
- [x] Open `http://localhost:3002` (Outcome: Renders black page, Next.js not fully initialized)
- [x] Log in or create a test account (Failed: /login times out or 404s, UI not visible)
- [ ] Test Navigation: (Blocked: Sidebar/Dashboard menu links not present/rendered)
    - [ ] Intelligence
    - [ ] Workflows
    - [ ] Competitors
    - [ ] Nexus
    - [ ] War Room
- [ ] Test Creation Forms: (Blocked)
- [x] Report Findings: (Completed: Total failure to load UI)

## Findings
- `http://localhost:3002/` is consistently black/blank.
- `BAILOUT_TO_CLIENT_SIDE_RENDERING` found in HTML source.
- `window.__NEXT_DATA__` is "Not initialized".
- Direct routes like `/login`, `/intelligence`, `/nexus`, `/dashboard` result in 404 or persistent timeouts.
- JS/CSS chunks load (200 OK), but the app fails to be interactive.
- Suspected cause: Schema change from integer to UUID broke server-side rendering or initial data fetch for key components, causing a silent crash or infinite hang in the rendering process.
- No UI screens seen with "Internal Server Error" text; instead, the entire viewport remains black (bg-dark-bg).
