import { auth } from "@clerk/nextjs/server"

/**
 * Get the current user from Clerk in server-side contexts
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth()
  return userId
}

/**
 * Require authentication - throws an error if user is not authenticated
 * @returns The current user ID
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Authentication required")
  }
  
  return userId
}

/**
 * Check if the current user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const { userId } = await auth()
  return !!userId
} 