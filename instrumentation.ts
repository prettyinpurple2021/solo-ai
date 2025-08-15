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
