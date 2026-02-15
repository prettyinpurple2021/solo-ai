# SoloSuccess AI

**SoloSuccess AI** is an advanced AI-powered platform designed to act as a virtual co-founder for solopreneurs. It provides a suite of specialized AI agents (the "C-Suite") and tools to automate tasks like pitch deck creation, business analytics, content strategy, and legal compliance.

## 🏗️ Tech Stack

### Frontend (Web)
*   **Framework:** Next.js 16.1 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, `tailwindcss-animate`, `lucide-react`, `framer-motion`
*   **State/Data:** `swr`, Server Actions
*   **PWA:** `@ducanh2912/next-pwa`

### Backend (Server)
*   **Runtime:** Node.js with Express.js
*   **Language:** TypeScript
*   **Real-time:** Socket.IO
*   **Database:** PostgreSQL (Neon / Local via Docker), managed with Drizzle ORM
*   **Caching/Queue:** Upstash (Redis, QStash)
*   **AI:** Vercel AI SDK, OpenAI, Anthropic, Google GenAI
*   **Auth:** NextAuth.js v5 (Beta), @stackframe/stack
*   **Payments:** Stripe
*   **Email:** Resend

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20+ recommended)
*   Docker (optional, for local DB)
*   PostgreSQL (if not using Docker)

### Installation

1.  **Install Root Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

3.  **Environment Setup:**
    *   Copy `.env.example` to `.env` (and `.env.local` if needed).
    *   Configure database URLs, API keys (OpenAI, Stripe, etc.), and auth secrets.

4.  **Database Setup:**
    *   Start local Postgres (if using Docker):
        ```bash
        docker-compose up -d
        ```
    *   Push schema to database:
        ```bash
        npm run db:push
        ```

### Running the Application

To run both the Next.js frontend and the Express backend concurrently:

```bash
npm run dev:all
```

*   **Frontend:** `http://localhost:3000`
*   **Backend:** `http://localhost:5000`
*   **Drizzle Studio:** `https://local.drizzle.studio` (via `npm run db:studio`)

## 📂 Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: Reusable React components (UI, features, etc.).
*   `server/`: Express.js backend application.
    *   `index.ts`: Entry point.
    *   `drizzle.config.ts`: Drizzle configuration for the server.
*   `drizzle/`: Database migration files.
*   `lib/`: Shared utility functions and libraries.
*   `hooks/`: Custom React hooks.
*   `public/`: Static assets.
*   `scripts/`: Internal maintenance and audit scripts.
*   `tests/` & `test/`: Testing directories (Jest/Playwright).

## 🛠️ Key Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev:all` | Starts both frontend and backend in development mode. |
| `npm run build` | Builds the Next.js application for production. |
| `npm run lint` | Runs ESLint. |
| `npm run type-check` | Runs TypeScript type checking for both web and server. |
| `npm run db:push` | Pushes Drizzle schema changes to the database. |
| `npm run db:studio` | Opens Drizzle Studio to manage database content. |
| `npm run internal:audit` | Runs the launch readiness audit script. |

## 💎 Features & Tiers

The application is structured around a tiered subscription model:

*   **Launch (Free):** Basic access, limited storage (50MB), "Aura" agent only.
*   **Accelerator ($19/mo):** Access to 5 core agents, tactical tools, 1GB storage.
*   **Dominator ($29/mo):** Full "C-Suite" access (10 agents), advanced strategy tools ("War Room"), 100GB storage.

**Core Agents:**
*   **Roxy:** Business Coach/The Boss
*   **Lexi:** Legal
*   **Nova:** Product
*   **Echo:** Marketing
*   **Finn:** Finance
