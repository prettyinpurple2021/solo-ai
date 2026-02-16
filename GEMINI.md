SoloSuccess AI - Project Rules & Production Mandate
===================================================

This file defines the strict operational standards for the **SoloSuccess AI** project. All AI agents, including Gemini CLI and Conductor, must adhere to these rules without exception.
🛡️ The Production Mandate (Skills)
-----------------------------------

### 1. High-Stakes Engineering

* **No Placeholders:** Never output comments like "In production, you would...". Implement the production version immediately.

* **Zero-TODO Policy:** Do not leave `// TODO` comments. If a feature is requested, build it fully. If it's out of scope, ask for clarification instead of mocking it.

* **Strict Typing:** All TypeScript code must use explicit interfaces/types. Avoid `any` at all costs.

### 2. Next.js 16.1 Standards

* **Server Actions:** Use `'use server'` for all mutations. Implement proper `useActionState` (or `useFormState`) for UI feedback.

* **Security:** Always validate inputs using `zod` before processing. Check authentication in every Server Action using your `@stackframe/stack` or NextAuth logic.

* **Performance:** Use Next.js `<Image />` component, font optimization, and `generateMetadata` for SEO.

### 3. Backend & Database (Drizzle/Express)

* **Transactional Integrity:** Use database transactions for multi-step operations (e.g., creating a user and a default 'Aura' agent).

* **Error Handling:** Centralize Express error handling. All API responses must follow a consistent JSON structure: `{ success: boolean, data?: any, error?: string }`.

🏗️ Tech Stack Context
----------------------

* **Frontend:** Next.js (App Router), Tailwind, Framer Motion, SWR.

* **Backend:** Node.js/Express, Socket.IO, Drizzle ORM (PostgreSQL).

* **Services:** Stripe (Payments), Resend (Email), Upstash (Redis/Queue).

📂 Architecture Strategy
------------------------

* **Feature-First:** Group related components, hooks, and types within feature folders if they aren't globally reusable.

* **Real-time:** Ensure Socket.IO connections are properly cleaned up in `useEffect` hooks to prevent memory leaks.

🚀 Execution Workflow
---------------------

1. **Plan:** Every task begins with a `/conductor:newTrack`.

2. **Review:** Before implementing, the `spec.md` must be reviewed for "production-readiness".

3. **Verify:** After implementation, run `npm run type-check` and `npm run lint`.

_Note: This document is the source of truth for all code generation. If a prompt conflicts with these rules, these rules take precedence._
