'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import useSWR from 'swr'
import { useState } from 'react'
import { SavedTemplate } from '@/lib/types'
import { toast } from 'sonner'


const authFetch = async (url: string, init?: RequestInit) => {
  // Standardize on 'auth_token' per auth-client
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const headers: HeadersInit = {
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) throw new Error('Failed to fetch templates')
  return res
}

const fetcher = (url: string) => authFetch(url).then(res => res.json())

export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR<{ templates: SavedTemplate[] }>('/api/templates', fetcher)

  const deleteTemplate = async (templateId: number) => {
    try {
      const res = await authFetch(`/api/templates/${templateId}`, { method: 'DELETE' })
      
      if (!res.ok) {
        throw new Error('Failed to delete template')
      }
      
      // Optimistically update the local data
      mutate(
        prev => ({
          templates: prev?.templates.filter(t => t.id !== templateId) || []
        }),
        { revalidate: false } // Don't revalidate immediately
      )
      
      toast.success("Template deleted!", { 
        description: "Your template has been removed from your collection." 
      })
      
      return true
    } catch (err) {
      logError(
        'Template delete failed',
        err instanceof Error ? err : new Error(String(err)),
      )
      toast.error("Failed to delete template", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      
      // Revalidate to ensure data is consistent
      mutate()
      return false
    }
  }

  const exportTemplate = (template: SavedTemplate) => {
    try {
      // Create a JSON blob and trigger download
      const json = JSON.stringify(template, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      const base = template.title || template.template_slug || 'template'
      const safeName = base
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
      a.download = `${safeName}-${template.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Template exported!", { 
        description: `"${base}" downloaded as JSON.` 
      })
      
      return true
    } catch (err) {
      logError(
        'Export failed',
        err instanceof Error ? err : new Error(String(err)),
      )
      toast.error("Export failed", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      return false
    }
  }

  return {
    templates: data?.templates || [],
    isLoading,
    isError: !!error,
    error,
    deleteTemplate,
    exportTemplate,
    mutate
  }
}

export function useTemplateSave() {
  const [isSaving, setIsSaving] = useState(false)
  const { mutate } = useSWR<{ templates: SavedTemplate[] }>('/api/templates')

  const saveTemplate = async (template: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSaving(true)
    
    try {
      const res = await authFetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      if (!res.ok) {
        throw new Error('Failed to save template')
      }

      const data = await res.json()
      
      // Trigger revalidation of the templates list
      mutate()
      
      toast.success("Template saved!", { 
        description: "Your template has been added to your collection." 
      })
      
      setIsSaving(false)
      return data
    } catch (err) {
      logError(
        'Template save failed',
        err instanceof Error ? err : new Error(String(err)),
      )
      toast.error("Failed to save template", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      setIsSaving(false)
      throw err
    }
  }

  return { saveTemplate, isSaving }
}
