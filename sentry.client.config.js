// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay helps to understand user actions better
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ensure environment is properly set
  environment: process.env.NODE_ENV,
  
  // Only enable Sentry in production unless explicitly enabled in development
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  
  // Ignore errors that are expected or handled
  ignoreErrors: [
    // Add patterns for errors you want to ignore
    /Failed to fetch/i,
    /Network request failed/i,
    /ChunkLoadError/i,
  ],
});
