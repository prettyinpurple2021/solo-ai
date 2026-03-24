# SoloSuccess AI

**SoloSuccess AI** is the ultimate co-founder for solopreneurs. We empower individual founders to build, launch, and scale their businesses by automating the complex tasks that typically require a full team. From crafting perfect pitch decks to executing data-driven content strategies, SoloSuccess AI gives you the tools to succeed on your own terms.

## Mission

Our mission is simple: **Level the playing field for solopreneurs.** We believe that a great idea shouldn't fail because a single founder lacks the time or specialized skills to execute it. By harnessing the power of advanced AI, we provide the strategic insight and operational automation of a C-suite team, accessible to everyone.

## Key Features

- **AI Pitch Deck Generator**: Create investor-ready presentations in minutes. Our AI structures your story, designs your slides, and refines your messaging for maximum impact.
- **Smart Business Analytics**: Gain actionable insights into your business performance. Understand what's working and what's not with intuitive, real-time dashboards.
- **Automated Content Strategy**: maintain a consistent and engaging online presence. Generate social media posts, blog articles, and SEO-optimized content tailored to your unique brand voice.
- **Growth & SEO Tools**: effortlessly optimize your digital footprint to reach the right audience and grow your user base organically.

## Local development (simple)

Your app has **two parts**: the **website** (Next.js) and the **API + WebSockets** (Express in the `server` folder).

1. **One place for secrets (easiest):** copy `env.example` to **`.env.local`** in the **project root** (the same folder as this `README.md`). Fill in your keys there.
2. **Start both parts at once** from the project root:
   ```bash
   npm run dev:all
   ```
   That runs the website (usually [http://localhost:3000](http://localhost:3000)) and the API (usually port **5000**). Yes — **`npm run dev:all` is the right command** for full local use.
3. **Website only** (no separate API): `npm run dev`
4. **Live site:** **Vercel** runs the **Next.js** frontend (and its `/api/*` routes). **Railway** runs the **Express** backend (`server/`, WebSockets). Connect both to your **GitHub** repo and branch **`main`** so pushes trigger deploys (see **[docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md](docs/deployment/ENV_VARS_VERCEL_AND_RAILWAY.md)** for env placement). Short version: same **`DATABASE_URL`** and **`JWT_SECRET`** on both; **`NEXT_PUBLIC_SOCKET_URL`** only on **Vercel**, set to your Railway **https** root URL.

**Cleaning up extra env files:** After everything works with only **root** `.env.local`, you can delete **`server/.env`**, **`server/.env.local`**, and **`server/.env.production`** if you had copies there — the API now reads the root files automatically when you use `dev:all`. Keep **root** `.env.local` as your main secrets file.

## Tech Stack

Built with a robust, modern stack designed for performance and scalability:
- **Next.js & React**: Fast, responsive, and dynamic user interfaces.
- **TypeScript**: Ensuring code reliability and maintainability.
- **Drizzle ORM & Neon**: High-performance database management.
- **Tailwind CSS**: Beautiful, responsive styling.
- **Advanced AI Integration**: Powered by industry-leading models from OpenAI, Google, and Anthropic.

## Proprietary Software

**© 2026 SoloSuccess AI. All Rights Reserved.**

This software is proprietary and confidential. Unauthorized copying, transfer, or reproduction of this software or its components is strictly prohibited.

---

*SoloSuccess AI — Built by Solopreneurs, for Solopreneurs.*