# SoloBoss AI Platform - Environment Variables Setup

This document provides a comprehensive guide to setting up all required environment variables for the SoloBoss AI platform.

## Required Environment Variables

### Database Configuration
\`\`\`bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### AI Services
\`\`\`bash
# OpenAI (for Roxy, Nova, Vex, Glitch agents)
OPENAI_API_KEY=your_openai_api_key

# Google Gemini (for Blaze, Echo, Lexi, Lumi agents)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
\`\`\`

### Payment Processing (Stripe)
\`\`\`bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Product IDs
STRIPE_LAUNCHPAD_PRODUCT_ID=prod_launchpad
STRIPE_ACCELERATOR_PRODUCT_ID=prod_accelerator
STRIPE_DOMINATOR_PRODUCT_ID=prod_dominator

# Price IDs
STRIPE_LAUNCHPAD_PRICE_ID_MONTHLY=price_launchpad_monthly
STRIPE_ACCELERATOR_PRICE_ID_MONTHLY=price_accelerator_monthly
STRIPE_ACCELERATOR_PRICE_ID_YEARLY=price_accelerator_yearly
STRIPE_DOMINATOR_PRICE_ID_MONTHLY=price_dominator_monthly
STRIPE_DOMINATOR_PRICE_ID_YEARLY=price_dominator_yearly
\`\`\`

### Email Service
\`\`\`bash
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@soloboss.ai
\`\`\`

### File Storage
\`\`\`bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
\`\`\`

### Application Configuration
\`\`\`bash
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

## Setup Instructions

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your URL and keys
3. Run the SQL scripts in `/scripts/` to set up your database schema

### 2. OpenAI Setup
1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key in the API Keys section
3. Ensure you have sufficient credits for GPT-4 usage

### 3. Google Gemini Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Gemini Pro API

### 4. Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create products for each subscription tier:
   - Boss Launchpad ($29/month)
   - Empire Accelerator ($79/month, $790/year)
   - Boss Dominator ($199/month, $1990/year)
3. Copy the product and price IDs to your environment variables
4. Set up webhooks pointing to `/api/stripe/webhooks`

### 5. Resend Email Setup
1. Create an account at [resend.com](https://resend.com)
2. Generate an API key
3. Verify your sending domain

### 6. Vercel Blob Setup
1. In your Vercel dashboard, go to Storage
2. Create a new Blob store
3. Copy the read/write token

## Environment Variable Validation

The application includes environment variable validation in `lib/env-validation.ts`. Missing or invalid environment variables will cause the application to fail at startup with clear error messages.

## Security Notes

- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Set up proper CORS policies for your domains
- Use webhook secrets to verify Stripe webhook authenticity

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add all environment variables in the Vercel dashboard
3. Deploy your application

### Other Platforms
Ensure all environment variables are properly set in your deployment platform's configuration.

## Troubleshooting

### Common Issues
1. **Supabase Connection Errors**: Verify your URL and keys are correct
2. **AI API Errors**: Check your API keys and account credits
3. **Stripe Webhook Errors**: Ensure webhook URL is accessible and secret is correct
4. **Email Delivery Issues**: Verify your domain is properly configured with Resend

### Support
For additional help, check the documentation for each service or contact support.
