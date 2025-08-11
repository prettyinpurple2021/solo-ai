"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@/lib/neon/types"
import { verifyToken } from "@/lib/auth-utils"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (_email: string, _password: string) => Promise<{ error: unknown }>
  signUp: (_email: string, _password: string, _metadata?: Record<string, unknown>) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('auth-token')
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        // Fetch user data from database
        fetchUserData(decoded.userId, token)
      } else {
        localStorage.removeItem('auth-token')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (userId: string, token: string) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        const sessionData: Session = {
          user: userData,
          access_token: token,
          refresh_token: token,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }
        setUser(userData)
        setSession(sessionData)
      } else {
        localStorage.removeItem('auth-token')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      localStorage.removeItem('auth-token')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const { user, token } = data
        localStorage.setItem('auth-token', token)
        
        const sessionData: Session = {
          user,
          access_token: token,
          refresh_token: token,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
        }
        
        setUser(user)
        setSession(sessionData)
        return { error: null }
      } else {
        return { error: data.error }
      }
    } catch {
      return { error: 'Network error' }
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, metadata }),
      })

      const data = await response.json()

      if (response.ok) {
        const { user, token } = data
        localStorage.setItem('auth-token', token)
        
        const sessionData: Session = {
          user,
          access_token: token,
          refresh_token: token,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
        }
        
        setUser(user)
        setSession(sessionData)
        return { error: null }
      } else {
        return { error: data.error }
      }
    } catch {
      return { error: 'Network error' }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
