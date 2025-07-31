
import { getAllTemplates } from '@/lib/supabase-client';
import { TemplateCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';

export default async function TemplatesPage() {
  const categories = await getAllTemplates();

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id}>
          <div className="flex items-center space-x-2 mb-4">
            <Icon name={category.icon as any} className="w-6 h-6" />
            <h2 className="text-2xl font-bold">{category.category}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{category.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.templates.map((template) => (
              <Link href={`/templates/${template.slug}`} key={template.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
