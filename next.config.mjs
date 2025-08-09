/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to support server actions and API routes
  trailingSlash: false, // Netlify works better without trailing slashes
  images: {
    unoptimized: true, // Required for Netlify static deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https', 
        hostname: '*.supabase.co',
      },
    ],
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  eslint: {
    // Only run ESLint on specific directories during production builds
    dirs: ['app', 'components', 'lib', 'hooks'],
    ignoreDuringBuilds: false, // Enable ESLint checking in production
  },

  // Enable compression for better performance
  compress: true,
  
  // Optimize for serverless functions
  poweredByHeader: false,
  
  // Environment variable configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
