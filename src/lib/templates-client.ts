import { logError, logInfo,} from '@/lib/logger'
import { getSql } from '@/lib/api-utils'
import { Template, TemplateCategory } from './templates-types'
import { templateCategories as normalizedCategories } from '@/lib/template-catalog'

const fallbackCategories: TemplateCategory[] = (() => {
  let templateId = 1

  return normalizedCategories.map((category, categoryIndex) => ({
    id: categoryIndex + 1,
    category: category.name,
    icon: category.icon,
    description: category.description,
    templates: category.templates.map((template) => ({
      id: templateId++,
      title: template.title,
      description: template.description,
      slug: template.slug,
      isInteractive: template.isInteractive,
      requiredRole: template.requiredRole,
      categoryId: categoryIndex + 1,
    })),
  }))
})()

const fallbackTemplateLookup = new Map<string, Template>()
fallbackCategories.forEach((category) => {
  category.templates.forEach((template) => {
    fallbackTemplateLookup.set(template.slug, template)
  })
})


export async function getAllTemplates(): Promise<TemplateCategory[]> {
  try {
    // Only try to connect to database if environment variables are available
    if (!process.env.DATABASE_URL) {
      logInfo('Neon database environment variables not available, using fallback data')
      return fallbackCategories
    }

    const sql = getSql()
    const rows = await sql`
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
    ` as any[];

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

    return mappedData as TemplateCategory[]
  } catch (error) {
    logError('Database connection failed, using JSON fallback:', error)
    // Fallback to JSON data
    return fallbackCategories
  }
}

export async function getTemplateBySlug(slug: string): Promise<Template> {
  try {
    // Only try to connect to database if environment variables are available
    if (!process.env.DATABASE_URL) {
      logInfo('Neon database environment variables not available, using fallback data')
      return findTemplateInFallback(slug)
    }

    const sql = getSql()
    const rows = await sql`
      SELECT * FROM templates WHERE slug = ${slug}
    ` as any[];

    return rows?.[0] as Template | null
  } catch (error) {
    logError('Database connection failed, using JSON fallback:', error)
    // Fallback to JSON data
    return findTemplateInFallback(slug)
  }
}

function findTemplateInFallback(slug: string): Template | null {
  return fallbackTemplateLookup.get(slug) ?? null
}

