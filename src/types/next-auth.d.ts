import { type DefaultSession } from "next-auth"
import { type AdapterUser as BaseAdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: string
      subscription_tier: string
      full_name?: string | null
      avatar_url?: string | null
      stripe_customer_id?: string | null
    } & DefaultSession["user"]
    backendToken?: string
  }

  interface User {
    role?: string | null
    subscription_tier?: string | null
    full_name?: string | null
    avatar_url?: string | null
    stripe_customer_id?: string | null
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends BaseAdapterUser {
    role?: string | null
    subscription_tier?: string | null
    full_name?: string | null
    avatar_url?: string | null
    stripe_customer_id?: string | null
  }
}
