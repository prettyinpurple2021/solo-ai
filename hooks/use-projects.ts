"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"

interface Project {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  status: "active" | "archived" | "completed"
  created_at: string
  updated_at: string
}

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useProjects(): UseProjectsResult {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch("/api/projects")
      const data = await response.json()

      if (response.ok) {
        setProjects(data.projects || [])
        setLastUpdated(new Date())
      } else {
        setError(data.error || "Failed to fetch projects")
      }
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    lastUpdated,
  }
}