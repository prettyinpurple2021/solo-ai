"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { templateComponents } from './index'
import { getTemplateBySlug, getCategoryBySlug, type TemplateSummary } from '@/lib/template-catalog'

export function TemplateRenderer({ slug }: { slug: string }) {
  const Component = templateComponents[slug]

  const summary: TemplateSummary | undefined = getTemplateBySlug(slug) ?? undefined
  const category = summary ? getCategoryBySlug(summary.categoryId) : undefined
  const template = summary
    ? {
        title: summary.title,
        description: summary.description,
        category: category?.name ?? summary.categoryName,
        slug: summary.slug,
        isInteractive: summary.isInteractive,
        requiredRole: summary.requiredRole,
      }
    : null

  if (!Component) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            This template does not have an interactive component yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-6">
      {template ? <Component template={template} /> : <Component />}
    </div>
  )
}

