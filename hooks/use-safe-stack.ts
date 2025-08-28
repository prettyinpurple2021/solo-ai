import { useUser as useStackUser, useStackApp } from "@stackframe/stack"

export function useSafeStackApp() {
  try {
    return useStackApp()
  } catch (error) {
    // During SSR/build, StackAuth might not be available
    return null
  }
}

export function useSafeUser() {
  try {
    return useStackUser()
  } catch (error) {
    // During SSR/build, StackAuth might not be available
    return null
  }
}