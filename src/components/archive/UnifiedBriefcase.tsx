'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'

import {
  MessageCircle, 
  Palette, 
  FileText, 
  User, 
  Calendar,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Crown,
  Heart,
  Sparkles,
  Skull,
  Star,
  Zap
} from 'lucide-react'

interface BriefcaseItem {
  id: string
  briefcaseId: string
  userId: string
  type: 'avatar' | 'chat' | 'brand' | 'template_save' | 'document' | 'ai_interaction'
  title: string
  description?: string
  content?: Record<string, any>
  blobUrl?: string
  fileSize?: number
  mimeType?: string
  tags: string[]
  metadata: Record<string, any>
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

interface UnifiedBriefcaseProps {
  className?: string
}

const ITEM_TYPE_ICONS = {
  avatar: Crown,
  chat: MessageCircle,
  brand: Heart,
  template_save: Star,
  document: FileText,
  ai_interaction: Sparkles
}

const ITEM_TYPE_LABELS = {
  avatar: 'Avatar',
  chat: 'Chat Conversation',
  brand: 'Brand Work',
  template_save: 'Template Save',
  document: 'Document',
  ai_interaction: 'AI Interaction'
}

const ITEM_TYPE_COLORS = {
  avatar: 'bg-neon-purple/10 border-neon-purple text-neon-purple',
  chat: 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan',
  brand: 'bg-neon-magenta/10 border-neon-magenta text-neon-magenta',
  template_save: 'bg-neon-purple/10 border-neon-purple text-neon-purple',
  document: 'bg-gray-700/50 border-gray-500 text-gray-300',
  ai_interaction: 'bg-neon-lime/10 border-neon-lime text-neon-lime'
}

const UnifiedBriefcase: React.FC<UnifiedBriefcaseProps> = ({ className = '' }) => {
  const [items, setItems] = useState<BriefcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
    offset: 0,
    limit: 20
  })

  const loadItems = async (offset = 0, type?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString()
      })

      if (type && type !== 'all') {
        params.set('type', type)
      }

      const response = await fetch(`/api/unified-briefcase?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load items')
      }

      if (offset === 0) {
        setItems(result.items)
      } else {
        setItems(prev => [...prev, ...result.items])
      }

      setPagination({
        total: result.total,
        hasMore: result.hasMore,
        offset: offset,
        limit: pagination.limit
      })

    } catch (error) {
      logError('Load briefcase items error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/unified-briefcase?id=${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete item')
      }

      // Remove item from local state
      setItems(prev => prev.filter(item => item.id !== itemId))

    } catch (error) {
      logError('Delete item error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete item')
    }
  }

  const handleLoadMore = () => {
    const nextOffset = pagination.offset + pagination.limit
    loadItems(nextOffset, selectedType !== 'all' ? selectedType : undefined)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    setPagination(prev => ({ ...prev, offset: 0 }))
    loadItems(0, type !== 'all' ? type : undefined)
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${Math.round(size * 10) / 10} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    loadItems()
  }, [])

  const ItemCard: React.FC<{ item: BriefcaseItem }> = ({ item }) => {
    const IconComponent = ITEM_TYPE_ICONS[item.type]
    const colorClass = ITEM_TYPE_COLORS[item.type]

    return (
      <div className="bg-dark-card backdrop-blur-sm rounded-sm border-2 border-gray-800 p-5 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all duration-300 group font-mono">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-sm border-2 ${colorClass} group-hover:scale-105 transition-transform duration-200`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white truncate mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1 uppercase tracking-wider">
                <Sparkles size={10} className="text-neon-cyan" />
                {ITEM_TYPE_LABELS[item.type]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-2 text-gray-600 hover:text-neon-magenta hover:bg-neon-magenta/10 rounded-sm transition-all duration-200"
              title="Delete item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-medium">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-dark-bg text-neon-cyan text-xs rounded-sm font-medium border border-neon-cyan/30 hover:border-neon-cyan transition-colors duration-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1 font-medium">
            <Clock size={12} className="text-neon-cyan" />
            <span>{formatDate(item.updatedAt)}</span>
          </div>
          
          {item.fileSize && (
            <span className="flex items-center gap-1">
              <Heart size={10} className="text-neon-magenta" />
              {formatFileSize(item.fileSize)}
            </span>
          )}
        </div>
      </div>
    )
  }

  const ItemRow: React.FC<{ item: BriefcaseItem }> = ({ item }) => {
    const IconComponent = ITEM_TYPE_ICONS[item.type]
    const colorClass = ITEM_TYPE_COLORS[item.type]

    return (
      <div className="bg-dark-card backdrop-blur-sm rounded-sm border-2 border-gray-800 p-5 hover:border-neon-purple hover:shadow-[0_0_15px_rgba(180,0,255,0.3)] transition-all duration-300 group font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-sm border-2 ${colorClass} group-hover:scale-105 transition-transform duration-200`}>
              <IconComponent size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{item.title}</h3>
              <p className="text-sm text-gray-500 truncate font-medium flex items-center gap-1 uppercase tracking-wider">
                <Sparkles size={12} className="text-neon-purple" />
                {item.description || ITEM_TYPE_LABELS[item.type]}
              </p>
            </div>
            
            <div className="flex gap-2">
              {item.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-dark-bg text-neon-cyan text-xs rounded-sm font-medium border border-neon-cyan/30"
                >
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="px-3 py-1 bg-dark-bg text-gray-500 text-xs rounded-sm font-medium border border-gray-700">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-600 min-w-0 font-medium flex items-center gap-1">
              <Clock size={12} className="text-neon-cyan" />
              {formatDate(item.updatedAt)}
            </div>
            
            {item.fileSize && (
              <div className="text-sm text-gray-600 min-w-0 font-medium flex items-center gap-1">
                <Heart size={12} className="text-neon-magenta" />
                {formatFileSize(item.fileSize)}
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="ml-4 p-3 text-gray-600 hover:text-neon-magenta hover:bg-neon-magenta/10 rounded-sm transition-all duration-200"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-bg min-h-screen ${className} font-mono`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="text-neon-purple" size={32} />
            <h1 className="text-4xl font-bold text-white font-orbitron uppercase tracking-wider">
              Secure Briefcase
            </h1>
            <Sparkles className="text-neon-cyan animate-pulse" size={32} />
          </div>
          <p className="text-gray-400 text-lg font-medium flex items-center justify-center gap-2 font-mono">
            <Heart size={16} className="text-neon-magenta" />
            Classified assets, intelligence, and resources
            <Heart size={16} className="text-neon-magenta" />
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-card backdrop-blur-sm rounded-sm border-2 border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH ASSETS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-700 bg-dark-bg text-white rounded-sm focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan min-w-0 sm:min-w-[300px] placeholder-gray-600 font-mono text-sm"
                />
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-700 bg-dark-bg text-gray-300 rounded-sm focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan font-mono text-sm"
              >
                <option value="all">All Assets</option>
                <option value="chat">Chat Logs</option>
                <option value="brand">Brand Ident</option>
                <option value="template_save">Templates</option>
                <option value="avatar">Avatars</option>
                <option value="document">Documents</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-sm transition-all duration-200 border-2 ${
                  viewMode === 'grid' 
                    ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.2)]' 
                    : 'border-transparent text-gray-500 hover:text-neon-cyan hover:bg-dark-hover'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-sm transition-all duration-200 border-2 ${
                  viewMode === 'list' 
                    ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.2)]' 
                    : 'border-transparent text-gray-500 hover:text-neon-cyan hover:bg-dark-hover'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Object.entries(ITEM_TYPE_LABELS).map(([type, label]) => {
            const count = items.filter(item => item.type === type).length
            const IconComponent = ITEM_TYPE_ICONS[type as keyof typeof ITEM_TYPE_ICONS]
            
            return (
              <div key={type} className="bg-dark-card backdrop-blur-sm rounded-sm border-2 border-gray-800 p-6 hover:border-neon-purple hover:shadow-[0_0_15px_rgba(180,0,255,0.2)] transition-all duration-300 group">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-sm mb-3 ${ITEM_TYPE_COLORS[type as keyof typeof ITEM_TYPE_COLORS]} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 font-mono">{label}</p>
                  <p className="text-2xl font-bold text-white font-orbitron">{count}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Content */}
        {loading && pagination.offset === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-neon-purple border-l-neon-cyan rounded-full mb-4"></div>
            <p className="text-neon-cyan font-medium flex items-center gap-2 font-mono uppercase tracking-widest">
              <Sparkles size={16} className="animate-pulse" />
              DECRYPTING ASSETS...
              <Sparkles size={16} className="animate-pulse" />
            </p>
          </div>
        ) : error ? (
          <div className="bg-dark-card border-2 border-red-500/50 rounded-sm p-6">
            <div className="text-center">
              <Skull size={32} className="text-red-500 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-4 font-mono">{error}</p>
              <button
                onClick={() => loadItems()}
                className="px-6 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-500 text-red-200 rounded-sm font-medium transition-all duration-200 hover:scale-105 shadow-[0_0_15px_rgba(255,0,0,0.3)] uppercase font-mono tracking-wider"
              >
                RETRY CONNECTION
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Crown size={64} className="mx-auto text-gray-800 mb-4" />
              <Sparkles size={32} className="mx-auto text-neon-cyan opacity-20 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-500 mb-3 font-orbitron uppercase">NO ASSETS FOUND</h3>
            <p className="text-gray-600 font-medium flex items-center justify-center gap-2 font-mono">
              {searchTerm || selectedType !== 'all' 
                ? 'ADJUST SEARCH PARAMETERS OR FILTERS'
                : 'INITIATE CONTENT CREATION'
              }
            </p>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredItems.map(item => (
                viewMode === 'grid' ? (
                  <ItemCard key={item.id} item={item} />
                ) : (
                  <ItemRow key={item.id} item={item} />
                )
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan rounded-sm font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(11,228,236,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto group font-mono uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-neon-cyan border-b-transparent"></div>
                      DECRYPTING...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="group-hover:animate-pulse" />
                      LOAD ADDITIONAL ASSETS
                      <Crown size={16} className="opacity-70" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UnifiedBriefcase
