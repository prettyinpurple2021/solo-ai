import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: string | null
      subscription_tier: string | null
      /** The user's postal address. */
      address?: string
      full_name?: string | null
      avatar_url?: string | null
      stripe_customer_id?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string | null
    subscription_tier?: string | null
    full_name?: string | null
    avatar_url?: string | null
    stripe_customer_id?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string | null
    subscription_tier?: string | null
    full_name?: string | null
  }
}
