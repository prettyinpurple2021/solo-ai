# SoloSuccess AI

SoloSuccess AI is a comprehensive platform designed to empower solopreneurs with advanced AI-driven tools for business intelligence, learning, and automation.

## Core Features

- **Competitive Intelligence**: Real-time monitoring and analysis of competitors across various platforms.
- **Learning Center**: Personalized learning paths and analytics to track skill development and achievements.
- **Workflow Automation**: Build and execute complex business workflows with an integrated AI-powered engine.
- **Content Planner**: Strategic content scheduling and generation powered by Gemini and other LLMs.
- **Social Media Monitoring**: Multi-platform integration to keep a pulse on market trends and brand mentions.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/) (hosted on [Neon](https://neon.tech/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Authentication**: [Auth.js](https://authjs.dev/) (NextAuth v5 Beta)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) with Anthropic, Google Gemini, and OpenAI
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- A PostgreSQL database (Neon recommended)
- API Keys for AI services (Google AI Studio, OpenAI, Anthropic)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd SoloSuccess-AI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the required keys.

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

For more detailed information, please refer to the following:

- [Production Quality Guidelines](docs/deployment/PRODUCTION_QUALITY_GUIDELINES.md)
- [Production Readiness Report](docs/reports/PRODUCTION_READINESS_REPORT.md)
- [User Handbook & Guides](docs/user-guides/app-usage/README.md)
- [Integrations Setup](docs/user-guides/integrations/)
- [Developer & Technical Docs](docs/technical/)
- [Design System](docs/design-system/)
- [Implementation Gaps](docs/IMPLEMENTATION_GAPS.md)

---
**Last Updated**: December 30, 2025
