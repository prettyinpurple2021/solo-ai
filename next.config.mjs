import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'soloboss.app'],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  async redirects() {
    return [
      {
        source: '/signin',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
    ]
  },
};

// Injected content via Sentry wizard below
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);