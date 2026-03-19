
import { logInfo, logWarn, logError } from "@/lib/logger"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, getDb } from "@/db/index"
import { users, accounts, sessions, verificationTokens } from "@/shared/db/schema"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Use getDb() wrapper to prevent "Unsupported database type" errors during build time
  adapter: (() => {
    try {
      const adapter = DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
      return adapter as any
    } catch (e) {
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE?.includes('build')) {
        logError("CRITICAL: Database adapter initialization failed in production!", e);
      } else {
        logWarn("Database adapter initialization failed. This is expected during build time if DB is not accessible.");
      }
      // Return undefined during build if DB is not accessible
      return undefined
    }
  })(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        logInfo("[Auth] Authorize attempt for email:", credentials?.email);
        try {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(8) })
            .safeParse(credentials)

          if (!parsedCredentials.success) {
            logWarn("[Auth] Credential validation failed:", parsedCredentials.error.format());
            return null;
          }

          const { email, password } = parsedCredentials.data
          logInfo("[Auth] Querying user from database...");
          
          const userResult = await db.select().from(users).where(eq(users.email, email))
          const user = userResult[0]
          
          if (!user) {
            logInfo("[Auth] User not found:", email);
            return null
          }
          
          logInfo("[Auth] User found, comparing passwords...");
          const passwordHash = typeof user.password === 'string' ? user.password : ''
          const passwordsMatch = await bcrypt.compare(password, passwordHash)
          
          if (passwordsMatch) {
            logInfo("[Auth] Authentication successful for:", email);
            // Return user object without password for security
            // Return user object without password for security
            const { password: _, ...userWithoutPassword } = user;
            return {
              ...userWithoutPassword,
              role: userWithoutPassword.role ?? 'user',
              image: userWithoutPassword.image ?? undefined,
              // Add other nullable fields if necessary for strict type compliance
            };
          }

          logInfo("[Auth] Password mismatch for:", email);
        } catch (error) {
          logError("[Auth] CRITICAL ERROR in authorize callback:", error);
          // Return null instead of letting it bubble up to potentially cause a 500
          return null;
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
})
