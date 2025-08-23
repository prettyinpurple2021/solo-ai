# GCP Deployment Fix for Forbidden Error

This document outlines the fixes implemented to resolve the "forbidden" error when accessing the GCP-deployed SoloBoss AI platform.

## Root Cause Analysis

The forbidden error was caused by several issues:

1. **Automatic Redirect Loop**: The app was automatically redirecting "/" to "/dashboard", which caused authentication loops
2. **Missing Authentication Error Page**: Auth callbacks referenced non-existent error pages
3. **Restrictive Security Headers**: Headers were too restrictive for production domain access
4. **Missing CORS Headers**: Production domains weren't properly allowed for API access

## Fixes Implemented

### 1. Removed Automatic Redirect
**File:** `next.config.mjs`
- Removed automatic redirect from "/" to "/dashboard"
- This allows users to access the home page without authentication requirements

### 2. Created Authentication Error Page
**File:** `app/auth-code-error/page.tsx` (NEW)
- Created comprehensive auth error page with proper error handling
- Supports various OAuth error codes (access_denied, invalid_request, etc.)
- Provides user-friendly error messages and recovery options

### 3. Enhanced Security Headers
**File:** `next.config.mjs`
- Changed X-Frame-Options from "DENY" to "SAMEORIGIN" for general pages
- Added Permissions-Policy headers
- Kept strict headers for API routes while allowing proper functionality

### 4. Added CORS Support
**File:** `middleware.ts`
- Added comprehensive CORS headers for API routes
- Support for production domains (soloboss-ai-v3.web.app, etc.)
- Proper preflight request handling
- Configured allowed origins, methods, and headers

## GCP Environment Variable Requirements

Ensure these environment variables are properly set in your GCP Cloud Run service:

### Required Variables
```bash
# Stack Auth (Critical)
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key

# Database (Critical)
DATABASE_URL=your-neon-database-url

# App Configuration (Critical)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NODE_ENV=production

# JWT Secret (Recommended)
JWT_SECRET=your-32-character-or-longer-jwt-secret
```

### Optional but Recommended
```bash
# AI Services
OPENAI_API_KEY=your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key

# Email Services
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@your-domain.com

# Billing (if using)
CHARGEBEE_API_KEY=your-chargebee-key
CHARGEBEE_SITE=your-chargebee-site
```

## GCP Cloud Run Configuration Update

Update your `cloudrun.yaml` to include your production domain in CORS allowlist:

```yaml
# Add to env section
- name: NEXT_PUBLIC_APP_URL
  value: "https://your-actual-domain.com"
```

## Stack Auth Configuration

1. **Update Stack Auth Project Settings:**
   - Go to your Stack Auth dashboard
   - Add your production domain to allowed origins
   - Ensure callback URLs include your production domain
   - Example: `https://your-domain.com/handler/[...stack]`

2. **Verify Authentication Flow:**
   - Sign-in URL: `https://your-domain.com/signin`
   - Sign-up URL: `https://your-domain.com/signup`
   - Error handling: `https://your-domain.com/auth-code-error`

## Testing the Fixes

After redeployment, test these endpoints:

```bash
# Should return 200 OK (not redirect)
curl -I https://your-domain.com/

# Should return proper health status
curl https://your-domain.com/api/health

# Should handle auth errors gracefully
curl https://your-domain.com/auth-code-error?error=access_denied

# Should return proper CORS headers
curl -H "Origin: https://your-domain.com" -I https://your-domain.com/api/health
```

## Deployment Steps

1. **Update Environment Variables in GCP:**
   ```bash
   gcloud run services update soloboss-ai-platform \
     --region=us-central1 \
     --set-env-vars="NEXT_PUBLIC_APP_URL=https://your-domain.com"
   ```

2. **Rebuild and Deploy:**
   ```bash
   # Build new image with fixes
   docker build -t gcr.io/your-project/soloboss-ai-platform:fixed .
   
   # Deploy to Cloud Run
   gcloud run deploy soloboss-ai-platform \
     --image gcr.io/your-project/soloboss-ai-platform:fixed \
     --region=us-central1
   ```

3. **Update Stack Auth Settings:**
   - Add production domain to allowed origins
   - Update callback URLs for production

## Monitoring

After deployment, monitor these metrics:
- Authentication success rate
- API response times
- Error rates for auth endpoints
- CORS-related errors in browser console

The forbidden error should now be resolved, and users should be able to access your application properly.