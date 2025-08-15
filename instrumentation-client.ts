// Import Sentry from the client config
import * as Sentry from '@sentry/nextjs';

export function register() {
  // Import and initialize Sentry client config
  const { init } = require('./sentry.client.config.js')
  init()
}

// Add the required hooks for Sentry to instrument navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export const onRequestError = Sentry.captureRequestError;
