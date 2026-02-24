---
name: production-engineering

description: Extreme-integrity engineering standard for SoloSuccess AI. Mandates Next.js 16.1 async patterns, stable "use cache" directives, Drizzle transactional atomicity, RBAC, React 19 data tainting, and Sentry-backed error masking. Governed by a recursive Chain of Verification (CoVe) to ensure zero-TODO, deployment-ready artifacts.
---

# **Production Engineering Skill**

This skill governs all code generation and modification for the SoloSuccess AI project. It ensures that every output meets the rigorous standards required for a high-stakes, 2026 production environment.

## **Core Directives**

### **1\. Architectural Governance (Meta-Prompting Layer)**

* **Chain of Verification (CoVe)**: Before outputting code, the agent must perform a "Draft → Verify → Correct" cycle. It must internally verify its logic against these directives and resolve any inconsistencies before the final response.

* **Zero-TODO Policy**: Absolutely no placeholders, TODO comments, or mocked logic. Implementation must be the final, intended version. If a feature is out of scope, request clarification rather than using demo code.

* **Strict Typing**: Use explicit TypeScript interfaces. Avoid any. All API and Action responses must be strictly typed.

### **2\. Next.js 16.1 & React 19 Standards**

* **Asynchronous Boundary**: Mandate await for all dynamic APIs, including cookies(), headers(), and the params/searchParams props in layouts and pages, to prevent hydration mismatches and runtime errors.  
* **Request Interception**: Use the **proxy.ts** convention (replaces middleware.ts) for all network boundary logic, ensuring execution on the Node.js runtime.  
* **Stable Caching**: Prioritize the **"use cache"** directive and **Cache Components** over legacy PPR or manual revalidate patterns. Caching must be opt-in and granular.  
* **Read-Your-Writes**: In Server Actions, use the **updateTag()** API immediately following mutations to provide instant UI updates and avoid stale data cycles.

* **UI Responsiveness**: Implement useActionState for form feedback. Target **INP \< 200ms** and **CLS \< 0.1** using CSS aspect-ratio and reserved content slots.

### **3\. Backend & Data Layer (Drizzle ORM)**

* **Transactional Integrity**: Every multi-step mutation must be wrapped in a **db.transaction()** callback to ensure atomic operations and prevent orphaned records in PostgreSQL.

* **Explicit Indexing**: Manually define **foreign key indexes** in the schema. Do not rely on the ORM to auto-create them, as this leads to performance collapse at scale.

* **Migration Protocol**: Enforce a strict **migration-over-push** policy. Use drizzle-kit generate and review SQL for "drop \+ add" destructive changes before applying.

### **4\. Security & Error Governance**

* **Identity Governance (RBAC)**: Authentication check is insufficient. Every Server Action must perform a secondary **Role-Based Access Control (RBAC)** check for the specific resource ID being accessed.  
* **Data Tainting**: Use React 19's **taintUniqueValue** or **taintObjectReference** to prevent sensitive server-side fields (keys, hashes, internal IDs) from leaking into the RSC payload.

* **Sentry-Backed Error Masking**:  
  * **Internal**: Log full stack traces and raw error objects to **Sentry** for debugging.

  * **External**: Return only a generic message (e.g., "A system error occurred") and a unique **internal error code** (e.g., ERR\_AUTH\_001) to the client to prevent sensitive data leakage.

* **Response Structure**: All actions must return: { success: boolean, data: T | null, error: { message: string, code: string } | null, warnings?: string }.

## **Technical Stack Reference**

* **Frontend**: Next.js 16.1 (App Router, Turbopack, React 19), Tailwind CSS v4, Framer Motion.  
* **Data Layer**: Drizzle ORM (PostgreSQL).  
* **Real-Time**: Upstash Realtime (preferred for serverless) or Socket.IO with Redis Adapter.

* **Auth**: @stackframe/stack (RBAC enabled).

* **Monitoring**: Sentry (Tracing & Session Replay), OpenTelemetry.
