# setup

# development

# Getting Started - Development Guide

## 🚀 Quick Start

This guide will help you set up the SoloSuccess AI Platform development environment and get you coding in minutes.

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
git clone https://github.com/prettyinpurple2021/v0-solo-success-ai-platform.git

# Navigate to the project directory
cd v0-solo-success-ai-platform
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
DATABASE_URL=your_database_connection_string

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

# Subscription Configuration (Development)
# Note: Payment processing has been removed from this project
# Pricing tiers are display-only for marketing purposes

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup

1. **Set up a PostgreSQL database.** You can use a local PostgreSQL instance or a managed service like Neon.
2. **Run the database migrations.** This will create the necessary tables and seed the database with initial data.

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
- **API Routes**: [http://localhost:3000/api](http://localhost:3000/api)

## 🧪 Testing Your Setup

### 1. Verify the Application Loads

Navigate to [http://localhost:3000](http://localhost:3000) and verify:

- ✅ Landing page loads without errors
- ✅ Navigation works correctly
- ✅ Authentication modal opens
- ✅ No console errors

### 2. Test Database Connection

Ensure that the application can connect to your database and that data is being read and written correctly.

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
v0-solo-success-ai-platform/
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

### Issue: Database Connection Failed

```bash
# Verify environment variables
echo $DATABASE_URL
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

Happy coding! 🎉 Welcome to the SoloSuccess AI Platform development team!
# Stack Auth Integration Guide

## Overview

This project has been successfully integrated with Stack Auth for authentication. The implementation includes custom sign-in and sign-up pages, protected routes, and proper error handling.

## Features Implemented

### ✅ Custom Authentication Pages

1. **Sign-In Page** (`app/signin/page.tsx`)
   - Email and password input fields
   - Password visibility toggle
   - Error handling and display
   - Loading states
   - Redirect to `/profile` after successful authentication
   - Link to sign-up page

2. **Sign-Up Page** (`app/signup/page.tsx`)
   - Display name, email, and password fields
   - Password confirmation with validation
   - Password strength requirements (minimum 6 characters)
   - Error handling and display
   - Loading states
   - Redirect to `/profile` after successful registration
   - Link to sign-in page

3. **Protected Profile Page** (`app/profile/page.tsx`)
   - Uses Stack Auth's `useUser` hook for authentication
   - Redirects to `/signin` if user is not authenticated
   - Displays user information (display name, email, avatar)
   - Maintains existing UI and functionality

### ✅ Configuration

1. **Stack Configuration** (`stack.tsx`)
   - Configured with environment variables
   - Custom URL routing for sign-in and sign-up
   - Token store using Next.js cookies

2. **Route Protection**
   - Updated `StackHandler` to exclude `/signin` and `/signup` routes
   - Custom authentication flow without interference from Stack's default handler

3. **Loading States**
   - Updated `app/loading.tsx` with proper loading message

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-stack-publishable-client-key
STACK_SECRET_SERVER_KEY=your-stack-secret-server-key
```

## Setup Instructions

1. **Create Stack Auth Account**
   - Visit [Stack Auth](https://stack-auth.com)
   - Create a new project
   - Get your project ID and API keys

2. **Configure Environment Variables**
   - Copy the environment variables from your Stack Auth dashboard
   - Add them to your `.env.local` file

3. **Test the Implementation**
   - Run `npm run dev` to start the development server
   - Navigate to `/signup` to create a new account
   - Navigate to `/signin` to sign in with existing credentials
   - Test the protected `/profile` page

## Key Components

### Authentication Hooks Used

- `useStackApp()` - Access to Stack Auth client
- `useUser()` - Get current authenticated user
- `signInWithCredential()` - Sign in with email/password
- `signUpWithCredential()` - Sign up with email/password

### UI Components

- Modern, responsive design with Tailwind CSS
- Form validation and error handling
- Loading states and user feedback
- Consistent styling with the existing design system

## Security Features

- Password validation and confirmation
- Error handling for authentication failures
- Protected routes with automatic redirects
- Secure token storage using Next.js cookies

## Customization

The authentication pages can be easily customized by modifying:

- `app/signin/page.tsx` - Sign-in form and styling
- `app/signup/page.tsx` - Sign-up form and styling
- `app/profile/page.tsx` - Profile page layout and content
- `stack.tsx` - Stack Auth configuration

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all required environment variables are set in `.env.local`
   - Restart the development server after adding environment variables

2. **Authentication Errors**
   - Check the browser console for detailed error messages
   - Verify your Stack Auth project configuration
   - Ensure email/password meet the validation requirements

3. **Route Protection Issues**
   - Verify that the `StackHandler` is properly configured to exclude custom routes
   - Check that the `useUser` hook is being used correctly in protected pages

## Next Steps

- Consider adding additional authentication methods (OAuth, magic links)
- Implement password reset functionality
- Add two-factor authentication
- Enhance user profile management features
# reCAPTCHA Enterprise Setup Guide

**Last Updated:** January 2025  
**Status:** Production Ready

This guide consolidates all ReCAPTCHA Enterprise setup instructions, verification steps, and troubleshooting tips.

---

## What You Need

To complete the reCAPTCHA Enterprise setup, you need **3 things**:

1. **Site Key** - Your public site key from Google Cloud Console.
2. **Project ID** - The Google Cloud Project ID (e.g. `solosuccess-ai`).
3. **Google Cloud API Key** - An API key configured for server-side verification.

---

## Step 1: Get Your Google Cloud API Key

The API key is needed for server-side verification. Here's how to create and secure it:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com
   - Make sure you're in the **"solosuccess-ai"** project

2. **Navigate to APIs & Services:**
   - Go to **"APIs & Services"** → **"Credentials"**

3. **Create API Key:**
   - Click the **"+ CREATE CREDENTIALS"** button at the top
   - Select **"API key"**
   - **Copy this key immediately** - it starts with `AIza...`

4. **Restrict the API Key (IMPORTANT):**
   - Click **"RESTRICT KEY"**
   - Under **"API restrictions"**, select **"Restrict key"**
   - Check the box for **"reCAPTCHA Enterprise API"**
   - Under **"Application restrictions"**, choose **"HTTP referrers"** and add your domain: `https://yourdomain.com/*` (or `http://localhost:3000/*` for local testing)
   - Click **"SAVE"**

---

## Step 2: Set Environment Variables

Add these to your `.env.local` (for local development):

```bash
# reCAPTCHA Enterprise Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key-here"
NEXT_PUBLIC_RECAPTCHA_PROJECT_ID="solosuccess-ai"
GOOGLE_CLOUD_API_KEY="your-api-key-here" # Server-side only
```

**For Production Deployment (Vercel):**
1. Go to Vercel Dashboard → Select project → Settings → Environment Variables.
2. Add all three variables exactly as mapped above.
3. Make sure to select "Production" (and optionally "Preview" and "Development").
4. Redeploy your site.

---

## Step 3: Verify Setup

### Code Integration
- **Frontend**: Uses `grecaptcha.enterprise.execute()` and loads `https://www.google.com/recaptcha/enterprise.js` via `src/components/recaptcha/recaptcha-provider.tsx`.
- **Backend API**: The API endpoint `/api/recaptcha/validate` sends requests to `https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_ID}/assessments` and validates scores (minimum default threshold: 0.5).

### Testing
1. **Restart your development server** (`npm run dev`) to load environment variables.
2. **Submit a form** that uses reCAPTCHA (e.g. contact form).
3. **Check the server logs** - you should see:
   `reCAPTCHA Enterprise score for action 'contact': 0.9`

---

## Troubleshooting Guide

### Issue 1: "Google Cloud API key not configured" or "Security verification failed"
- Ensure you added `GOOGLE_CLOUD_API_KEY` to `.env.local`.
- Check that the server was restarted after changing `.env.local`.
- Verify the value doesn't contain curly quotes instead of straight `"` quotes.

### Issue 2: "Project ID not configured"
- Make sure `NEXT_PUBLIC_RECAPTCHA_PROJECT_ID` is set to your Google Cloud project ID (e.g. `solosuccess-ai`).

### Issue 3: "reCAPTCHA Enterprise API error (403 or 401)"
- **403**: Your API key might not have the reCAPTCHA Enterprise API enabled, or HTTP referrer restrictions are blocking the request. Enabled the API via APIs & Services → Library in GCP.
- **401**: Invalid API key. Check for typos or re-copy.

### Issue 4: "Failed to load reCAPTCHA script"
- The Site Key variable is missing or wrong. Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly.

### Hydration Error (Footer)
- Sometimes cached/compiled versions of components cause hydration errors. 
- Solution: Clear browser cache, hard refresh, delete `.next` directory (`rm -rf .next`), and restart dev server.

---

## Security Best Practices
- ✅ **Restrict your API key** to only the reCAPTCHA Enterprise API.
- ✅ **Add HTTP referrer restrictions** to limit where the key can be used.
- ✅ **Never commit API keys** to git (use environment variables).
- ✅ **Use different keys** for development and production if possible.
# Vercel Environment Variables Setup

This document outlines the required environment variables that must be set in Vercel for successful deployment.

## Required Environment Variables

Refer to `env.example` for a complete list of all environment variables needed for the application.

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Select which environments it applies to (Production, Preview, Development)
5. Click **Save**

## Important Notes

- **Environment-Specific**: Make sure to set the correct values for each environment (Production, Preview, Development)
- **Client vs Server**: 
  - `NEXT_PUBLIC_*` variables are exposed to the browser
  - Non-prefixed variables are server-only

Refer to `env.example` for a complete list of all environment variables needed for the application.

