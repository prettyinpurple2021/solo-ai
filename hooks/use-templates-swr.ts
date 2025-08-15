'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { SavedTemplate } from '@/lib/types'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch templates')
  return res.json()
})

export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR<{ templates: SavedTemplate[] }>('/api/templates', fetcher)

  const deleteTemplate = async (templateId: number) => {
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
      
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
      console.error(err)
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
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${template.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Template exported!", { 
        description: `"${template.name}" downloaded as JSON.` 
      })
      
      return true
    } catch (err) {
      console.error('Export failed', err)
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
      const res = await fetch('/api/templates', {
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
      console.error(err)
      toast.error("Failed to save template", { 
        description: err instanceof Error ? err.message : "An unknown error occurred." 
      })
      setIsSaving(false)
      throw err
    }
  }

  return { saveTemplate, isSaving }
}
