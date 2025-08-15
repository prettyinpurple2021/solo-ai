export function register() {
  // Import and initialize Sentry client config
  const { init } = require('./sentry.client.config.js')
  init()
}
