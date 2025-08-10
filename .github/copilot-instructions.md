# SoloBoss AI Platform - GitHub Copilot Instructions

**Always reference these instructions first and fallback to additional search or context gathering only when the information here is incomplete or found to be in error.**

## Working Effectively

### Bootstrap, Build, and Test the Repository:
- Install Node.js 18+ (check with `node --version`)
- `npm install` -- takes 30-40 seconds. **NEVER CANCEL**. Peer dependency warnings are safe to ignore.
- **ENVIRONMENT SETUP REQUIRED**: Copy `.env.local.example` to `.env.local` and configure all required environment variables (see Environment Variables section below)
- **IMPORTANT**: The build currently FAILS due to extensive ESLint errors. The codebase builds successfully when linting is disabled, but ESLint errors prevent production builds.
- To test core functionality: Temporarily set `ignoreDuringBuilds: true` in `next.config.mjs` before running `npm run build`
- Build (when ESLint disabled): ~45 seconds. **NEVER CANCEL**. Set timeout to 90+ seconds.
- `npm run lint` -- has 100+ ESLint errors that prevent builds. These must be fixed before production deployment.
- `npm test` -- currently has no test files. Jest is configured but no tests exist yet.

### Run the Application:
- **ALWAYS run the bootstrapping steps and environment setup first**
- Development server: `npm run dev` -- starts in ~2 seconds
- Production build: `npm run build && npm run start`
- Access at: `http://localhost:3000`
- API health check: `http://localhost:3000/api/health`

### Database Setup:
- **Database**: Neon PostgreSQL (preferred) or Supabase
- **Setup command**: `npm run setup-neon-db` (requires DATABASE_URL in .env.local)
- **Migration files**: Located in `supabase/migrations/` directory
- **Schema**: 15+ tables including users, goals, tasks, ai_agents, conversations, documents, compliance tables

## Environment Variables (Required for Build)

**Critical**: The build WILL FAIL without these environment variables set:

```env
# Required for successful build
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/database

# Stack Auth (Authentication)
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key

# Optional but recommended for full functionality
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
ANTHROPIC_API_KEY=your-anthropic-key
CHARGEBEE_API_KEY=your-chargebee-key
CHARGEBEE_SITE=your-chargebee-site
RESEND_API_KEY=re_your-resend-key
FROM_EMAIL=noreply@yourdomain.com
```

## Build Times and Validation

**CRITICAL - NEVER CANCEL these commands. Always set appropriate timeouts:**

- `npm install`: 30-40 seconds. **NEVER CANCEL**. Timeout: 60+ seconds.
- `npm run build`: **CURRENTLY FAILS** due to ESLint errors. Core compilation takes ~45 seconds when linting disabled. **NEVER CANCEL**. Timeout: 90+ seconds.
- `npm run dev`: ~2 seconds startup. Timeout: 30+ seconds.
- Database setup (`npm run setup-neon-db`): 10-30 seconds depending on data size.
- **CRITICAL**: Build must have ESLint errors fixed before production deployment. Over 100+ linting errors currently prevent successful builds.

## Validation Scenarios

**After making changes, ALWAYS test these complete user scenarios:**

1. **Development Server Validation**:
   - Start `npm run dev`
   - Visit `http://localhost:3000` and verify homepage loads
   - Check `/api/health` endpoint returns valid JSON with service status
   - Verify no console errors on homepage load

2. **Build Validation**:
   - **IMPORTANT**: Current builds FAIL due to ESLint errors - temporarily disable linting first
   - Temporarily set `ignoreDuringBuilds: true` in `next.config.mjs`
   - Run build with `npm run build`
   - Verify core TypeScript compilation succeeds (excluding linting)
   - **CRITICAL**: Before production, all 100+ ESLint errors must be fixed

3. **Authentication Flow** (if auth env vars are configured):
   - Visit `/signup` and verify form renders
   - Visit `/signin` and verify form renders
   - Test form submissions (should handle gracefully even with dummy auth config)

4. **API Routes Validation**:
   - Check `/api/health` returns proper JSON
   - Verify API routes compile without TypeScript errors
   - Test basic CRUD operations if database is configured

5. **UI Component Validation**:
   - Navigate to `/dashboard` and verify UI components render
   - Check `/features` page for marketing components
   - Verify responsive design on different screen sizes

## Repository Structure

### Key Directories:
- `app/` - Next.js 15 app router pages and API routes
- `components/` - Reusable React components with TypeScript
- `lib/` - Utility functions, database clients, and shared logic
- `hooks/` - Custom React hooks
- `styles/` - Tailwind CSS styles and global CSS
- `scripts/` - Database setup and maintenance scripts
- `supabase/migrations/` - Database migration files
- `public/` - Static assets

### Important Files:
- `package.json` - Dependencies and scripts (25+ npm scripts available)
- `next.config.mjs` - Next.js configuration with Netlify optimization
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.ts` - Tailwind CSS configuration with custom design system
- `eslint.config.mjs` - ESLint configuration (has many existing errors)

## Common Tasks and Known Issues

### Linting:
- **CRITICAL ISSUE**: 100+ ESLint errors currently prevent production builds
- **Common Errors**: Unused variables not prefixed with `_`, unescaped quotes in JSX, TypeScript `any` types
- **Immediate Action Required**: Fix all ESLint errors before the codebase can build for production
- **Pattern for Fixes**: Prefix unused variables with `_` (e.g., `_error`, `_unused`), escape quotes in JSX content, add proper TypeScript types
- **Build Workaround**: Temporarily set `ignoreDuringBuilds: true` in next.config.mjs for development testing
- **Before Committing**: All ESLint errors must be resolved - do not commit code that fails linting

### TypeScript Issues:
- **Fixed Issues**: Chargebee API calls and Stack Auth error handling
- **Pattern**: Use proper type checking for API responses
- **Stack Auth**: Use `result.status === "ok"` instead of `result.error` pattern

### Database:
- **Client**: Uses Neon PostgreSQL with connection pooling
- **Setup**: Run `npm run setup-neon-db` after setting DATABASE_URL
- **Migrations**: Located in `supabase/migrations/` directory
- **Tables**: 15+ tables for full functionality (users, goals, tasks, ai_agents, etc.)

### AI Integration:
- **Providers**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Framework**: Uses AI SDK for provider-agnostic implementation
- **Agents**: 8 specialized AI agents with unique personalities
- **Testing**: AI features require valid API keys for full functionality

## Architecture Notes

### Frontend:
- **Framework**: Next.js 15.2.4 with App Router
- **React**: Version 19 with concurrent features
- **Styling**: Tailwind CSS with custom design system
- **Components**: Radix UI primitives with custom styling
- **State Management**: React hooks and context

### Backend:
- **API Routes**: Next.js API routes with TypeScript
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: Stack Auth for user management
- **File Storage**: Planned integration with Supabase Storage

### Deployment:
- **Platform**: Netlify (configured with netlify.toml)
- **Build**: Static site generation where possible
- **Environment**: Production environment variables required
- **CI/CD**: GitHub Actions workflow for Jest coverage (`.github/workflows/ci.yml`)

## Performance Considerations

### Build Optimization:
- **Images**: Unoptimized for static deployment
- **Bundle**: Optimized package imports for Radix UI and Lucide React
- **Compression**: Enabled in Next.js config
- **Caching**: Appropriate cache headers for static assets

### Database:
- **Connection Pooling**: Uses pg Pool for efficient connections
- **Queries**: Optimized queries with proper indexing
- **Migrations**: Incremental migration system

## Security Notes

### Authentication:
- **Provider**: Stack Auth with JWT tokens
- **Session Management**: Secure token storage and validation
- **API Protection**: Protected routes require authentication

### Database:
- **Connection**: SSL required in production
- **Queries**: Parameterized queries prevent SQL injection
- **Access**: Row-level security where applicable

### Environment Variables:
- **Never commit**: .env.local files are gitignored
- **Validation**: Zod schemas validate environment variables
- **Secrets**: API keys and sensitive data properly secured

## Getting Help

### Common Commands Reference:
```bash
# Development
npm run dev                    # Start development server
npm run build                 # Production build
npm run lint                  # Run ESLint (expect many errors)

# Database
npm run setup-neon-db        # Initialize Neon database
npm run verify-triggers      # Verify database triggers
npm run db:migrate           # Run database migrations

# Testing
npm test                     # Run Jest tests (no tests exist yet)
npm run test:coverage        # Jest with coverage
npm run test:api             # Test API routes with database
```

### Troubleshooting:
1. **Build Fails**: Check all required environment variables are set
2. **TypeScript Errors**: Focus on new errors, many existing errors are ignored
3. **Database Issues**: Verify DATABASE_URL format and network access
4. **Auth Issues**: Confirm Stack Auth environment variables are valid
5. **Development Server**: Ensure port 3000 is available

**Remember: This is a production-ready AI platform with 8 specialized agents, comprehensive goal/task management, compliance tools, and a complete gamification system. Always test thoroughly after making changes.**