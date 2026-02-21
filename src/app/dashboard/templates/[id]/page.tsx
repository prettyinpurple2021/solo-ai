
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { logError } from "@/lib/logger"
import { getTemplateComponent } from "@/components/templates/template-registry"

import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

// Helper to deduce slug from template data if missing
const inferSlug = (template: any) => {
  if (template.template_slug) return template.template_slug
  // Try to find matching template by title in registry
  const slugFromTitle = template.title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return slugFromTitle
}

export default function TemplateEditorPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const {} = useAuth()
  
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/templates/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load template')
        }

        const data = await response.json()
        setTemplate(data)
      } catch (err) {
        logError('Failed to fetch template:', err)
        setError('Failed to load template. It may have been deleted or you do not have permission.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTemplate()
    }
  }, [id])

  const handleSave = async (data: any) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: JSON.stringify(data), // Component returns object, we stringify for DB
          updated_at: new Date()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      toast.success("Changes saved successfully")
    } catch (err) {
      logError('Failed to save template:', err)
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-dark-bg p-4 text-center">
        <h2 className="text-xl font-bold text-neon-magenta mb-4">Error</h2>
        <p className="text-gray-400 mb-6">{error || 'Template not found'}</p>
        <Link href="/dashboard/templates">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
      </div>
    )
  }

  // Determine which component to render
  const slug = inferSlug(template)
  const Component = getTemplateComponent(slug)

  if (!Component) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-dark-bg p-4 text-center">
        <h2 className="text-xl font-bold text-neon-orange mb-4">Component Not Found</h2>
        <p className="text-gray-400 mb-6">
          Could not find the interactive editor for type: <span className="font-mono text-neon-cyan">{slug}</span>
        </p>
        <pre className="text-xs text-left bg-black/50 p-4 rounded mb-6 overflow-auto max-w-lg">
          {JSON.stringify({ title: template.title, slug }, null, 2)}
        </pre>
        <Link href="/dashboard/templates">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
      </div>
    )
  }

  // Parse content if it's string
  const initialData = typeof template.content === 'string' 
    ? JSON.parse(template.content) 
    : template.content

  return (
    <div className="bg-dark-bg min-h-screen">
      <Component 
        initialData={initialData}
        onSave={handleSave}
        template={{
          title: template.title,
          description: template.description,
          slug: slug,
          category: template.category,
          requiredRole: 'free_launchpad', // Default if missing
          isInteractive: true
        }}
      />
    </div>
  )
}
