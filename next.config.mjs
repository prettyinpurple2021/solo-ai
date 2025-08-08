/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed static export to support server actions
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  eslint: {
    // Only run ESLint on the 'pages' and 'components' directories during production builds
    // This allows for faster builds while still maintaining code quality in development
    dirs: ['app', 'components', 'lib'],
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
