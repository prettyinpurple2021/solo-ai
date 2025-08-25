# 🚀 SoloBoss AI Platform - Complete Setup Guide

This guide will help you set up your SoloBoss AI platform with a Neon database and Chargebee integration.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Neon PostgreSQL database
- A Stack Auth account
- (Optional) Chargebee account for billing
- (Optional) AI service API keys

## 🔧 Step 1: Environment Setup

1. **Copy the environment template:**
```bash
cp .env.example .env.local
```

2. **Fill in your environment variables** (see sections below for obtaining these values)

## 🗄️ Step 2: Database Setup (Neon)

### 2.1 Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string
4. Add it to `.env.local` as `DATABASE_URL`

### 2.2 Run Database Migration

```bash
# Install dependencies
npm install

# Run the Neon database setup
npm run setup-neon-db
```

This will:
- Create all necessary tables
- Set up AI agents
- Create achievements system
- Verify the setup

## 🔐 Step 3: Authentication Setup (Stack Auth)

### 3.1 Create Stack Auth Project

1. Go to [Stack Auth Dashboard](https://stack-auth.com)
2. Create a new project
3. Copy your project credentials
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STACK_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-publishable-key"
   STACK_SECRET_SERVER_KEY="your-secret-key"
   ```

### 3.2 Configure Stack Auth URLs

In your Stack Auth dashboard, set these URLs:
- **Sign In URL**: `https://your-domain.com/signin`
- **Sign Up URL**: `https://your-domain.com/signup`
- **After Sign In**: `https://your-domain.com/dashboard`

## 🌐 Step 4: Deployment

Deploy the application to Google Cloud Run. Ensure you set up all the environment variables from your `.env.local` file in Cloud Run's environment configuration.

## 💳 Step 5: Billing Setup (Optional - Chargebee)

### 5.1 Create Chargebee Account

1. Sign up at [Chargebee](https://chargebee.com)
2. Set up your site
3. Create subscription plans that match your pricing page
4. Add credentials to `.env.local`:
   ```
   CHARGEBEE_API_KEY="your-api-key"
   CHARGEBEE_SITE="your-site-name"
   CHARGEBEE_WEBHOOK_SIGNING_KEY="your-webhook-key"
   ```

### 5.2 Configure Webhooks

Set up webhook endpoint in Chargebee:
- **URL**: `https://your-domain.com/api/billing/chargebee/webhook`
- **Events**: subscription_created, subscription_changed, subscription_cancelled

## 🤖 Step 6: AI Services Setup (Optional)

### 6.1 OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY="sk-..."
   ```

### 6.2 Google Gemini Setup

1. Get API key from [Google AI Studio](https://aistudio.google.com)
2. Add to `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY="your-key"
   ```

## 📧 Step 7: Email Setup (Optional)

### 7.1 Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Verify your domain
3. Get API key and add to `.env.local`:
   ```
   RESEND_API_KEY="re_..."
   FROM_EMAIL="noreply@yourdomain.com"
   ```

## 🧪 Step 8: Testing Your Setup

### 8.1 Local Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Test sign up/sign in flows
# Test AI agent interactions (if AI keys are configured)
```

### 8.2 Production Testing

After deploying:
1. Test authentication flows
2. Test database operations
3. Test AI agent interactions
4. Test billing flows (if Chargebee is configured)

## 🔍 Step 9: Monitoring & Maintenance

### 9.1 Database Monitoring

Monitor your Neon database usage and performance in the Neon console.

### 9.2 Application Monitoring

Check your cloud provider's logs for any issues.

### 9.3 Error Tracking

Consider adding error tracking (like Sentry) for production monitoring.

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables are set in your hosting environment.
2. **Database Connection**: Verify DATABASE_URL is correct.
3. **Auth Issues**: Check Stack Auth configuration.
4. **AI Not Working**: Verify API keys are valid.

### Getting Help

- Check the logs in your cloud provider's dashboard.
- Verify environment variables in your deployment settings.
- Test locally first before deploying.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Chargebee API Documentation](https://apidocs.chargebee.com)

---

🎉 **Congratulations!** Your SoloBoss AI platform is now ready for production!
