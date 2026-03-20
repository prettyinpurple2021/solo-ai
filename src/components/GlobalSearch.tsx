'use client'

import { logError } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Search, Crown, Heart, Sparkles, MessageCircle, Palette, FileText, Star, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface SearchResult {
  id: string
  type: 'chat' | 'brand' | 'template_save' | 'avatar' | 'document' | 'ai_interaction'
  title: string
  description?: string
  url: string
  metadata?: Record<string, unknown>
}

const SEARCH_PLACEHOLDERS = [
  "Search your empire, Founder... ✨",
  "Find your content... 👑",
  "What are you looking for? 💎",
  "Search like the visionary you are... 💅",
]

const TYPE_ICONS = {
  chat: MessageCircle,
  brand: Palette,
  template_save: Star,
  avatar: Crown,
  document: FileText,
  ai_interaction: Sparkles,
}

const TYPE_COLORS = {
  chat: 'text-neon-cyan',
  brand: 'text-neon-magenta',
  template_save: 'text-neon-purple',
  avatar: 'text-neon-purple',
  document: 'text-gray-400',
  ai_interaction: 'text-neon-cyan',
}

function getItemUrl(item: { type: string; id: string; metadata?: Record<string, unknown> }): string {
  switch (item.type) {
    case 'chat':
      return `/dashboard/agents?chat=${item.id}`
    case 'brand':
      return `/dashboard/brand?item=${item.id}`
    case 'template_save':
      return `/templates/${(item.metadata?.templateSlug as string) || 'unknown'}?save=${item.id}`
    case 'avatar':
      return `/dashboard/settings#avatar`
    case 'document':
      return `/dashboard/briefcase?item=${item.id}`
    default:
      return `/dashboard/briefcase?item=${item.id}`
  }
}

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState('')
  const [placeholder, setPlaceholder] = useState(SEARCH_PLACEHOLDERS[0])
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const currentIndex = SEARCH_PLACEHOLDERS.indexOf(prev)
        const nextIndex = (currentIndex + 1) % SEARCH_PLACEHOLDERS.length
        return SEARCH_PLACEHOLDERS[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/unified-briefcase?search=${encodeURIComponent(searchQuery)}&limit=10`,
      )

      if (response.ok) {
        const data = (await response.json()) as {
          items?: Array<{
            id: string
            type: SearchResult['type']
            title: string
            description?: string
            metadata?: Record<string, unknown>
          }>
        }
        const searchResults: SearchResult[] =
          data.items?.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            url: getItemUrl(item),
            metadata: item.metadata,
          })) || []

        setResults(searchResults)
      }
    } catch (error) {
      logError(
        'Search error:',
        error instanceof Error ? error : new Error(String(error)),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => void performSearch(query), 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full max-w-sm px-4 py-2.5 bg-dark-card border-2 border-neon-purple/50 rounded-sm hover:border-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-300 group"
      >
        <Search className="text-neon-purple group-hover:text-neon-magenta transition-colors" size={16} />
        <span className="text-gray-400 text-sm font-mono font-medium flex-1 text-left uppercase tracking-wider">
          {placeholder}
        </span>
        <div className="flex items-center gap-1 px-2 py-1 bg-dark-bg border border-gray-700 rounded-sm text-xs font-bold text-neon-purple font-mono">
          <span>⌘</span>
          <span>K</span>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-dark-bg border-2 border-neon-purple/30">
          <div className="flex items-center gap-3 p-4 border-b-2 border-gray-800 bg-dark-card/50">
            <Crown className="text-neon-purple" size={20} />
            <h2 className="font-bold text-white flex items-center gap-2 font-orbitron uppercase tracking-wider">
              Empire Search
              <Sparkles size={16} className="text-neon-cyan" />
            </h2>
          </div>

          <Command className="rounded-sm border-0 shadow-none bg-transparent font-mono">
            <CommandInput
              placeholder="Search your briefcase, conversations, brand work..."
              value={query}
              onValueChange={setQuery}
              className="border-0 focus:ring-0 text-white placeholder-gray-600 font-mono"
            />

            <CommandList className="max-h-96 p-4 custom-scrollbar bg-dark-bg">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-neon-purple border-l-neon-magenta" />
                  <span className="ml-3 text-neon-purple font-medium font-mono">SCANNING EMPIRE...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-8 text-center bg-dark-bg">
                    <div className="flex flex-col items-center gap-3">
                      <Crown size={32} className="text-gray-700" />
                      <div>
                        <p className="font-bold text-gray-400 mb-1 font-mono uppercase">No results found</p>
                        <p className="text-sm text-gray-600 font-mono">
                          Try searching for chats, brand work, or templates
                        </p>
                      </div>
                    </div>
                  </CommandEmpty>

                  {results.length > 0 && (
                    <CommandGroup
                      heading={
                        <div className="flex items-center gap-2 text-neon-purple font-bold font-mono text-xs uppercase tracking-widest">
                          <Heart size={14} className="text-neon-magenta" />
                          Your Content
                        </div>
                      }
                    >
                      {results.map((result) => {
                        const IconComponent = TYPE_ICONS[result.type]
                        const colorClass = TYPE_COLORS[result.type]

                        return (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleSelect(result.url)}
                            className="flex items-center gap-3 p-3 rounded-sm hover:bg-dark-card/80 cursor-pointer transition-all duration-200 hover:border-l-2 hover:border-neon-purple border-l-2 border-transparent group"
                          >
                            <div className="p-2 rounded-sm bg-dark-card border border-gray-800 group-hover:border-neon-purple/50 transition-colors">
                              <IconComponent size={16} className={colorClass} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate font-mono">{result.title}</p>
                              {result.description && (
                                <p className="text-xs text-gray-500 truncate font-mono">{result.description}</p>
                              )}
                            </div>
                            <Sparkles
                              size={12}
                              className="text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  )}

                  {query.length === 0 && (
                    <CommandGroup
                      heading={
                        <div className="flex items-center gap-2 text-neon-cyan font-bold font-mono text-xs uppercase tracking-widest">
                          <Zap size={14} className="text-neon-lime" />
                          Quick Actions
                        </div>
                      }
                    >
                      <CommandItem
                        onSelect={() => handleSelect('/dashboard/agents')}
                        className="rounded-sm hover:bg-dark-card"
                      >
                        <MessageCircle className="mr-3 h-4 w-4 text-neon-cyan" />
                        <span className="font-medium text-gray-300 font-mono">Chat with AI Agents</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect('/dashboard/brand')}
                        className="rounded-sm hover:bg-dark-card"
                      >
                        <Palette className="mr-3 h-4 w-4 text-neon-magenta" />
                        <span className="font-medium text-gray-300 font-mono">Brand Studio</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect('/templates')}
                        className="rounded-sm hover:bg-dark-card"
                      >
                        <Star className="mr-3 h-4 w-4 text-neon-purple" />
                        <span className="font-medium text-gray-300 font-mono">Browse Templates</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect('/dashboard/briefcase')}
                        className="rounded-sm hover:bg-dark-card"
                      >
                        <FileText className="mr-3 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300 font-mono">Your Briefcase</span>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      </CommandDialog>
    </>
  )
}

export default GlobalSearch
