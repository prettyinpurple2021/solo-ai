# SoloSuccess AI Platform - Production Standards & Guidelines

**Version:** 1.0
**Last Updated:** December 30, 2025
**Status:** Living Document - Updated as platform evolves

---

## Overview

This document defines the production quality standards for all code, features, and documentation in the SoloSuccess AI platform. All contributions must adhere to these standards before merging into the main branch.

**All that touch the codebase are responsible for understanding and following these guidelines.**

---

## Core Principles

### 1. Code Quality First

- All code must be production-ready before submission
- Code reviews are mandatory before merge
- No exceptions for deadlines or priority

### 2. Never Assume - Always Ask

- When uncertain about requirements, implementation approach, or testing strategy, ask the user for clarification
- When uncertain about documentation needs or workflow decisions, ask the user for guidance
- Assumptions lead to technical debt and bugs

### 3. No Incomplete Code in Production

- ❌ Do NOT comment out unfinished features
- ❌ Do NOT disable features that need implementation or fixes
- ❌ Do NOT delete code for incomplete work
- ✅ Do create feature branches for ongoing work
- ✅ Do use feature flags for incomplete features
- ✅ Do document incomplete sections clearly with TODO comments linked to issues

### 4. Data & Content Integrity

- ❌ Do NOT add fake metrics, dummy data, or placeholder content to production
- ❌ Do NOT use sample data without clear labeling as such
- ✅ Do use real data from verified sources
- ✅ Do clearly document any test/staging data
- ✅ Do separate development fixtures from production code

---

## Code Standards

### TypeScript & JavaScript

#### File Structure

```text
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── services/         # External API clients
├── constants/        # Application constants
└── styles/           # Global and component styles
```

#### Naming Conventions

- Files: `kebab-case` (e.g., `user-profile.tsx`, `api-client.ts`)
- Directories: `kebab-case` (e.g., `auth-service/`, `ui-components/`)
- Components: `PascalCase` (e.g., `UserProfile`, `LoginForm`)
- Functions: `camelCase` (e.g., `getUserData()`, `formatDate()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `API_TIMEOUT`)
- Interfaces/Types: `PascalCase` (e.g., `User`, `ApiResponse<T>`)

#### TypeScript Requirements

- ✅ All files must have strict mode enabled (`"strict": true` in tsconfig.json)
- ✅ No `any` types - use `unknown` or specific types
- ✅ All function parameters must be typed
- ✅ All return types must be explicit (not inferred)
- ✅ Use interfaces/types for all data structures
- ✅ Use generics for reusable components and functions

#### Example - Good

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

async function fetchUser(userId: string): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
}
```

#### Example - Bad

```typescript
// ❌ Missing types
async function fetchUser(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

// ❌ Using any
function processData(data: any): any {
  return data.map(item => item.value);
}
```

### React Component Standards

#### Functional Components Only

- ✅ All components must be functional with hooks
- ❌ Class components are not allowed
- ✅ Use React.FC or explicit return types

#### Example - Good

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

#### Hook Usage

- ✅ Use hooks at the top level of components
- ✅ Extract complex hook logic into custom hooks
- ✅ Memoize expensive computations with `useMemo`
- ✅ Memoize callbacks with `useCallback` when passed to children
- ❌ Never call hooks conditionally

#### Props Handling

- ✅ Always define prop interfaces/types
- ✅ Use destructuring in parameters
- ✅ Provide sensible defaults for optional props
- ✅ Document non-obvious props

---

## API & Database Standards

### API Endpoints

#### RESTful Design

- Use proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Use appropriate status codes: 200, 201, 400, 401, 403, 404, 500
- Version endpoints: `/api/v1/...` not `/api/...`
- Use plural nouns for resources: `/users` not `/user`

#### Error Handling

```typescript
interface ApiError {
  code: string;           // Machine-readable error code
  message: string;        // User-friendly message
  details?: Record<string, unknown>; // Additional context
  timestamp: string;      // ISO 8601 timestamp
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

#### Example - Good

```typescript
// GET /api/v1/users/:id
async function getUser(userId: string): Promise<ApiResponse<User>> {
  try {
    const user = await db.users.findById(userId);
    if (!user) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      };
    }
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred',
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

### Database

#### Query Standards

- ✅ Use type-safe queries (Drizzle, etc.)
- ✅ Add indexes for frequently queried fields
- ✅ Use transactions for multi-step operations
- ✅ Document complex queries with comments
- ❌ Never use raw SQL strings with user input
- ✅ Always use parameterized queries

#### Example - Good

```typescript
// Find users created in the last 30 days with verified email
const recentUsers = await db.user.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    emailVerified: true
  },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true
  }
});
```

---

## Testing Standards

### Test Coverage Requirements

#### Minimum Coverage

- ✅ All public functions: 100% line coverage
- ✅ All React components: 80% coverage
- ✅ All API endpoints: 90% coverage
- ✅ All critical workflows: 100% coverage

### Unit Tests

#### Pattern: Arrange-Act-Assert

```typescript
describe('calculateUserScore', () => {
  it('should calculate score correctly for active user', () => {
    // Arrange
    const user = { id: '1', activeMinutes: 100, tasksCompleted: 5 };

    // Act
    const score = calculateUserScore(user);

    // Assert
    expect(score).toBe(150);
  });

  it('should return 0 for inactive user', () => {
    const user = { id: '2', activeMinutes: 0, tasksCompleted: 0 };
    const score = calculateUserScore(user);
    expect(score).toBe(0);
  });
});
```

### Integration Tests

- ✅ Test full workflows with real dependencies
- ✅ Use test databases (not production)
- ✅ Clean up test data after each test
- ✅ Test error scenarios and edge cases

### E2E Tests

- ✅ Test critical user journeys
- ✅ Test authentication flows
- ✅ Test data persistence
- ✅ Use staging environment or Docker containers

---

## Documentation Standards

### Code Comments

#### When to Comment

- ✅ Complex algorithms or business logic
- ✅ Non-obvious design decisions
- ✅ Workarounds for bugs or limitations
- ✅ TODO items linked to GitHub issues
- ❌ Don't comment obvious code

#### Good Comment

```typescript
// Handle timezone offset - user's local time needed for daily digest
// Without this, users in different timezones receive digest at same UTC time
const userLocalTime = new Date(user.lastLogin.getTime() + user.timezoneOffset);
```

### Function Documentation

#### JSDoc Format

```typescript
/**
 * Calculates a user's engagement score based on activity metrics.
 * 
 * @param user - The user object containing activity data
 * @param options - Optional configuration
 * @param options.maxScore - Maximum possible score (default: 1000)
 * @returns The calculated engagement score
 * @throws {Error} If user data is invalid
 * @example
 * const score = calculateScore(user, { maxScore: 500 });
 */
export function calculateScore(
  user: User,
  options?: { maxScore?: number }
): number {
  // Implementation...
}
```

### README Files

Every module/package must have a README.md:

- ✅ Purpose and overview
- ✅ Installation/setup instructions
- ✅ Usage examples
- ✅ API documentation
- ✅ Common issues and solutions

### Changelog

Maintain a CHANGELOG.md with:

- ✅ Version numbers (semantic versioning)
- ✅ Release dates
- ✅ Added features
- ✅ Fixed bugs
- ✅ Breaking changes (if any)

---

## Git & Collaboration Standards

### Branch Naming

```text
feature/user-authentication       # New features
bugfix/login-redirect-issue       # Bug fixes
hotfix/critical-api-crash         # Critical production fixes
refactor/component-optimization   # Code improvements
docs/api-documentation            # Documentation updates
test/coverage-improvements        # Test additions
```

### Commit Messages

```text
feat: add user authentication with OAuth2
fix: resolve infinite loop in data processing
refactor: simplify component prop handling
docs: update API documentation
test: add tests for payment validation
chore: update dependencies
```

**Format:** `type: description` (lowercase, imperative mood)

### Pull Request Standards

#### Every PR Must Include

- ✅ Clear description of changes
- ✅ Link to related issue
- ✅ Screenshot/video if UI change
- ✅ Testing steps
- ✅ Breaking changes (if any)
- ✅ Checklist of completed items

#### PR Checklist Template

```markdown
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] New tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Reviewed by at least one team member
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance Required

#### Color & Contrast

- ✅ Text has minimum 4.5:1 contrast ratio
- ✅ Large text (18pt+) has 3:1 ratio
- ✅ Color not sole means of information

#### Keyboard Navigation

- ✅ All functionality available via keyboard
- ✅ Logical tab order (top to bottom, left to right)
- ✅ No keyboard traps
- ✅ Skip links for main content

#### Screen Readers

- ✅ Semantic HTML (buttons, links, headings)
- ✅ ARIA labels where semantic HTML insufficient
- ✅ Form labels properly associated
- ✅ Images have alt text

#### Example - Good

```html
<div role="main" aria-label="Main content">
  <h1>Dashboard</h1>

  <button 
    aria-label="Close modal"
    onClick={onClose}
  >
    ✕
  </button>

  <img 
    src="chart.png" 
    alt="Monthly revenue trend showing 25% growth"
  />
</div>
```

---

## Performance Standards

### Frontend Performance

#### Core Web Vitals Targets

- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ First Input Delay (FID): < 100ms
- ✅ Cumulative Layout Shift (CLS): < 0.1

#### Optimization Guidelines

- ✅ Code split by route/feature
- ✅ Lazy load images and heavy components
- ✅ Minify CSS/JS/images
- ✅ Use CDN for static assets
- ✅ Cache aggressively (where appropriate)

### Backend Performance

#### API Response Times

- ✅ Simple queries: < 100ms
- ✅ Complex queries: < 500ms
- ✅ Bulk operations: < 2s

#### Database Performance

- ✅ Add indexes for frequently queried columns
- ✅ Monitor slow queries
- ✅ Use connection pooling
- ✅ Archive old data

---

## Security Standards

### Authentication & Authorization

- ✅ Use industry-standard auth (Custom JWT)
- ✅ Implement role-based access control (RBAC)
- ✅ Never store passwords in plain text
- ✅ Use HTTPS for all communication
- ✅ Implement rate limiting on auth endpoints

### Data Protection

- ✅ Validate all user input
- ✅ Sanitize data for XSS prevention
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Encrypt sensitive data at rest
- ✅ Use secure headers (CSP, HSTS, X-Frame-Options)

### Secrets Management

- ✅ Use environment variables for secrets
- ✅ Never commit secrets to git
- ✅ Rotate secrets regularly
- ✅ Use separate secrets for dev/staging/production

---

## Deployment Standards

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console.error or console.warn messages
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Database migrations tested
- [ ] Rollback plan documented

### Deployment Process

1. **Staging Deployment**
   - Deploy to staging environment
   - Run smoke tests
   - Verify functionality
   - Performance test

2. **Production Deployment**
   - Deploy during low-traffic period (if possible)
   - Monitor error rates and performance
   - Have rollback plan ready
   - Notify team of deployment

3. **Post-Deployment**
   - Monitor logs for errors
   - Check key metrics
   - Verify user reports
   - Document any issues

---

## When You're Uncertain

**Always ask the user for clarification on:**

- Requirements or acceptance criteria
- Implementation approach or architecture
- Testing strategy or test coverage needs
- Documentation format or content
- Workflow or process decisions
- Code style or naming conventions
- Performance or optimization trade-offs
- Security or compliance considerations
- Deployment or release procedures

**Do not assume or guess. Unclear requirements lead to rework and technical debt.**

---

## Violation & Remediation

### Code Review Rejection

If your PR is rejected:

1. Read feedback carefully
2. Ask for clarification if needed
3. Make requested changes
4. Re-request review
5. Do not force merge without approval

---

## Continuous Improvement

This document is a living document and will evolve as the platform grows.

**How to suggest updates:**

1. Propose specific changes
2. Propose specific wording
3. Get user consensus
4. Update this document
5. Communicate changes to user

---

## Resources & Tools

### Code Quality

- **Linter:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** React Testing Library + JSDOM
- **Performance:** Lighthouse, WebPageTest

### Security

- **Dependency Scanning:** npm audit
- **Code Analysis:** CodeQL (coming soon)
- **Secrets:** Environment Secrets

### Documentation

- **API Docs:** Swagger/OpenAPI
- **Component Docs:** Storybook
- **Architecture:** Diagrams.net, Miro

---

**Last Review:** December 30, 2025
**Next Review:** March 30, 2026
**Maintained By:** Engineering Team
**Questions?** Reach out to the team lead or create an issue
