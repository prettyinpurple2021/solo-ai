# SoloBoss AI Platform - Production Deployment Guide

## 🚀 Overview

This guide will walk you through deploying your SoloBoss AI platform to production on Google Cloud Run with Neon PostgreSQL database and various third-party integrations.

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [ ] Google Cloud Platform account with billing enabled
- [ ] Neon PostgreSQL database
- [ ] OpenAI API key
- [ ] Stack Auth account
- [ ] Sentry account (for error monitoring)
- [ ] Domain name (optional)

## 🔧 Step 1: Environment Setup

### 1.1 Database Setup (Neon)

1. **Create Neon Database:**
   ```bash
   # Run the database setup script
   node scripts/run-complete-schema.mjs
   ```

2. **Verify Database Connection:**
   ```bash
   # Test database connectivity
   node scripts/verify-database.mjs
   ```

3. **Seed Initial Data:**
   ```bash
   # The setup script already seeds AI agents and achievements
   # Verify with:
   node scripts/test-api-routes.mjs
   ```

### 1.2 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Stack Auth)
STACK_API_KEY=your_stack_api_key
STACK_APP_ID=your_stack_app_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Sentry (Error Monitoring)
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Optional: Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
```

## 🌐 Step 2: Google Cloud Run Deployment

### 2.1 Setup Google Cloud

1. **Create Project:**
   ```bash
   gcloud projects create your-project-id --name="SoloBoss AI Platform"
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

### 2.2 Build and Deploy

1. **Build Docker Image:**
   ```bash
   gcloud builds submit --tag gcr.io/your-project-id/soloboss-ai-platform
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy soloboss-ai-platform \
     --image gcr.io/your-project-id/soloboss-ai-platform \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10
   ```

### 2.3 Environment Variables in Cloud Run

Add all environment variables from your `.env.local` file to Cloud Run:

1. **Using Secret Manager (Recommended):**
   ```bash
   # Create secrets
   echo -n "your-database-url" | gcloud secrets create DATABASE_URL --data-file=-
   echo -n "your-stack-secret" | gcloud secrets create STACK_SECRET_SERVER_KEY --data-file=-
   
   # Update service with secrets
   gcloud run services update soloboss-ai-platform \
     --region us-central1 \
     --set-secrets DATABASE_URL=DATABASE_URL:latest,STACK_SECRET_SERVER_KEY=STACK_SECRET_SERVER_KEY:latest
   ```

2. **Or using environment variables directly:**
   ```bash
   gcloud run services update soloboss-ai-platform \
     --region us-central1 \
     --set-env-vars NODE_ENV=production,NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

### 2.4 Domain Configuration

1. **Custom Domain (Optional):**
   ```bash
   gcloud run domain-mappings create \
     --service soloboss-ai-platform \
     --domain your-domain.com \
     --region us-central1
   ```

2. **SSL Certificate:**
   - Cloud Run automatically provides SSL certificates
   - HTTPS is enforced by default

## 🔒 Step 3: Security Configuration

### 3.1 Security Headers

The platform includes comprehensive security headers in `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
        },
      ],
    },
  ]
}
```

### 3.2 Rate Limiting

The platform includes rate limiting for:
- Authentication endpoints
- API routes
- File uploads

### 3.3 CORS Configuration

CORS is configured to allow only trusted domains:

```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
]
```

## 📊 Step 4: Monitoring & Analytics

### 4.1 Sentry Error Monitoring

1. **Configure Sentry:**
   - Create a Sentry project
   - Add your DSN to environment variables
   - Verify error reporting is working

2. **Performance Monitoring:**
   - Monitor Core Web Vitals
   - Track API response times
   - Monitor database performance

### 4.2 Performance Monitoring

The platform includes built-in performance monitoring:

- Core Web Vitals tracking
- API response time monitoring
- Database query performance
- User experience metrics

### 4.3 Health Checks

Monitor these endpoints:

- `https://your-domain.com/api/health` - Basic health check
- `https://your-domain.com/api/health/deps` - Dependency health check

## 🔄 Step 5: CI/CD Pipeline

### 5.1 GitHub Actions

The platform includes a comprehensive CI/CD pipeline:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### 5.2 Automated Testing

The pipeline includes:
- Unit tests
- Integration tests
- E2E tests with Playwright
- Type checking
- Linting

## 📱 Step 6: PWA Configuration

### 6.1 Service Worker

The platform includes a service worker for:
- Offline functionality
- Caching strategies
- Background sync

### 6.2 PWA Manifest

Configure the PWA manifest in `public/manifest.json`:

```json
{
  "name": "SoloBoss AI - Your AI-Powered Business Platform",
  "short_name": "SoloBoss AI",
  "description": "The ultimate AI-powered platform for solo entrepreneurs",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1"
}
```

## 🔧 Step 7: Post-Deployment Verification

### 7.1 Functionality Tests

Run these tests after deployment:

1. **Authentication Flow:**
   - Sign up new user
   - Sign in existing user
   - Password reset functionality

2. **Core Features:**
   - Task creation and management
   - Goal setting and tracking
   - AI agent conversations
   - Template system
   - File uploads

3. **Performance Tests:**
   - Page load times
   - API response times
   - Database query performance

### 7.2 Security Tests

1. **Authentication Security:**
   - Test JWT token validation
   - Verify rate limiting
   - Check CORS configuration

2. **Data Security:**
   - Verify data encryption
   - Test user data isolation
   - Check file upload security

### 7.3 Integration Tests

1. **Third-party Integrations:**
   - OpenAI API connectivity
   - Stack Auth integration
   - Sentry error reporting

## 📈 Step 8: Performance Optimization

### 8.1 Database Optimization

1. **Indexes:**
   - Verify all indexes are created
   - Monitor query performance
   - Optimize slow queries

2. **Connection Pooling:**
   - Configure connection limits
   - Monitor connection usage
   - Set up connection timeouts

### 8.2 Caching Strategy

1. **Application Caching:**
   - API response caching
   - Static asset caching
   - Database query caching

2. **CDN Configuration:**
   - Google Cloud CDN is automatically configured
   - Optimize asset delivery through Cloud Run
   - Enable compression

## 🔍 Step 9: Monitoring & Maintenance

### 9.1 Regular Monitoring

1. **Performance Metrics:**
   - Monitor Core Web Vitals
   - Track API response times
   - Monitor database performance

2. **Error Tracking:**
   - Review Sentry error reports
   - Monitor application logs
   - Track user feedback

### 9.2 Backup Strategy

1. **Database Backups:**
   - Set up automated backups
   - Test backup restoration
   - Monitor backup success

2. **Application Backups:**
   - Version control all changes
   - Document configuration changes
   - Maintain deployment scripts

## 🚨 Step 10: Troubleshooting

### 10.1 Common Issues

1. **Build Failures:**
   - Check environment variables
   - Verify Node.js version
   - Review build logs

2. **Database Connection Issues:**
   - Verify DATABASE_URL
   - Check network connectivity
   - Review database logs

3. **Authentication Issues:**
   - Verify Stack Auth configuration
   - Check JWT token settings
   - Review authentication logs

### 10.2 Support Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com)

## 🎉 Deployment Complete!

Your SoloBoss AI platform is now deployed and ready for production use!

### Next Steps:

1. **User Onboarding:**
   - Test the onboarding flow
   - Verify user data collection
   - Test AI agent interactions

2. **Feature Testing:**
   - Test all core features
   - Verify integrations work
   - Test mobile responsiveness

3. **Performance Monitoring:**
   - Monitor user engagement
   - Track performance metrics
   - Gather user feedback

4. **Scaling Preparation:**
   - Monitor resource usage
   - Plan for scaling
   - Optimize performance

---

**Need Help?** Contact the development team or refer to the troubleshooting section above.

**Last Updated:** January 2025
**Version:** 1.0.0
