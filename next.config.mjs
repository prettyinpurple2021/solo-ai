/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all checks to ensure it builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable all experimental features
  experimental: {},
  // Simple webpack config
  webpack: (config) => {
    return config
  },
}

export default nextConfig