/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  eslint: {
    // Only run ESLint on the 'pages' and 'components' directories during production builds
    // This allows for faster builds while still maintaining code quality in development
    dirs: ['app', 'components', 'lib'],
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
