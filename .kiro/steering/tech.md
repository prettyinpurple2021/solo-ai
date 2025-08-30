# Technology Stack & Development Guide

## Core Tech Stack

### Frontend
- **Next.js 15.2.4** - App Router, Server Components, API Routes
- **React 19** - Concurrent Features, Server Components
- **TypeScript 5+** - Full type safety with strict mode
- **Tailwind CSS 3.4+** - Utility-first styling with custom design system
- **Radix UI** - Accessible, unstyled component primitives
- **Framer Motion 12+** - Animations and transitions

### Backend & Database
- **PostgreSQL** - Primary database (Neon/Supabase)
- **Drizzle ORM 0.44+** - Type-safe database operations
- **Next.js API Routes** - Server-side API endpoints

### AI & Machine Learning
- **AI SDK** - Provider-agnostic AI integration
- **OpenAI GPT-4** - Primary conversational AI
- **Anthropic Claude** - Alternative AI model
- **Google Gemini** - Additional AI capabilities
- **Streaming Responses** - Real-time AI conversations

### Authentication & Services
- **Stack Auth** - Authentication provider
- **Resend** - Transactional email delivery
- **Chargebee** - Subscription management (optional)

### Development Tools
- **ESLint** - Code linting with Next.js config
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Drizzle Kit** - Database migrations

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:generate  # Generate database migrations
npm run db:verify    # Verify database connection
npm run setup-db     # Setup database tables
```

### Testing
```bash
npm test             # Run unit tests
npm run test:coverage # Run tests with coverage
npm run e2e          # Run Playwright e2e tests
npm run smoke        # Run smoke tests
```

### API Testing
```bash
npm run test:api     # Test API routes
npm run test:user    # User testing plan
npm run test:ux      # UX testing
```

## Code Standards

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Target ES6 with modern features
- Exclude test files from build

### Component Patterns
- Use Radix UI primitives for accessibility
- Implement compound component patterns
- Forward refs for reusable components
- Use `cn()` utility for className merging

### API Route Patterns
- Authentication with `authenticateRequest()`
- Rate limiting with `rateLimitByIp()`
- Zod validation for request bodies
- Proper error handling and status codes
- Idempotency support for mutations

### Database Patterns
- Use Drizzle ORM for type safety
- Define relations in schema
- Use prepared statements for performance
- Implement proper error handling

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project ID
- `STACK_SECRET_SERVER_KEY` - Stack Auth secret key
- `NEXT_PUBLIC_APP_URL` - Application URL

### Optional
- `OPENAI_API_KEY` - For AI functionality
- `RESEND_API_KEY` - For email notifications
- `CHARGEBEE_API_KEY` - For billing

## Build Configuration

### Next.js Config
- Standalone output for Docker deployment
- Image optimization with WebP/AVIF
- Bundle optimization with code splitting
- Security headers for production
- Node.js fallbacks for client-side

### Tailwind Config
- Custom color palette with SoloBoss branding
- Agent-specific color schemes
- Custom animations and keyframes
- Responsive design utilities

## Performance Guidelines

- Use Server Components where possible
- Implement streaming for AI responses
- Optimize images with Next.js Image component
- Bundle splitting for vendor libraries
- Proper caching headers

## Security Best Practices

- Environment variable validation
- Rate limiting on API routes
- Input validation with Zod
- Secure authentication flow
- CSRF protection
- Content Security Policy headers