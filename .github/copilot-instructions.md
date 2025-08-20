# SoloBoss AI Platform - GitHub Copilot Instructions

**Always reference these instructions first and fallback to additional search or context gathering only when the information here is incomplete or found to be in error.**

## Working Effectively

### Bootstrap, Build, and Test the Repository:

**Node.js Requirements:**
- Install Node.js 18+ (verified working with Node.js 20.19.4)
- Check version: `node --version`
- npm version: 10.8.2+ (verified working)

**Installation Process:**
- `npm install` -- takes 41 seconds. **NEVER CANCEL**. Timeout: 90+ seconds.
- Peer dependency warnings for React versions are safe to ignore
- 6 security vulnerabilities (2 low, 4 moderate) are acceptable for development

**Environment Setup (REQUIRED):**
Create `.env.local` file with these REQUIRED variables:
```env
# Required for successful build
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/database

# Stack Auth (Primary Auth Provider)
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key

# AI Providers (Optional for build, required for AI functionality)
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key

# Email Service (Optional)
RESEND_API_KEY=re_your-resend-key
FROM_EMAIL=noreply@yourdomain.com

# Subscription Management (Optional)
CHARGEBEE_API_KEY=your-chargebee-key
CHARGEBEE_SITE=your-chargebee-site

# JWT Secret (Optional, min 32 characters)
JWT_SECRET=your-32-character-or-longer-jwt-secret
```

**Build Process:**
- `npm run build` -- takes 72 seconds. **NEVER CANCEL**. Timeout: 120+ seconds.
- Build produces 83 static pages with warnings (acceptable)
- ✅ **BUILDS SUCCESSFULLY** with environment variables configured

**Testing:**
- `npm test` -- takes 2.25 seconds. **NEVER CANCEL**. Timeout: 60+ seconds.
- `npm run test:coverage` -- takes 2.7 seconds. Provides code coverage reports.
- All existing tests pass (2 test suites, 5 tests total)

### Run the Application:

**Development Server:**
- `npm run dev` -- starts in 1.8 seconds. **NEVER CANCEL**. Timeout: 30+ seconds.
- Access at: `http://localhost:3000`
- Hot reload enabled with Next.js 15.2.4

**Production Server:**
- Build first: `npm run build`
- Start: `npm run start` (Note: includes New Relic integration)
- Requires build artifacts in `.next` directory

**API Health Check:**
- Endpoint: `http://localhost:3000/api/health`
- Expected response: `{"status":"ok","timestamp":"...","environment":"development","nextVersion":"edge"}`

### Database Setup:

**Database Type:** Neon PostgreSQL with Drizzle ORM

**Setup Commands:**
- `npm run setup-neon-db` -- requires valid DATABASE_URL. **NEVER CANCEL**. Timeout: 60+ seconds.
- `npm run db:generate` -- generates TypeScript types from schema
- `npm run db:verify` -- verifies database connection and schema

**Database Scripts Available:**
- `npm run setup-templates` -- sets up template tables
- `npm run setup-compliance` -- sets up compliance tables
- `npm run verify-triggers` -- verifies database triggers
- `npm run migrate-profile-fields` -- runs profile field migration

### Linting and Code Quality:

**Linting Status:**
- `npm run lint` -- takes 8.2 seconds. **Exits with code 1** due to 2 unused variable errors.
- 200+ warnings (mostly React unescaped entities and TypeScript 'any' types)
- **Known Issues:** 2 unused variables in `lib/idempotency.ts` and `app/account-recovery/page.tsx`
- **Action Required:** Fix unused variables before production deployment

## Environment Variables (Required for Build)

**Critical for Build Success:**
The build WILL FAIL without these minimum environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/database
NEXT_PUBLIC_STACK_PROJECT_ID=test-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=test-publishable-key
STACK_SECRET_SERVER_KEY=test-secret-key
```

**Optional but Recommended:**
```env
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
RESEND_API_KEY=re_your-resend-key
FROM_EMAIL=noreply@yourdomain.com
CHARGEBEE_API_KEY=your-chargebee-key
CHARGEBEE_SITE=your-chargebee-site
JWT_SECRET=your-32-character-or-longer-jwt-secret
```

## Build Times and Validation

**CRITICAL - NEVER CANCEL these commands. Always set appropriate timeouts:**

- `npm install`: 41 seconds. **NEVER CANCEL**. Timeout: 90+ seconds.
- `npm run build`: 72 seconds. **NEVER CANCEL**. Timeout: 120+ seconds.
- `npm run dev`: 1.8 seconds startup. **NEVER CANCEL**. Timeout: 30+ seconds.
- `npm test`: 2.25 seconds. **NEVER CANCEL**. Timeout: 60+ seconds.
- `npm run lint`: 8.2 seconds. **NEVER CANCEL**. Timeout: 30+ seconds.
- Database setup commands: 5-30 seconds (requires valid DATABASE_URL). **NEVER CANCEL**. Timeout: 60+ seconds.

## Validation Scenarios

**After making changes, ALWAYS test these complete user scenarios:**

### 1. Development Server Validation
```bash
npm run dev
# Wait for "Ready in" message
curl -s http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"...","environment":"development","nextVersion":"edge"}
curl -s -I http://localhost:3000/
# Should return: HTTP/1.1 200 OK
```

### 2. Build Validation
```bash
npm run build
# Should complete with "Finalizing page optimization ✓"
# Should show 83 static pages generated
# Warnings are acceptable, errors are not
```

### 3. Authentication Flow Testing
- Visit `/signin` and verify auth form renders (uses NeonAuth component)
- Visit `/signup` and verify auth form renders
- Visit `/sign-in` and `/sign-up` for alternative auth pages
- All auth pages use `dynamic = 'force-dynamic'` to prevent static generation issues

### 4. API Routes Validation
```bash
# Health check
curl -s http://localhost:3000/api/health

# Auth endpoint (should return error without token)
curl -s http://localhost:3000/api/auth/user
# Expected: {"error":"No authorization token provided"}

# Test other API routes
curl -s -I http://localhost:3000/api/goals
curl -s -I http://localhost:3000/api/tasks
```

### 5. Core Pages Validation
- Homepage: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Features: `http://localhost:3000/features`
- Pricing: `http://localhost:3000/pricing`

## Repository Structure

### Key Directories:
- `app/` - Next.js 15 App Router with 33 main routes
- `components/` - React components with TypeScript (22 subdirectories)
- `lib/` - Utilities, database clients, validation schemas
- `hooks/` - Custom React hooks
- `styles/` - Tailwind CSS and global styles
- `scripts/` - Database setup and maintenance scripts
- `public/` - Static assets
- `tests/` - Jest test files (2 test suites currently)

### Important Files:
- `package.json` - 23 npm scripts available
- `next.config.mjs` - Disables TypeScript/ESLint errors during build
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint with Next.js and TypeScript rules
- `jest.config.js` - Jest testing configuration
- `drizzle.config.ts` - Database ORM configuration
- `middleware.ts` - Route middleware (authentication handling)

### Build Configuration:
- **Output:** Standalone (for Docker deployment)
- **TypeScript:** Build errors ignored (`ignoreBuildErrors: true`)
- **ESLint:** Build errors ignored (`ignoreDuringBuilds: true`)
- **Static Generation:** Disabled for auth pages (`dynamic = 'force-dynamic'`)

## Common Tasks and Known Issues

### Linting Status:
- **Current State:** 2 critical errors (unused variables), 200+ warnings
- **Before Committing:** Fix unused variables in:
  - `lib/idempotency.ts` (line 2: 'text', 'params')
  - `app/account-recovery/page.tsx` (line 38: 'err')
- **Acceptable Warnings:** React unescaped entities, TypeScript 'any' types

### Database Issues:
- **Connection Required:** All database commands require valid DATABASE_URL
- **Setup Command:** `npm run setup-neon-db` (fails without real database)
- **ORM:** Drizzle with PostgreSQL
- **Schema:** 15+ tables including compliance, AI agents, goals, tasks

### Build Issues:
- **Auth Pages:** Fixed with `dynamic = 'force-dynamic'` exports
- **New Relic:** Production start requires NEW_RELIC_APP_NAME environment variable
- **Static Generation:** Some pages require runtime environment

## Key Features and Architecture

### SoloBoss AI Platform Overview:
- **8 Specialized AI Agents:** Nova, Echo, Sage, Phoenix, Guardian, Catalyst, Harmony, Quantum
- **Goal Management:** SMART goals with progress tracking
- **Task Automation:** Advanced task creation and completion
- **Gamification:** Achievement system and progress tracking
- **Compliance Scanner:** GDPR/CCPA compliance automation
- **Brand Toolkit:** Logo generation and brand management
- **Authentication:** Stack Auth integration
- **Database:** Neon PostgreSQL with Drizzle ORM

### Technical Stack:
- **Frontend:** Next.js 15.2.4, React 19, TypeScript 5+, Tailwind CSS
- **Backend:** Next.js API routes, Neon PostgreSQL
- **AI Integration:** OpenAI GPT-4, Google Gemini
- **Testing:** Jest with 63.7% code coverage
- **Deployment:** Standalone build for Docker/Cloud Run

## Available Scripts Reference

```bash
# Development
npm run dev                    # Start development server (1.8s)
npm run build                 # Production build (72s)
npm run start                 # Start production server
npm run lint                  # Run ESLint (8.2s, has errors)

# Database
npm run setup-neon-db        # Initialize Neon database
npm run setup-templates      # Set up template tables
npm run setup-compliance     # Set up compliance tables
npm run db:generate          # Generate TypeScript types
npm run db:verify            # Verify database connection

# Testing
npm test                     # Run Jest tests (2.25s)
npm run test:coverage        # Jest with coverage (2.7s)
npm run test:api             # Test API routes (requires DATABASE_URL)
npm run e2e                  # Run Playwright end-to-end tests

# Build Tools
npm run verify-triggers      # Verify database triggers
npm run migrate-profile-fields # Run profile field migration
```

## Troubleshooting Guide

### Build Failures:
1. **Environment Variables:** Ensure `.env.local` has required variables
2. **Node.js Version:** Must be 18+ (tested with 20.19.4)
3. **Memory:** Build requires significant memory (set timeout to 120+ seconds)

### Development Server Issues:
1. **Port 3000:** Ensure port is available
2. **Environment:** Check `.env.local` file exists and is readable
3. **Dependencies:** Run `npm install` if node_modules is missing

### Database Connection:
1. **DATABASE_URL:** Must be valid Neon PostgreSQL connection string
2. **Network Access:** Ensure firewall allows database connections
3. **SSL:** Production databases require SSL connections

### Authentication Issues:
1. **Stack Auth:** Verify NEXT_PUBLIC_STACK_PROJECT_ID and keys are valid
2. **JWT Secret:** Must be 32+ characters for security
3. **Redirects:** Check NEXT_PUBLIC_APP_URL matches your domain

### Performance Issues:
1. **Build Time:** 72 seconds is normal, do not cancel
2. **Memory Usage:** Build can use 2.5GB+ RAM
3. **Hot Reload:** Development server supports fast refresh

## Production Deployment

### Docker Deployment:
- Build uses `output: 'standalone'` configuration
- Dockerfile provided for containerization
- Google Cloud Run deployment scripts available

### Environment Variables for Production:
- Set all required variables in production environment
- Use secrets management for sensitive values
- Validate environment variables before deployment

### Monitoring:
- New Relic integration available (requires NEW_RELIC_APP_NAME)
- Sentry error tracking configured
- Health check endpoint: `/api/health`

**Remember: This is a production-ready AI platform with 8 specialized agents, comprehensive goal/task management, compliance tools, and gamification system. Always test thoroughly after making changes and fix linting errors before committing.**