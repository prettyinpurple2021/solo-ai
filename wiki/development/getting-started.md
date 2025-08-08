# Getting Started - Development Guide

## 🚀 Quick Start

This guide will help you set up the SoloBoss AI Platform development environment and get you coding in minutes.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18.17.0 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest"
  ]
}
```

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space for dependencies
- **OS**: Windows 10+, macOS 10.15+, or Linux

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/prettyinpurple2021/v0-solo-boss-ai-platform.git

# Navigate to the project directory
cd v0-solo-boss-ai-platform
```

### 2. Install Dependencies

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install

# Verify installation
pnpm --version
```

### 3. Environment Configuration

Create your environment file:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Configure your `.env.local` file:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

# Subscription Configuration (Development)
# Note: Payment processing has been removed from this project
# Pricing tiers are display-only for marketing purposes

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# File Storage (using Supabase Storage)

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup

#### Supabase Local Development (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase services
supabase start

# Run database migrations
supabase db reset
```

#### Using Hosted Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the SQL schema from `/database/schema.sql` in the Supabase SQL editor

## 🏃‍♂️ Running the Development Server

### Start the Development Server

```bash
# Start the Next.js development server
pnpm dev

# Or with specific port
pnpm dev -- --port 3001
```

### Development URLs

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Supabase Studio**: [http://localhost:54323](http://localhost:54323) (if using local)
- **API Routes**: [http://localhost:3000/api](http://localhost:3000/api)

## 🧪 Testing Your Setup

### 1. Verify the Application Loads

Navigate to [http://localhost:3000](http://localhost:3000) and verify:
- ✅ Landing page loads without errors
- ✅ Navigation works correctly
- ✅ Authentication modal opens
- ✅ No console errors

### 2. Test Database Connection

```bash
# Run database health check
pnpm db:check
```

### 3. Test AI Integration

Create a test file to verify AI services:

```typescript
// test-ai.ts
import { openai } from '@/lib/ai'

async function testAI() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, world!' }],
      max_tokens: 50
    })
    console.log('AI Test Successful:', response.choices[0].message.content)
  } catch (error) {
    console.error('AI Test Failed:', error)
  }
}

testAI()
```

## 📁 Project Structure Deep Dive

### Root Directory
```
v0-solo-boss-ai-platform/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Utilities and configurations
├── public/                 # Static assets
├── hooks/                  # Custom React hooks
├── styles/                 # Global styles
├── database/               # Database schemas and migrations
├── docs/                   # Additional documentation
└── wiki/                   # This wiki
```

### App Router Structure
```
app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   ├── signup/
│   └── reset-password/
├── dashboard/              # Protected dashboard routes
│   ├── focus/             # Focus timer feature
│   ├── slaylist/          # Task management
│   ├── brand/             # Brand management
│   ├── briefcase/         # Business intelligence
│   ├── burnout/           # Wellness tracking
│   └── collaboration/     # Team collaboration
├── api/                   # API routes
│   ├── auth/
│   ├── chat/
│   ├── webhooks/
│   └── health/
├── features/              # Public feature pages
├── pricing/               # Pricing page
├── profile/               # User profile
└── team/                  # AI team chat
```

### Component Organization
```
components/
├── ui/                    # Base UI components (Radix + Tailwind)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── auth/                  # Authentication components
├── dashboard/             # Dashboard-specific components
├── shared/                # Shared across features
├── forms/                 # Form components
├── layout/                # Layout components
└── features/              # Feature-specific components
    ├── focus/
    ├── ai-team/
    ├── analytics/
    └── collaboration/
```

## 🔧 Development Workflow

### 1. Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/focus-timer-improvements

# Bug fixes
git checkout -b fix/authentication-redirect-issue

# Documentation
git checkout -b docs/api-documentation-update

# Refactoring
git checkout -b refactor/dashboard-components
```

### 2. Code Quality Checks

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Format code
pnpm format

# Run all checks
pnpm check-all
```

### 3. Development Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm dev:debug        # Start with debug mode
pnpm dev:https        # Start with HTTPS (for testing auth)

# Building
pnpm build            # Build production bundle
pnpm build:analyze    # Build with bundle analyzer

# Database
pnpm db:reset         # Reset local database
pnpm db:seed          # Seed database with test data
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate types from schema

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run end-to-end tests
pnpm test:coverage    # Run tests with coverage

# Deployment
pnpm preview          # Preview production build locally
pnpm deploy           # Deploy to staging
pnpm deploy:prod      # Deploy to production
```

## 🐛 Common Development Issues

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
pnpm dev -- --port 3001
```

### Issue: Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Issue: TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or check types manually
pnpm type-check
```

### Issue: Supabase Connection Failed

```bash
# Check Supabase status
supabase status

# Restart Supabase services
supabase stop
supabase start

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🎯 Development Best Practices

### 1. Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use Tailwind for styling (avoid custom CSS)
- Write descriptive commit messages
- Keep components small and focused

### 2. Performance

```typescript
// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
})

// Optimize images
import Image from 'next/image'

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent() {
  // Component logic
})
```

### 3. Error Handling

```typescript
// Use error boundaries for component errors
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Handle async operations properly
try {
  const result = await apiCall()
  // Handle success
} catch (error) {
  console.error('API call failed:', error)
  // Handle error appropriately
}
```

### 4. Testing

```typescript
// Write tests for new features
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

## 🚀 Next Steps

Once your development environment is set up:

1. **Explore the Codebase**: Start with `/app/page.tsx` and work your way through
2. **Read the Architecture docs**: Understanding the system design
3. **Try the Features**: Use the application to understand user flows
4. **Pick a Task**: Check GitHub Issues for good first issues
5. **Join the Community**: Participate in discussions and code reviews

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## 🤝 Getting Help

If you run into issues:

1. Check this documentation and troubleshooting guides
2. Search existing GitHub Issues
3. Ask in GitHub Discussions
4. Join our Discord community (coming soon)
5. Create a new issue with detailed reproduction steps

---

Happy coding! 🎉 Welcome to the SoloBoss AI Platform development team!