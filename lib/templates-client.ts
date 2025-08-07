import { createClient } from './supabase/client';
import { Template, TemplateCategory } from './templates-types';
import templateData from '../data/templates.json';

export async function getAllTemplates(): Promise<TemplateCategory[]> {
  try {
    // Only try to connect to database if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not available, using fallback data');
      return templateData as TemplateCategory[];
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('template_categories')
      .select(`
        id,
        category,
        icon,
        description,
        templates (
          id,
          title,
          description,
          slug,
          is_interactive,
          required_role,
          category_id
        )
      `);

    // Handle specific error codes that indicate table doesn't exist
    if (error) {
      if (error.code === 'PGRST205') {
        // Table doesn't exist, fallback to JSON
        console.log('Template categories table not found, using fallback data');
        return templateData as TemplateCategory[];
      }
      console.error('Error fetching templates from database:', error);
      // Fallback to JSON data
      return templateData as TemplateCategory[];
    }

    // Map database fields to match TypeScript interface
    const mappedData = data?.map((category: any) => ({
      ...category,
      templates: category.templates?.map((template: any) => ({
        ...template,
        isInteractive: template.is_interactive,
        requiredRole: template.required_role,
        categoryId: template.category_id,
      })) || []
    }));

    return mappedData as TemplateCategory[];
  } catch (error) {
    console.error('Database connection failed, using JSON fallback:', error);
    // Fallback to JSON data
    return templateData as TemplateCategory[];
  }
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  try {
    // Only try to connect to database if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not available, using fallback data');
      return findTemplateInJson(slug);
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .single();

    // Handle specific error codes that indicate table doesn't exist or other issues
    if (error) {
      if (error.code === 'PGRST205' || error.code === 'PGRST116') {
        // Table doesn't exist or row not found, fallback to JSON
        console.log('Template table not found or template not in database, using fallback data');
        return findTemplateInJson(slug);
      }
      console.error('Error fetching template by slug from database:', error);
      // Fallback to JSON data for any other errors
      return findTemplateInJson(slug);
    }

    return data as Template | null;
  } catch (error) {
    console.error('Database connection failed, using JSON fallback:', error);
    // Fallback to JSON data
    return findTemplateInJson(slug);
  }
}

function findTemplateInJson(slug: string): Template | null {
  for (const category of templateData) {
    const template = category.templates.find(t => t.slug === slug);
    if (template) {
      return template as Template;
    }
  }
  return null;
} 