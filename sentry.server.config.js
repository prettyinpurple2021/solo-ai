// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Ensure environment is properly set
  environment: process.env.NODE_ENV,
  
  // Only enable Sentry in production unless explicitly enabled in development
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  
  // Set serverName to help identify the instance
  serverName: process.env.VERCEL_URL || process.env.NETLIFY_URL || 'localhost',
  
  // Add custom tags for better filtering
  initialScope: {
    tags: {
      'app.version': process.env.npm_package_version || '0.1.0',
    },
  },
});
