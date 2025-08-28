# Environment Variables Guide

## Required Environment Variables

### Stack Auth Configuration
```bash
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key
```

### Database Configuration (Neon PostgreSQL)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### OpenAI Configuration
```bash
OPENAI_API_KEY=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
```

### Google Cloud Configuration (for deployment)
```bash
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_REGION=us-central1
```

### Sentry Configuration (optional, for error tracking)
```bash
SENTRY_DSN=your_sentry_dsn
```

### ReCAPTCHA Configuration (optional, for spam protection)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

## Setup Instructions

1. **Create a `.env.local` file** in your project root
2. **Copy the variables above** and replace the placeholder values with your actual credentials
3. **Restart your development server** after adding environment variables
4. **For production**, set these variables in your hosting platform (Google Cloud Run, Vercel, etc.)

## Security Notes

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Keep your secret keys secure and private

## Testing Your Configuration

After setting up the environment variables, test your configuration by:

1. Starting the development server: `npm run dev`
2. Checking the console for any configuration errors
3. Testing the sign-in/sign-up flow
4. Verifying AI agent functionality
5. Testing file upload in the briefcase

## Troubleshooting

If you encounter issues:

1. **Check environment variable names** - they must match exactly
2. **Verify API keys are valid** - test them in their respective dashboards
3. **Restart the development server** after making changes
4. **Check browser console** for any error messages
5. **Verify database connection** - ensure DATABASE_URL is correct
