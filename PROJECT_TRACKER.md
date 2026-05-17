# 🔳 PROJECT_TRACKER.MD

A comprehensive checklist to track and remediate all production-readiness violations. Inspired by a Liquid Neo-Brutalism structure for clarity and action.

---

## 📋 **INCOMPLETE CODE & PLACEHOLDERS**

*This section tracks all `TODO`, `FIXME`, and placeholder comments indicating incomplete features.*

- [ ] **File:** `src/components/academy/course-player.tsx`
    - **Line:** 186
    - **Issue:** Placeholder content is used for a course module.
    - **Action:** Replace the static `<p>` tag with a dynamic component that renders the actual course module content (rich text, images, interactive elements) fetched from the backend.

- [ ] **File:** `src/lib/collaboration-hub.ts`
    - **Line:** 462
    - **Issue:** Comment indicates a potential fallback to placeholder logic for loading collaboration contexts.
    - **Action:** Remove the simulation logic comment and ensure the system exclusively relies on fetching real data from Redis or the database, failing gracefully if the connection is lost.

- [ ] **File:** `src/sanity/lib/client.ts`
    - **Lines:** 13-14
    - **Issue:** Sanity client configuration uses hardcoded placeholder strings as fallbacks.
    - **Action:** Remove the `'placeholder-project-id'` and `'placeholder-dataset'` fallbacks. The application must fail explicitly during startup if `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are not configured.

- [ ] **File:** `src/app/layout.tsx`
    - **Line:** 244
    - **Issue:** Comment indicates placeholder meta tags for search engine verification.
    - **Action:** Replace the `{/* Search engine verification placeholders */}` comment with actual verification meta tags from Google Search Console, Bing Webmaster Tools, and other relevant services, or remove it entirely if not needed.

- [ ] **File:** `scripts/patch-stripe.js`
    - **Line:** 4
    - **Issue:** The entire script is explicitly marked as a placeholder for future use.
    - **Action:** If the script serves no current purpose, delete it to reduce codebase clutter. If it is intended for future use, implement its functionality or move it to a non-production scripts directory.

- [ ] **File:** `src/lib/pdf-worker-shim.js`
    - **Line:** 4
    - **Issue:** The file contains a comment indicating it's a placeholder for non-browser environments.
    - **Action:** Verify that the production browser build correctly loads the actual PDF worker and that this shim is functioning as intended on the server-side without causing issues. Confirm no dead code.

---

## funktional ## **STUBBED & INCOMPLETE FUNCTIONS**

*This section identifies functions that return hardcoded values, are empty, or lack a complete implementation.*

- [ ] **File:** `src/collaboration/MessageInterface.tsx`
    - **Line:** 495
    - **Issue:** The `handleDelete` function is a placeholder and does not perform any action.
    - **Action:** Implement the full logic to delete a message. This includes making an API call to the backend, handling the response, and updating the local UI state to remove the message upon successful deletion.

- [ ] **File:** `src/hooks/use-subscription.ts`
    - **Lines:** 17-18
    - **Issue:** The `use-subscription` hook contains `TODO` comments and hardcoded values for `billingCycle` and `cancelAtPeriodEnd`.
    - **Action:** Refactor the hook to derive `billingCycle` from the `subData.interval` and `cancelAtPeriodEnd` from `subData.cancelAtPeriodEnd` returned by the backend API. Remove the hardcoded fallbacks and TODOs.

- [ ] **File:** `src/lib/server-polyfills.ts`
    - **Lines:** 50-54
    - **Issue:** The `stream()` method within the custom `File` polyfill is not implemented and throws a runtime error.
    - **Action:** Implement a web-standard compliant `ReadableStream` for the `File` polyfill to ensure any server-side code relying on file streaming functions correctly.

---

## 💾 **HARDCODED DATA & MOCK RESPONSES**

*This section tracks all hardcoded data, magic strings, and mock API responses that should be dynamic.*

- [ ] **File:** `scripts/optimize-images-simple.mjs`
    - **Lines:** 103-114
    - **Issue:** The script creates "placeholder" optimized files by copying originals when ImageMagick is not found.
    - **Action:** Modify the script to fail loudly with a non-zero exit code if ImageMagick is not found. The production deployment process must ensure this critical dependency is installed.

- [ ] **File:** `src/lib/email-campaign-builder.tsx`
    - **Lines:** 208, 229-231
    - **Issue:** The email builder contains hardcoded placeholder links (`#`) for CTAs and social media icons.
    - **Action:** Refactor the component to dynamically populate these links from user settings or a brand configuration. If a link is not provided, it should be omitted entirely rather than rendering a dead `href="#"`.

- [ ] **Task:** **Global Color Palette Violations**
    - **Files:** `src/components/workflow/visual-workflow-builder.tsx`, `src/components/analytics/advanced-data-visualization.tsx`, `src/components/briefcase/folder-creation-dialog.tsx`, `server/routes/admin.ts`, and **100+** other files.
    - **Issue:** Widespread use of hardcoded hex color values instead of referencing the project's design system tokens.
    - **Action:** Perform a global find-and-replace to refactor all hardcoded colors to use the semantic tokens defined in `tailwind.config.ts` (e.g., `bg-primary`, `text-accent-purple`, `border-neon-cyan`).

---

## 🔗 **ROUTING & LINKS**

*This section covers broken links, `href="#"` placeholders, and other routing issues.*

- [ ] **File:** `src/components/home/landing-sections.tsx`
    - **Lines:** 166, 289-291
    - **Issue:** The homepage contains several `<Link href="#">` instances that point to hash fragments for same-page scrolling.
    - **Action:** Verify that each link correctly scrolls to a corresponding element with a matching `id` (e.g., `id="features"`). Ensure smooth scrolling is implemented and there is no jarring "page jump" effect. Confirm this behavior across all target browsers.

---

## 🔑 **ENVIRONMENT & SECURITY**

*This section focuses on the incorrect handling of secrets, environment variables, and security configurations.*

- [ ] **File:** `scripts/verify-websocket.ts`
    - **Line:** 14
    - **Issue:** A hardcoded Stripe test key (`sk_test_dummy`) is present in a test script.
    - **Action:** Remove the hardcoded key and replace it with a `process.env` variable (e.g., `process.env.STRIPE_SECRET_KEY`). This variable should be loaded from a local `.env.test` file that is included in `.gitignore`.

- [ ] **File:** `env.example`
    - **Lines:** 1-152
    - **Issue:** This file correctly contains placeholder values, but poses a risk if misused.
    - **Action:** This is a documentation and process task. Ensure all developers understand that this file must **never** contain production secrets. All production secrets must be managed exclusively within the Vercel and Railway dashboard environments.
