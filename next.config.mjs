import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),

  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: 'tsconfig.json',
  },

  distDir: ".next",

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-dropdown-menu",
      "framer-motion",
      "recharts",
    ],
    webpackBuildWorker: true,
  },

  compress: true,

  serverExternalPackages: [
    "bcryptjs",
    "jsonwebtoken",
    "pg",
    "pdf-parse",
    "mammoth",
    "sharp",
  ],

  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel.com' },
      { protocol: 'https', hostname: 'www.googletagmanager.com' },
      { protocol: 'https', hostname: 'www.google-analytics.com' },
      { protocol: 'https', hostname: 'app.bytesroute.com' },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, 'src'),
    };

    if (isServer) {
      config.optimization = {
        ...config.optimization,
        providedExports: true,
      };
    }

    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 20000,
        maxSize: 200000,
      };
      config.optimization.minimize = true;
    }

    return config;
  },

  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ],
    };
  },
};

const withPWA = (await import("@ducanh2912/next-pwa")).default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "sw.js",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  sourcemap: false,
  // Workbox default precache cap is 2 MiB; large Next.js shared chunks exceed it and spam the build log.
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  },
});

export default withPWA(nextConfig);
