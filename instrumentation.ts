import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('./sentry.server.config.js')
    init()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('./sentry.edge.config.js')
    init()
  }
}

// Add the required hook for Sentry to capture server errors
export const onRequestError = Sentry.captureRequestError;
