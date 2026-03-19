import type { NextAuthConfig } from "next-auth"
import { logInfo, logAuth } from "@/lib/logger"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" },
  callbacks: {
    async authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin')
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
      
      // Always allow access to auth pages
      if (isAuthPage) {
        return true
      }
      
      // Protect dashboard/admin routes
      if (isOnDashboard) {
        logAuth('authorization check', auth?.user?.id as string | undefined, isLoggedIn, { 
          path: nextUrl.pathname 
        });
        
        if (isLoggedIn) {
          return true
        }
        
        // auth.user is null - NextAuth middleware validated and found no valid session
        // We must deny access to maintain security
        // If this happens after login, it indicates the session isn't being created/validated properly
        logInfo('Redirecting unauthenticated user to login', { 
          source: 'auth.config.authorized',
          path: nextUrl.pathname 
        });
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
        if (user) {
            token.id = user.id
            token.email = user.email || token.email
            token.name = user.full_name || user.name || token.name
            token.role = user.role
            token.subscription_tier = user.subscription_tier
            
            // Generate token for backend API authentication
            const { generateBackendToken } = await import('@/lib/jwt-utils')
            token.backendToken = await generateBackendToken(user.id as string, (user.email as string) || '')

        }
        if (trigger === "update" && session) {
            token = { ...token, ...session }
        }
        return token
    },
    async session({ session, token }) {
        if (token) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = (token.email as string) || session.user.email
                session.user.name = (token.name as string) || session.user.name
                
                session.user.role = (token.role as string) || 'user'
                session.user.subscription_tier = (token.subscription_tier as string) || 'free'
                
                // Expose backend token to the client
                session.backendToken = (token.backendToken as string) || undefined
            }
        }
        return session
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
