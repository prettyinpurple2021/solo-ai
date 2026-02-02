'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Sparkles, Target, TrendingUp, Briefcase, Users, Focus, Brain, Filter, Lightbulb, UserCog, type LucideIcon } from 'lucide-react'
import {
  templateCategories,
  templateList,
  type TemplateCategoryRecord,
  type TemplateSummary,
} from '@/lib/template-catalog'

const categoryIconMap: Record<string, LucideIcon> = {
  Target,
  TrendingUp,
  Briefcase,
  Sparkles,
  Users,
  Focus,
  Brain,
  Filter,
  Lightbulb,
  UserCog,
}

export default function TemplatesPage() {
  const categories: TemplateCategoryRecord[] = templateCategories
  const featuredTemplates: TemplateSummary[] = templateList.slice(0, 6)

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-purple/30 bg-cyber-purple/5 rounded-none mb-6">
              <Sparkles className="w-4 h-4 text-cyber-purple" />
              <span className="text-xs font-bold tracking-widest text-cyber-purple uppercase">Template Library</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              NEURAL <span className="text-cyber-purple">TEMPLATES</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Pre-configured workflows and templates to accelerate your business operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => {
              const Icon = categoryIconMap[category.icon] || Sparkles
              return (
                <HudBorder key={category.id} variant="hover" className="p-6 cursor-pointer">
                  <Icon className="w-8 h-8 text-cyber-purple mb-4" />
                  <h3 className="font-orbitron text-lg text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{category.description}</p>
                </HudBorder>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <Link key={template.id} href={`/templates/${template.slug}`}>
                <HudBorder variant="hover" className="p-6 h-full cursor-pointer">
                  <h3 className="font-orbitron text-lg text-white mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-4 leading-relaxed">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <span className="text-neon-cyan">{template.category}</span>
                    <span>•</span>
                    <span>{template.difficulty}</span>
                  </div>
                </HudBorder>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
