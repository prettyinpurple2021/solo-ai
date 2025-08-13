'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTemplateSave, SavedTemplate } from '@/hooks/use-template-save';
import { FileText, Calendar, Download, Trash2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Uses SavedTemplate from hook to avoid duplicate/conflicting types

export function SavedTemplatesList() {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const { loadSavedTemplates, isLoading } = useTemplateSave();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const templates = await loadSavedTemplates();
    setSavedTemplates(templates);
  };

  const getTemplateIcon = (slug: string) => {
    switch (slug) {
      case 'decision-dashboard':
        return '🎯';
      case 'delegation-list-builder':
        return '📋';
      case 'i-hate-this-tracker':
        return '⚠️';
      case 'quarterly-biz-review':
        return '📊';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewTemplate = (template: SavedTemplate) => {
    setSelectedTemplate(template);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete template')
      }
      setSavedTemplates((prev) => prev.filter((t) => t.id !== templateId))
      toast.success('Template deleted', { description: 'She gone. Clean, safe, and instant.' })
    } catch (err) {
      console.error(err)
      toast.error('Delete failed', { description: 'Could not delete this template. Try again.' })
    }
  };

  const handleExportTemplate = (template: SavedTemplate) => {
    try {
      const json = JSON.stringify(template.template_data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeSlug = template.template_slug || 'template'
      a.href = url
      a.download = `${safeSlug}-${template.id}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Template exported', { description: `${template.title} downloaded.` })
    } catch (err) {
      console.error('Export failed', err)
      toast.error('Export failed', { description: 'Could not export this template.' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Saved Templates</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (savedTemplates.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Saved Templates</h3>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No saved templates yet</h4>
            <p className="text-muted-foreground mb-4">
              Save your work from the templates to see them here.
            </p>
            <Button asChild>
              <a href="/templates">Go to Templates</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold boss-text-gradient">Saved Templates</h3>
        <Badge variant="default">{savedTemplates.length} templates</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savedTemplates.map((template) => (
          <Card key={template.id} className="boss-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTemplateIcon(template.template_slug)}</span>
                  <div>
                    <CardTitle className="text-base gradient-text-secondary">{template.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(template.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {template.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="boss-text-gradient">{template.title}</DialogTitle>
                      <DialogDescription>
                        Template data from {formatDate(template.created_at)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(template.template_data, null, 2)}
                      </pre>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`template-export-${template.id}`}
                  onClick={() => handleExportTemplate(template)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid={`template-delete-${template.id}`}
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 