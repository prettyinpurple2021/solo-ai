'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  app_name: ['Soloboss AI'],
  license_key: '0d2eed4d03e7a3b392d1ac32fac9fc52FFFFNRAL',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  ai_monitoring: {
    enabled: true
  },
  custom_insights_events: {
    max_samples_stored: 100000 // 100k
  },
  span_events: {
    max_samples_stored: 10000 // 10k
  }
}
