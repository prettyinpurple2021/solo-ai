
import { createClient } from '@supabase/supabase-js';
import { Template, TemplateCategory } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllTemplates(): Promise<TemplateCategory[]> {
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
        isInteractive,
        requiredRole,
        categoryId
      )
    `);

  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error(error.message);
  }

  return data as TemplateCategory[];
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found'
    console.error('Error fetching template by slug:', error);
    throw new Error(error.message);
  }

  return data as Template | null;
}
