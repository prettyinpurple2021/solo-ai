import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function emitConfigWarning(message, error) {
  const payload = {
    level: "warn",
    message,
    error:
      error && error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error || null,
    timestamp: new Date().toISOString(),
    source: "next.config.mjs",
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix workspace root warning
  outputFileTracingRoot: process.cwd(),

  // Production builds should catch errors
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Environment variables configuration
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  // Optimized for Vercel deployment
  // output: "standalone", // Disabled for Vercel deployment
  distDir: ".next",

  // Enable modern React features and aggressive optimizations
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
    // Enable webpack build worker
    webpackBuildWorker: true,
  },

  // Compression and optimization
  compress: true,

  // External packages for server components - aggressive list to get under 25MB
  serverExternalPackages: [
    // Core auth and database (heaviest)
    "bcryptjs",
    "jsonwebtoken",
    "pg",
    "@neondatabase/serverless",
    "drizzle-orm",
    "drizzle-kit",
    // AI SDK packages (very heavy)
    "openai",
    "@ai-sdk/openai",
    "@ai-sdk/anthropic",
    "@ai-sdk/google",
    "@google/generative-ai",
    "ai",
    // File processing (heavy)
    "pdf-parse",
    "mammoth",
    "exceljs",
    "cheerio",
    "node-html-parser",
    "sharp",
    // Browser automation and testing (extremely heavy)
    "playwright",
    "puppeteer",
    "@vitest/browser",
    "@vitest/coverage-v8",
    "vitest",
    "storybook",
    // Build and bundling tools (heavy)
    "webpack-bundle-analyzer",
    "webpack",
    "eslint",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    // Payment processing
    "stripe",
    "resend",
    // Development tools
    "nodemon",
    "concurrently",
    "dotenv-cli",
    "ts-jest",
    "jest",
    "@jest/globals",
    // Large UI libraries that might have server components (removed conflicting packages)
    // Additional heavy packages for final size reduction
    "next-themes",
    "react-hook-form",
    "@hookform/resolvers",
    "zod",
    "class-variance-authority",
    "tailwind-merge",
    "clsx",
    "cmdk",
    "sonner",
    "vaul",
    "input-otp",
    "embla-carousel-react",
    "react-day-picker",
    "react-resizable-panels",
    "swr",
    "web-push",
    "robots-parser",
    "js-yaml",
    "uuid",
    "node-fetch",
    "flags",
    "glob",
    "dotenv",
    "cross-env",
    "postcss",
    "tailwindcss",
    "tailwindcss-animate",
    "autoprefixer",
    "tsx",
    "ts-node",
    "wrangler",
  ],

  // Image optimization for Vercel deployment
  images: {
    unoptimized: true,
    domains: [],
    deviceSizes: [],
    imageSizes: [],
  },

  // Bundle optimization for memory efficiency
  webpack: (config, { dev, isServer, webpack }) => {
    // Add path alias resolution for Vercel build environment
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": __dirname,
    };

    // Server-side optimizations for Vercel deployment
    if (isServer) {
      // Fix pdfjs-dist worker import issue with pdf-parse
      // Replace the problematic import with our shim module that provides a default export
      // Webpack processes query parameters separately, so we match the base module path
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^pdfjs-dist\/legacy\/build\/pdf\.worker\.mjs$/,
          path.resolve(__dirname, 'lib/pdf-worker-shim.js')
        )
      );

      // Ignore heavy packages that might be imported
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp:
            /^(sharp|canvas|puppeteer|playwright|pg-native|storybook|vitest|jest)$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@storybook\/.*$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@vitest\/.*$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@jest\/.*$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^webpack-bundle-analyzer$/,
        })
      );

      // Conservative tree shaking for server bundle to prevent browser globals
      config.optimization = {
        ...config.optimization,
        minimize: true,
        providedExports: true,
      };

      // Additional externals for server bundle
      config.externals = [
        ...config.externals,
        "playwright",
        "puppeteer",
        "storybook",
        "@storybook/core",
        "vitest",
        "jest",
        "webpack-bundle-analyzer",
        "eslint",
      ];

      // Further minimize server bundle
      // NOTE: `usedExports` can conflict with some caching strategies (cacheUnaffected) in
      // certain webpack/Next.js versions. Enable it only for non-dev server builds to avoid
      // dev-time startup conflicts (the error observed previously). This keeps production
      // tree-shaking while avoiding the dev-server error.
      try {
        if (!dev) {
          config.optimization.usedExports = true
        }
      } catch (e) {
        emitConfigWarning('Could not enable config.optimization.usedExports', e)
      }
      config.optimization.sideEffects = false;
    }

    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: "framework",
            chunks: "all",
            priority: 40,
            enforce: true,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 30,
            reuseExistingChunk: true,
          },
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: "animations",
            chunks: "all",
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      };

      // Additional bundle size optimizations for Vercel
      config.optimization.minimize = true;
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy packages with lighter alternatives where possible
        moment: false,
        lodash: false,
      };
    }
    // Removed problematic browser fallbacks that can cause 'self is not defined' errors
    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.css",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ... your existing redirects config remains untouched
    ];
  },
};

export default nextConfig;