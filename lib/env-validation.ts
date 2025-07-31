import { z } from "zod"

const envSchema = z.object({
  // Database - Fixed naming to match actual usage
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),

  // AI Services
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "Google Gemini API key is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, "Stripe publishable key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),

  // Stripe Products
  STRIPE_LAUNCHPAD_PRODUCT_ID: z.string().min(1, "Launchpad product ID is required"),
  STRIPE_ACCELERATOR_PRODUCT_ID: z.string().min(1, "Accelerator product ID is required"),
  STRIPE_DOMINATOR_PRODUCT_ID: z.string().min(1, "Dominator product ID is required"),

  // Stripe Prices
  STRIPE_LAUNCHPAD_PRICE_ID_MONTHLY: z.string().min(1, "Launchpad monthly price ID is required"),
  STRIPE_ACCELERATOR_PRICE_ID_MONTHLY: z.string().min(1, "Accelerator monthly price ID is required"),
  STRIPE_ACCELERATOR_PRICE_ID_YEARLY: z.string().min(1, "Accelerator yearly price ID is required"),
  STRIPE_DOMINATOR_PRICE_ID_MONTHLY: z.string().min(1, "Dominator monthly price ID is required"),
  STRIPE_DOMINATOR_PRICE_ID_YEARLY: z.string().min(1, "Dominator yearly price ID is required"),

  // Email
  RESEND_API_KEY: z.string().min(1, "Resend API key is required"),
  FROM_EMAIL: z.string().email("Invalid from email address"),

  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "Blob storage token is required"),

  // App Configuration
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL"),
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL"),
})

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    console.log("✅ Environment variables validated successfully")
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

// Validate environment variables at startup
if (process.env.NODE_ENV !== "test") {
  validateEnv()
}
