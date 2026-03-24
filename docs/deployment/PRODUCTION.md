# SoloSuccess AI - Production Deployment Guide

**Last Updated:** January 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Start

### TL;DR - Get Live in 15 Minutes

1. **Set up environment variables** in your hosting platform (see [Environment Variables](#environment-variables))
2. **Deploy** the Next.js app to **Vercel** and the Express API (`server/`) to **Railway** (see **[RAILWAY_CONNECT.md](./RAILWAY_CONNECT.md)** and root README “Live site”).
3. **Set up database** at [Neon Console](https://console.neon.tech) and run migrations
4. **Test** your live site and configure custom domain
5. **Launch!** 🎉

For detailed steps, continue reading below.

---

## Environment Variables

### Required for Core Functionality

#### Database & Authentication
```bash
# Database Connection (CRITICAL)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# JWT Authentication (CRITICAL)
JWT_SECRET="your-at-least-32-char-secret-key-here"

# NextAuth Authentication (CRITICAL)
# Generate with: openssl rand -base64 32 or npx auth secret
AUTH_SECRET="your-at-least-32-char-auth-secret-key-here"
```

#### App Configuration
```bash
# Application URL (CRITICAL)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

#### AI Services (Required for AI features)
```bash
# OpenAI API Key
OPENAI_API_KEY="sk-your_openai_api_key_here"

# Optional: Additional AI Providers
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."
```

### Optional but Recommended

#### Email Services
```bash
# Resend API Key for email delivery
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
```

#### Payment Processing
```bash
# Stripe (for subscription billing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

#### Feature Flags & Worker Configuration
```bash
ENABLE_AGENT_MESSAGE_PUMP="true"
ENABLE_SESSION_CLEANUP="true"
ENABLE_NOTIFICATION_PROCESSOR="true"
FEATURE_ENABLE_NOTIFICATIONS="true"
FEATURE_ENABLE_SCRAPING="true"
NOTIF_DAILY_CAP="500"
SCRAPING_USER_HOURLY_CAP="20"
```

#### Additional Services
```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."

# Upstash Queue / Redis (if using worker systems)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
QSTASH_TOKEN=""
```

**📋 Reference:** See `env.example` for a complete list of all available environment variables.

---

## Pre-Deployment Checklist

### Code Quality
- [ ] No mock/demo/simulated data in production code
- [ ] All TODOs resolved or documented
- [ ] No hardcoded credentials or secrets
- [ ] Error handling comprehensive
- [ ] Logging configured appropriately
- [ ] Dead code removed
- [ ] Dependencies up to date (security patches)

### Build Verification
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] All pages compile without errors
- [ ] No console errors in build output

### Database
- [ ] Database migrations ready
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Database connection tested
- [ ] Backup strategy in place

### Environment Setup
- [ ] All required environment variables configured
- [ ] Environment variables set in hosting platform
- [ ] Secrets stored securely (never in code)
- [ ] Domain and SSL configured

### External Services
- [ ] Neon database created and accessible
- [ ] OpenAI API key valid and has credits
- [ ] Stripe account configured (if using payments)
- [ ] Email service configured (if using emails)
- [ ] Analytics configured (if using)

### Testing
- [ ] Core features tested locally
- [ ] Authentication flow tested
- [ ] Database operations tested
- [ ] API endpoints tested
- [ ] Error scenarios tested

---

## Deployment Steps

### Step 1: Choose Your Deployment Platform

#### Option 1: Vercel (Recommended)
1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Connect your Git repository (hosting flow depends on your Git provider)

2. **Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set environment (Production, Preview, Development)

3. **Deploy:**
   - Vercel will auto-detect Next.js configuration
   - Deployment happens automatically on push to main branch
   - Monitor build logs for any errors

#### Option 2: Netlify
1. **Connect Repository:**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your Git repository (hosting flow depends on your Git provider)

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables:**
   - Site Settings → Environment Variables
   - Add all required variables

#### Option 3: Other platforms
- **This repository’s intended production split:** **Vercel** for Next.js, **Railway** for the Express server (`server/`). See README and **[RAILWAY_CONNECT.md](./RAILWAY_CONNECT.md)**.
- Other hosts can work; mirror the same env vars and keep `JWT_SECRET` / `DATABASE_URL` aligned between Vercel and the API service.

### Step 2: Database Setup

1. **Create Neon Database:**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy the connection string

2. **Run Database Migrations:**
   ```bash
   # Set your DATABASE_URL first
   export DATABASE_URL="your_neon_connection_string"
   npm run db:push
   ```

3. **Verify Database:**
   - Check that all tables are created
   - Verify indexes are in place
   - Test database connection

### Step 3: Domain & SSL Setup

1. **Purchase Domain** (if needed)
2. **Configure DNS:**
   - Point your domain to your hosting provider
   - Add CNAME record if using Vercel
   - Wait for DNS propagation (can take up to 48 hours)

3. **SSL Certificate:**
   - Modern hosting platforms provide automatic SSL
   - Verify HTTPS is enabled
   - Test SSL certificate validity

### Step 4: Deploy

1. **Push to Repository:**
   ```bash
   git add .
   git commit -m "Production deployment"
   git push origin main
   ```

2. **Monitor Build:**
   - Watch build logs in your hosting platform dashboard
   - Check for environment variable errors
   - Verify build completes successfully

3. **Verify Deployment:**
   - Visit your production URL
   - Check that the site loads correctly
   - Verify HTTPS is working

---

## Post-Deployment Verification

### Core Functionality Tests

#### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works (if implemented)
- [ ] User session persists across page refreshes
- [ ] Logout works correctly
- [ ] Protected routes require authentication

#### Core Features
- [ ] Dashboard loads correctly
- [ ] AI chat functionality works
- [ ] File upload/download works (if applicable)
- [ ] Data persistence works (create, read, update, delete)
- [ ] Navigation works correctly
- [ ] Forms submit successfully

#### Payment Processing (if applicable)
- [ ] Subscription purchase works
- [ ] Payment webhooks are received
- [ ] User tier updates after payment
- [ ] Stripe test mode verified

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms (95th percentile)
- [ ] Database queries optimized
- [ ] Images load properly
- [ ] No console errors in browser

### Security Tests
- [ ] HTTPS is enabled and working
- [ ] Security headers are set correctly
- [ ] Environment variables not exposed in client code
- [ ] API authentication required
- [ ] SQL injection prevention verified
- [ ] XSS prevention validated
- [ ] CSRF protection enabled

### Browser Testing
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work
- [ ] Mobile browsers - Responsive design works

### Error Handling
- [ ] Error boundaries catch errors gracefully
- [ ] Error messages are user-friendly
- [ ] 404 page displays correctly
- [ ] Invalid routes show 404, not error

---

## Troubleshooting

### Build Failures

**Issue:** Build fails during deployment

**Solutions:**
1. Check TypeScript errors locally:
   ```bash
   npm run typecheck
   ```

2. Check linting errors:
   ```bash
   npm run lint
   ```

3. Verify all dependencies are installed:
   ```bash
   npm install
   ```

4. Check build logs in hosting platform dashboard
5. Ensure Node.js version matches platform requirements

### Database Connection Errors

**Issue:** Application can't connect to database

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check Neon database is active
3. Ensure SSL mode is enabled (`?sslmode=require`)
4. Check database firewall settings
5. Verify database credentials are correct

### Authentication Not Working

**Issue:** Users can't log in or sessions don't persist

**Solutions:**
1. Verify `JWT_SECRET` is set and at least 32 characters
2. Verify `AUTH_SECRET` is set for NextAuth v5
3. Check environment variables are set correctly
4. Clear browser cache and cookies
5. Check middleware configuration
6. Verify session cookies are being set

### AI Features Not Working

**Issue:** AI chat or features don't respond

**Solutions:**
1. Verify `OPENAI_API_KEY` is valid
2. Check OpenAI account has sufficient credits
3. Monitor API usage and rate limits
4. Check API endpoint configuration
5. Review error logs for API errors

### Environment Variable Issues

**Issue:** Application behaves incorrectly or crashes

**Solutions:**
1. Verify all required environment variables are set
2. Check variable names are correct (case-sensitive)
3. Ensure `NEXT_PUBLIC_*` variables are set for client-side access
4. Verify secrets are not exposed in client code
5. Check hosting platform environment variable settings

### Performance Issues

**Issue:** Slow page loads or timeouts

**Solutions:**
1. Check database query performance
2. Verify database indexes are created
3. Check API response times
4. Review bundle sizes
5. Enable caching where appropriate
6. Monitor server resources

---

## Monitoring & Maintenance

### Essential Monitoring

#### Application Performance
- Page load times
- API response times
- Error rates
- Database query performance
- Server uptime

#### User Analytics
- User registrations
- Feature usage
- User retention
- Conversion rates

#### Infrastructure
- Database performance and storage
- API usage and costs (OpenAI, etc.)
- Server resource usage
- CDN performance

### Recommended Tools

- **Vercel Analytics** (if using Vercel)
- **Google Analytics** (for user tracking)
- **Sentry** (for error tracking)
- **PostHog** (for product analytics)
- **Uptime monitoring** (Pingdom, StatusCake, etc.)

### Regular Maintenance Tasks

#### Daily
- Monitor error logs
- Check critical metrics
- Review user feedback

#### Weekly
- Review performance metrics
- Check API usage and costs
- Review security logs
- Update dependencies (security patches)

#### Monthly
- Database backup verification
- Performance optimization review
- Cost analysis and optimization
- Security audit

### Backup Strategy

1. **Database Backups:**
   - Neon provides automatic backups
   - Verify backups are working
   - Test restore procedures

2. **Configuration Backup:**
   - Document all environment variables
   - Store configuration in secure location
   - Version control code changes

3. **Disaster Recovery:**
   - Document recovery procedures
   - Test backup restoration
   - Maintain rollback procedures

---

## Additional Resources

- **Environment Variables Template:** See `env.example`
- **Vercel Environment Setup:** See `docs/VERCEL_ENV_SETUP.md`
- **Database Schema:** See migration files in `migrations/`
- **API Documentation:** See `openapi.json`

---

## Support

### Common Issues
- Check this guide's [Troubleshooting](#troubleshooting) section
- Review error logs in your hosting platform dashboard
- Test locally with production settings

### Getting Help
- Review hosting platform documentation
- Check Next.js documentation for framework-specific issues
- Review service provider documentation (Neon, OpenAI, etc.)

---

**Last Updated:** January 2025  
**Status:** Production Ready  
**Next Review:** After deployment completion
