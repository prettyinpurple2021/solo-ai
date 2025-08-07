import { z } from "zod"

/**
 * Environment variable validation schema for the SoloBoss AI Platform
 * Validates all required configuration values for production deployment
 */
const envSchema = z.object({
  // Database - Required for core functionality
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL").optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required").optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required").optional(),

  // AI Services - Required for agent functionality
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required").optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "Google Gemini API key is required").optional(),

  // Clerk Billing - Required for subscriptions
CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk publishable key is required"),

  // Email
  RESEND_API_KEY: z.string().min(1, "Resend API key is required").optional(),
  FROM_EMAIL: z.string().email("Invalid from email address").optional(),

  // File Storage (using Supabase Storage)

  // App Configuration
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL").optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL").optional(),
})

/**
 * Validates environment variables with proper error handling
 * @returns Validated environment configuration or throws error
 */
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Environment variables validated successfully")
    }
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
      // Don't exit during build process
      if (process.env.NODE_ENV === "production") {
        throw new Error("Environment validation failed")
      }
    }
    throw error
  }
}

/**
 * Check if required environment variables are available for runtime
 * @param keys Array of required environment variable keys
 * @returns Boolean indicating if all keys are present
 */
export function checkRequiredEnvVars(keys: string[]): boolean {
  return keys.every(key => process.env[key] && process.env[key]!.length > 0)
}

// Validate environment variables at startup only in development
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  validateEnv()
}
