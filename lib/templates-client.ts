import { createClient } from './supabase/client';
import { Template, TemplateCategory } from './templates-types';
import templateData from '../data/templates.json';

const supabase = createClient();

export async function getAllTemplates(): Promise<TemplateCategory[]> {
  try {
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

    return data as TemplateCategory[];
  } catch (error) {
    console.error('Database connection failed, using JSON fallback:', error);
    // Fallback to JSON data
    return templateData as TemplateCategory[];
  }
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  try {
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