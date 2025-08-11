import { useState } from 'react';
import { useToast } from './use-toast';
import type { SavedTemplate } from '@/lib/types'

interface TemplateData {
  [key: string]: unknown;
}

export type { SavedTemplate }

export function useTemplateSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveTemplate = async (
    templateSlug: string,
    templateData: TemplateData,
    title?: string,
    description?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug,
          templateData,
          title,
          description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save template');
      }

      await response.json();
      
      toast({
        title: "Template Saved!",
        description: "Your template data has been saved to your briefcase.",
      });

      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedTemplates = async (): Promise<SavedTemplate[]> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/templates');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load templates');
      }

      const result = await response.json();
      return result.templates || [];
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "Failed to load saved templates",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveTemplate,
    loadSavedTemplates,
    isSaving,
    isLoading,
  };
} 