import { createClient } from './neon/client';
import { Template, TemplateCategory } from './templates-types';
import templateData from '../data/templates.json';

export async function getAllTemplates(): Promise<TemplateCategory[]> {
  try {
    // Only try to connect to database if environment variables are available
    if (!process.env.DATABASE_URL) {
      console.log('Neon database environment variables not available, using fallback data');
      return templateData as TemplateCategory[];
    }

    const client = await createClient();
    const { rows, error } = await client.query(`
      SELECT 
        tc.id,
        tc.category,
        tc.icon,
        tc.description,
        json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'slug', t.slug,
            'is_interactive', t.is_interactive,
            'required_role', t.required_role,
            'category_id', t.category_id
          )
        ) as templates
      FROM template_categories tc
      LEFT JOIN templates t ON tc.id = t.category_id
      GROUP BY tc.id, tc.category, tc.icon, tc.description
    `);

    // Handle database errors
    if (error) {
      console.error('Error fetching templates from database:', error);
      // Fallback to JSON data
      return templateData as TemplateCategory[];
    }

    // Map database fields to match TypeScript interface
    const mappedData = rows?.map((category: any) => ({
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
    if (!process.env.DATABASE_URL) {
      console.log('Neon database environment variables not available, using fallback data');
      return findTemplateInJson(slug);
    }

    const client = await createClient();
    const { rows, error } = await client.query(
      'SELECT * FROM templates WHERE slug = $1',
      [slug]
    );

    // Handle database errors
    if (error) {
      console.error('Error fetching template by slug from database:', error);
      // Fallback to JSON data for any other errors
      return findTemplateInJson(slug);
    }

    return rows?.[0] as Template | null;
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