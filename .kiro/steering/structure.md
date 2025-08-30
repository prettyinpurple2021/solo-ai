# Project Structure & Organization

## Root Directory Structure

```
soloboss-ai-platform/
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── db/                     # Database schema and configuration
├── hooks/                  # Custom React hooks
├── migrations/             # Database migrations (Drizzle)
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
├── docs/                   # Documentation
├── test/ & tests/          # Test files
└── .kiro/                  # Kiro AI assistant configuration
```

## App Directory (Next.js App Router)

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── globals.css             # Global styles
├── api/                    # API routes
│   ├── goals/              # Goal management endpoints
│   ├── tasks/              # Task management endpoints
│   ├── chat/               # AI chat endpoints
│   └── dashboard/          # Dashboard data endpoints
├── dashboard/              # Dashboard pages
├── auth/                   # Authentication pages
├── profile/                # User profile pages
└── [feature]/              # Feature-specific pages
```

## Components Organization

```
components/
├── ui/                     # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── auth/                   # Authentication components
├── dashboard/              # Dashboard-specific components
├── ai/                     # AI agent components
├── forms/                  # Form components
├── shared/                 # Shared utility components
└── [feature]/              # Feature-specific components
```

## Library Organization

```
lib/
├── utils.ts                # General utilities (cn function)
├── auth.ts                 # Authentication utilities
├── db/                     # Database utilities
├── ai-config.ts            # AI service configuration
├── env-validation.ts       # Environment validation
├── rate-limit.ts           # Rate limiting utilities
├── types.ts                # TypeScript type definitions
└── [service]/              # Service-specific utilities
```

## Database Structure

```
db/
├── index.ts                # Database connection
├── schema.ts               # Drizzle schema definitions
└── migrations/             # Generated migrations
```

## Hooks Organization

```
hooks/
├── use-auth.tsx            # Authentication hook
├── use-dashboard-data.ts   # Dashboard data fetching
├── use-ai-chat.ts          # AI chat functionality
├── use-projects.ts         # Project management
└── use-[feature].ts        # Feature-specific hooks
```

## Naming Conventions

### Files and Directories
- **kebab-case** for directories: `auth-example/`, `sign-in/`
- **kebab-case** for component files: `nav-main.tsx`, `team-switcher.tsx`
- **camelCase** for utility files: `useAuth.tsx`, `aiConfig.ts`

### Components
- **PascalCase** for component names: `Button`, `NavMain`, `TeamSwitcher`
- **camelCase** for props and variables
- **SCREAMING_SNAKE_CASE** for constants

### API Routes
- **RESTful** naming: `/api/goals`, `/api/tasks`, `/api/chat`
- **Nested resources**: `/api/goals/[id]`, `/api/users/[id]/tasks`

## Import Patterns

### Path Aliases
- Use `@/` for imports from project root
- Example: `import { Button } from "@/components/ui/button"`

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (with `type` keyword)

```typescript
import React from "react"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { authenticateRequest } from "@/lib/auth-server"
import type { User } from "@/lib/types"
```

## Component Structure

### UI Components (shadcn/ui pattern)
```typescript
// components/ui/button.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(/* variants */)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Component implementation
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Feature Components
```typescript
// components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  // Component implementation
}
```

## API Route Structure

```typescript
// app/api/goals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  // Authentication
  // Rate limiting
  // Business logic
  // Response
}

export async function POST(request: NextRequest) {
  // Validation schema
  // Authentication
  // Rate limiting
  // Idempotency
  // Business logic
  // Response
}
```

## Configuration Files Location

- **Environment**: `.env.example`, `.env.local`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.ts`
- **Next.js**: `next.config.mjs`
- **Database**: `drizzle.config.ts`
- **Testing**: `jest.config.js`, `playwright.config.ts`
- **Linting**: `.eslintrc.json`, `eslint.config.mjs`

## Special Directories

### Documentation
- `docs/` - Project documentation
- `wiki/` - Detailed guides and architecture docs
- `README.md` - Main project overview

### Deployment
- `Dockerfile` - Container configuration
- `cloudbuild.yaml` - Google Cloud Build
- `deploy-gcp.sh` - Deployment script

### Assets
- `public/images/` - Static images
- `public/icons/` - Icon files
- `uploads/` - User-uploaded files (development)

## File Organization Best Practices

1. **Group by feature** rather than file type when possible
2. **Keep related files close** to where they're used
3. **Use index files** to create clean import paths
4. **Separate concerns** - UI, business logic, and data access
5. **Follow Next.js conventions** for routing and API structure