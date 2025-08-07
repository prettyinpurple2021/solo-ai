import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // During build time or when env vars are missing, return a mock client
    if (typeof window === 'undefined') {
      // Server-side: throw error only in production builds
      if (process.env.NODE_ENV === 'production') {
        console.warn('Supabase environment variables missing during build - features requiring Supabase will be disabled')
        return null as any
      }
    }
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  return createBrowserClient(url, key)
}

// Default export for backward compatibility
export default createClient
