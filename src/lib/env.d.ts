// Environment variables type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string;
      readonly JWT_SECRET: string;
      
      // Feature Flags & Optional Services
      readonly NEXT_PUBLIC_STACK_PROJECT_ID?: string;
      readonly NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
      readonly STRIPE_SECRET_KEY?: string;
      readonly OPENAI_API_KEY?: string;
      readonly ANTHROPIC_API_KEY?: string;
      readonly GOOGLE_GENERATIVE_AI_API_KEY?: string;
      readonly RESEND_API_KEY?: string;
      readonly NEXT_PUBLIC_APP_URL: string;
      
      // Legacy / Misc
      readonly NEXT_PUBLIC_ADSENSE_CLIENT_ID?: string;
      readonly NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
      readonly NODE_ENV: 'development' | 'production' | 'test';
    }
  }
  
  // Make React namespace available globally for Next.js generated types
  namespace React {
    type ReactNode = import('react').ReactNode
  }
}

// This ensures the file is treated as a module
export {};
