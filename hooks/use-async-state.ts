import { useState } from "react"

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface AsyncActions<T> {
  setData: (_data: T) => void
  setLoading: (_loading: boolean) => void
  setError: (_error: string | null) => void
  reset: () => void
}

/**
 * Shared hook for managing async operation state (loading, error, data)
 * Reduces duplication across hooks that perform async operations
 */
export function useAsyncState<T>(initialData: T | null = null): AsyncState<T> & AsyncActions<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setData(initialData)
    setLoading(true)
    setError(null)
  }

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset,
  }
}

/**
 * Helper for executing async operations with automatic state management
 */
export function useAsyncOperation<T>() {
  const state = useAsyncState<T>()

  const execute = async (operation: () => Promise<T>) => {
    try {
      state.setLoading(true)
      state.setError(null)
      const result = await operation()
      state.setData(result)
      return result
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      state.setError(errorMessage)
      throw err
    } finally {
      state.setLoading(false)
    }
  }

  return {
    ...state,
    execute,
  }
}
