'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'

import { Input } from '@/components/ui/input'
import { BookOpen, Calendar, Search } from 'lucide-react'

const blogPosts = [
  {
    id: 'ai-business-automation',
    title: 'How to Automate Your Revenue Workflows with AI',
    excerpt: 'Discover the advantages of AI-powered business automation and revenue-generating workflows.',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Automation',
  },
  {
    id: 'scaling-solo-business',
    title: 'Scaling Your Solo Business: A Complete Guide',
    excerpt: 'Learn strategies to scale your one-person business using AI and automation tools.',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Growth',
  },
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter((post) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    )
  })

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-purple/30 bg-neon-purple/5 rounded-none mb-6">
              <BookOpen className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              BOSS <span className="text-neon-purple">BLOG</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Strategic intelligence and insights for building your empire.
            </p>
          </div>

          <HudBorder className="p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-10 bg-dark-card/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
              />
            </div>
          </HudBorder>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <HudBorder variant="hover" className="p-6 h-full cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-orbitron text-neon-purple uppercase tracking-widest">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">•</span>
                    <span className="text-xs text-gray-500 font-mono">{post.readTime}</span>
                  </div>
                  <h3 className="font-orbitron text-xl text-white mb-3">{post.title}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
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
