/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to support server actions and API routes
  trailingSlash: false, // Netlify works better without trailing slashes
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // Ensure server polyfills are loaded in the Node runtime during build and SSR
  serverRuntimeConfig: {
    requireServerPolyfills: true,
  },

  eslint: {
    // Only run ESLint on specific directories during production builds
    dirs: ['app', 'components', 'lib', 'hooks'],
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds
  },

  typescript: {
    // Disable type checking during build to prevent memory issues
    ignoreBuildErrors: true,
  },

  // Enable compression for better performance
  compress: true,
  
  // Optimize for serverless functions
  poweredByHeader: false,
  
  // Environment variable configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  },

  // Ensure client bundles don't try to polyfill Node.js core modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        tls: false,
        net: false,
        child_process: false,
        dns: false,
      }
    }
    return config
  },
}

// Check next config for lint settings

export default nextConfig
