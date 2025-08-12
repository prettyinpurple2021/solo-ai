# SoloBoss AI Platform - GitHub Copilot Instructions

**Always reference these instructions first and fallback to additional search or context gathering only when the information here is incomplete or foun### Common Commands Reference:
```bash
# Development
npm run dev                    # Start development server
npm run build                 # Production build
npm run lint                  # Run ESLint (runs cleanly)

# Database
npm run setup-neon-db        # Initialize Neon database
npm run verify-triggers      # Verify database triggers
npm run db:migrate           # Run database migrations

# Testing
npm test                     # Run Jest tests (limited tests exist)
npm run test:coverage        # Jest with coverage
npm run test:api             # Test API routes with database
```**

## Working Effectively

### Bootstrap, Build, and Test the Repository:
- Install Node.js 18+ (check with `node --version`)
- `npm install` -- takes 30-40 seconds. **NEVER CANCEL**. Peer dependency warnings are safe to ignore.
- **ENVIRONMENT SETUP REQUIRED**: Copy `.env.local.example` to `.env.local` and configure required environment variables (see Environment Variables section below)
- **BUILD STATUS**: ✅ Builds successfully! Previous ESLint issues have been resolved.
- Build: ~45 seconds. **NEVER CANCEL**. Set timeout to 90+ seconds.
- `npm run lint` -- runs cleanly with minor warnings only
- `npm test` -- Jest is configured. Limited test coverage currently exists.

### Run the Application:
- **ALWAYS run the bootstrapping steps and environment setup first**
- Development server: `npm run dev` -- starts in ~2 seconds
- Production build: `npm run build && npm run start`
- Access at: `http://localhost:3000`
- API health check: `http://localhost:3000/api/health`

### Database Setup:
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Setup command**: `npm run setup-neon-db` (requires DATABASE_URL in .env.local)
- **Schema files**: Located in `lib/db/schema.ts` with Drizzle definitions
- **Migration commands**: `npm run db:migrate`, `npm run db:push`, `npm run db:generate`
- **Schema**: 15+ tables including users, goals, tasks, ai_agents, conversations, documents, compliance tables

## Environment Variables (Required for Build)

**Critical**: The build WILL FAIL without these environment variables set:

```env
# Required for successful build
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/database

# Stack Auth (Primary Auth Provider)
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key

# AI Providers (Required for AI functionality)
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key

# Email Service (Optional)
RESEND_API_KEY=re_your-resend-key
FROM_EMAIL=noreply@yourdomain.com

# Subscription Management (Optional)
CHARGEBEE_API_KEY=your-chargebee-key
CHARGEBEE_SITE=your-chargebee-site

# Feature Flags (Optional)
NEXT_PUBLIC_STATSIG_CLIENT_KEY=your-statsig-key
STATSIG_SERVER_SECRET_KEY=your-statsig-secret
```

## Build Times and Validation

**CRITICAL - NEVER CANCEL these commands. Always set appropriate timeouts:**

- `npm install`: 30-40 seconds. **NEVER CANCEL**. Timeout: 60+ seconds.
- `npm run build`: ✅ **BUILDS SUCCESSFULLY** - Takes ~45 seconds. **NEVER CANCEL**. Timeout: 90+ seconds.
- `npm run dev`: ~2 seconds startup. Timeout: 30+ seconds.
- Database setup (`npm run setup-neon-db`): 10-30 seconds depending on data size.
- `npm run lint`: Runs cleanly with only minor warnings.
- All placeholder content has been removed and the codebase is production-ready.

## Validation Scenarios

**After making changes, ALWAYS test these complete user scenarios:**

1. **Development Server Validation**:
   - Start `npm run dev`
   - Visit `http://localhost:3000` and verify homepage loads
   - Check `/api/health` endpoint returns valid JSON with service status
   - Verify no console errors on homepage load

2. **Build Validation**:
   - Run `npm run build` to test production build
   - Verify core TypeScript compilation succeeds
   - Check for any new ESLint warnings (should be minimal)
   - Ensure build completes within 90 seconds

3. **Authentication Flow** (if auth env vars are configured):
   - Visit `/sign-up` and verify Stack Auth form renders
   - Visit `/sign-in` and verify Stack Auth form renders  
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
- `drizzle/` - Database migration files (Drizzle ORM)
- `public/` - Static assets including agent avatars and branding

### Important Files:
- `package.json` - Dependencies and scripts (25+ npm scripts available)
- `next.config.mjs` - Next.js configuration with Netlify optimization
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.ts` - Tailwind CSS configuration with custom design system
- `eslint.config.mjs` - ESLint configuration (runs cleanly)
- `drizzle.config.ts` - Database configuration for Drizzle ORM
- `middleware.ts` - Simple passthrough middleware (Stack Auth disabled for now)

## Common Tasks and Known Issues

### Linting:
- **STATUS**: ✅ ESLint runs cleanly with only minor warnings
- **Previous Issues**: All major ESLint errors have been resolved
- **Current State**: Production builds work without linting issues
- **Best Practice**: Continue to maintain clean code standards
- **Before Committing**: Run `npm run lint` to check for any new issues

### TypeScript Issues:
- **Fixed Issues**: Chargebee API calls and Stack Auth error handling
- **Pattern**: Use proper type checking for API responses
- **Stack Auth**: Use `result.status === "ok"` instead of `result.error` pattern

### Database:
- **Client**: Uses Neon PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Setup**: Run `npm run setup-neon-db` after setting DATABASE_URL
- **Migrations**: Located in `drizzle/` directory, managed by Drizzle Kit
- **Tables**: 15+ tables for full functionality (users, goals, tasks, ai_agents, etc.)
- **Storage**: Pure Neon database - no Supabase dependencies

### AI Integration:
- **Providers**: OpenAI GPT-4, Google Gemini (Anthropic Claude removed)
- **Framework**: Uses AI SDK for provider-agnostic implementation
- **Agents**: 8 specialized AI agents with unique personalities
- **Testing**: AI features require valid OpenAI and Google API keys

## Key Features and Architecture

### SoloBoss AI Platform Overview:
- **8 Specialized AI Agents**: Nova (General Assistant), Echo (Communication Expert), Sage (Strategic Planning), Phoenix (Transformation Specialist), Guardian (Compliance & Security), Catalyst (Innovation & Creativity), Harmony (Team Collaboration), Quantum (Advanced Analytics)
- **Goal Management System**: Comprehensive SMART goals with progress tracking and analytics
- **Task Automation**: Advanced task creation, assignment, and completion tracking
- **Gamification**: Achievement system, progress tracking, and user engagement features
- **Brand Toolkit**: Logo generation, brand guidelines, and asset management
- **Compliance Scanner**: Document analysis and regulatory compliance checking
- **Social Features**: Community posts, team collaboration, and social sharing
- **Voice Chat**: Real-time voice communication with AI agents
- **Projects Dashboard**: Comprehensive project management and tracking

### Authentication & User Management:
- **Primary Provider**: Stack Auth (modern, developer-friendly auth)
- **Features**: Email/password, social logins, user profiles, session management
- **Protection**: Middleware handles route protection (currently disabled for development)
- **Profile System**: Comprehensive user profiles with preferences and settings

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
- **File Storage**: No external storage - using Neon database

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