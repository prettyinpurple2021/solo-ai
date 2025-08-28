"use client"

import { useUser, useStackApp } from "@stackframe/stack"

export function useSafeUser() {
  try {
    return useUser()
  } catch (error) {
    console.warn('Stack Auth not available:', error)
    return null
  }
}

export function useSafeStackApp() {
  try {
    return useStackApp()
  } catch (error) {
    console.warn('Stack Auth not available:', error)
    return null
  }
}