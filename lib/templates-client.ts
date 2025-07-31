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

    const supabase = createClient();
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

    if (error) {
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

    const supabase = createClient();
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found'
      console.error('Error fetching template by slug from database:', error);
      // Fallback to JSON data
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