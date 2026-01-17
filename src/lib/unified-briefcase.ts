import { getSql } from '@/lib/api-utils'
import { uploadFile, deleteFile } from '@/lib/file-storage'
import { logInfo, logWarn } from '@/lib/logger'

// Helper for direct query execution
// Helper for direct query execution
async function query(text: string, params: unknown[] = []): Promise<any[]> {
  const sql = getSql()
  // @ts-ignore - neon client call signature mismatch with dynamic params
  return await sql(text, params)
}

export interface UserBriefcase {
  id: string
  userId: string
  name: string
  description?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BriefcaseItem {
  id: string
  briefcaseId: string
  userId: string
  type: 'avatar' | 'chat' | 'brand' | 'template_save' | 'document' | 'ai_interaction'
  title: string
  description?: string
  content?: Record<string, unknown>
  blobUrl?: string
  fileSize?: number
  mimeType?: string
  tags: string[]
  metadata: Record<string, unknown>
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TemplateSave {
  id: string
  templateSlug: string
  title: string
  content: Record<string, unknown>
  progress: number // 0-100
  lastSaved: Date
}

export class UnifiedBriefcaseManager {
  private static instance: UnifiedBriefcaseManager

  static getInstance(): UnifiedBriefcaseManager {
    if (!UnifiedBriefcaseManager.instance) {
      UnifiedBriefcaseManager.instance = new UnifiedBriefcaseManager()
    }
    return UnifiedBriefcaseManager.instance
  }

  /**
   * Initialize briefcase tables
   */
  async initialize(): Promise<void> {
    // Create briefcases table
    await query(`
      CREATE TABLE IF NOT EXISTS user_briefcases (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create briefcase items table
    await query(`
      CREATE TABLE IF NOT EXISTS briefcase_items (
        id VARCHAR(255) PRIMARY KEY,
        briefcase_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('avatar', 'chat', 'brand', 'template_save', 'document', 'ai_interaction')),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB,
        blob_url TEXT,
        file_size BIGINT,
        mime_type VARCHAR(255),
        tags TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        is_private BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_user_briefcases_user_id ON user_briefcases(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_user_briefcases_default ON user_briefcases(user_id, is_default)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_briefcase_items_briefcase_id ON briefcase_items(briefcase_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_briefcase_items_user_id ON briefcase_items(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_briefcase_items_type ON briefcase_items(type)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_briefcase_items_tags ON briefcase_items USING GIN(tags)`)

    logInfo('Unified briefcase system initialized')
  }

  /**
   * Get or create default briefcase for user
   */
  async getDefaultBriefcase(userId: string): Promise<UserBriefcase> {
    // Check if user has a default briefcase
    const sql = getSql()
    // @ts-ignore - neon client typing issue
    const result = await sql(`
      SELECT * FROM user_briefcases 
      WHERE user_id = $1 AND is_default = true
      LIMIT 1
    `, [userId])

    if (result.length > 0) {
      const row = result[0]
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        isDefault: row.is_default,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }
    }

    // Create default briefcase
    const briefcaseId = `briefcase_${userId}_${Date.now()}`
    await query(`
      INSERT INTO user_briefcases (id, user_id, name, description, is_default)
      VALUES ($1, $2, $3, $4, true)
    `, [briefcaseId, userId, 'My Briefcase', 'Your personal workspace for all content'])

    return {
      id: briefcaseId,
      userId,
      name: 'My Briefcase',
      description: 'Your personal workspace for all content',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<BriefcaseItem> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Avatar must be an image file')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Avatar file size must be under 5MB')
    }

    const briefcase = await this.getDefaultBriefcase(userId)

    // Delete existing avatar
    await this.deleteItemsByType(userId, 'avatar')

    // Upload file
    const fileName = `avatar_${Date.now()}.${file.type.split('/')[1]}`
    const blob = await uploadFile(file, fileName, userId)

    // Save to briefcase
    const itemId = `avatar_${userId}_${Date.now()}`
    await query(`
      INSERT INTO briefcase_items (
        id, briefcase_id, user_id, type, title, description,
        blob_url, file_size, mime_type, metadata, is_private
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
    `, [
      itemId,
      briefcase.id,
      userId,
      'avatar',
      'Profile Avatar',
      'User profile picture',
      blob.url,
      file.size,
      file.type,
      JSON.stringify({ originalName: file.name, uploadedAt: new Date() })
    ])

    return {
      id: itemId,
      briefcaseId: briefcase.id,
      userId,
      type: 'avatar',
      title: 'Profile Avatar',
      description: 'User profile picture',
      blobUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      tags: [],
      metadata: { originalName: file.name, uploadedAt: new Date() },
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Save chat conversation
   */
  async saveChatConversation(userId: string, title: string, messages: any[], agentName?: string): Promise<BriefcaseItem> {
    const briefcase = await this.getDefaultBriefcase(userId)
    const itemId = `chat_${userId}_${Date.now()}`

    await query(`
      INSERT INTO briefcase_items (
        id, briefcase_id, user_id, type, title, content, metadata, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      itemId,
      briefcase.id,
      userId,
      'chat',
      title,
      JSON.stringify({ messages }),
      JSON.stringify({
        agentName,
        messageCount: messages.length,
        lastMessage: new Date()
      }),
      agentName ? [agentName, 'conversation'] : ['conversation']
    ])

    return {
      id: itemId,
      briefcaseId: briefcase.id,
      userId,
      type: 'chat',
      title,
      content: { messages },
      tags: agentName ? [agentName, 'conversation'] : ['conversation'],
      metadata: {
        agentName,
        messageCount: messages.length,
        lastMessage: new Date()
      },
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Save brand work
   */
  async saveBrandWork(userId: string, title: string, brandData: any): Promise<BriefcaseItem> {
    const briefcase = await this.getDefaultBriefcase(userId)
    const itemId = `brand_${userId}_${Date.now()}`

    await query(`
      INSERT INTO briefcase_items (
        id, briefcase_id, user_id, type, title, content, metadata, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      itemId,
      briefcase.id,
      userId,
      'brand',
      title,
      JSON.stringify(brandData),
      JSON.stringify({
        brandType: brandData.type || 'general',
        lastModified: new Date()
      }),
      ['branding', 'design']
    ])

    return {
      id: itemId,
      briefcaseId: briefcase.id,
      userId,
      type: 'brand',
      title,
      content: brandData,
      tags: ['branding', 'design'],
      metadata: {
        brandType: brandData.type || 'general',
        lastModified: new Date()
      },
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Save template progress
   */
  async saveTemplateProgress(userId: string, templateSlug: string, title: string, content: any, progress: number): Promise<BriefcaseItem> {
    const briefcase = await this.getDefaultBriefcase(userId)

    // Check if template save already exists
    const existing = await query(`
      SELECT id FROM briefcase_items 
      WHERE user_id = $1 AND type = 'template_save' 
      AND metadata->>'templateSlug' = $2
    `, [userId, templateSlug])

    if (existing.length > 0) {
      // Update existing save
      const itemId = existing[0].id
      await query(`
        UPDATE briefcase_items 
        SET title = $1, content = $2, 
            metadata = $3, updated_at = NOW()
        WHERE id = $4
      `, [
        title,
        JSON.stringify(content),
        JSON.stringify({
          templateSlug,
          progress,
          lastSaved: new Date()
        }),
        itemId
      ])

      return {
        id: itemId,
        briefcaseId: briefcase.id,
        userId,
        type: 'template_save',
        title,
        content,
        tags: ['template', templateSlug],
        metadata: {
          templateSlug,
          progress,
          lastSaved: new Date()
        },
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Create new save
    const itemId = `template_${userId}_${templateSlug}_${Date.now()}`
    await query(`
      INSERT INTO briefcase_items (
        id, briefcase_id, user_id, type, title, content, metadata, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      itemId,
      briefcase.id,
      userId,
      'template_save',
      title,
      JSON.stringify(content),
      JSON.stringify({
        templateSlug,
        progress,
        lastSaved: new Date()
      }),
      ['template', templateSlug]
    ])

    return {
      id: itemId,
      briefcaseId: briefcase.id,
      userId,
      type: 'template_save',
      title,
      content,
      tags: ['template', templateSlug],
      metadata: {
        templateSlug,
        progress,
        lastSaved: new Date()
      },
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Get user's briefcase items
   */
  async getBriefcaseItems(
    userId: string,
    type?: string,
    limit: number = 50,
    offset: number = 0,
    search?: string
  ): Promise<{ items: BriefcaseItem[], total: number }> {
    let whereClause = 'user_id = $1'
    const params: unknown[] = [userId]
    let paramIndex = 2

    if (type) {
      whereClause += ` AND type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (search) {
      whereClause += ` AND (
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex + 1} OR 
        $${paramIndex + 2} = ANY(tags)
      )`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, search)
      paramIndex += 3
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM briefcase_items WHERE ${whereClause}
    `, params)

    // Get items
    const itemsResult = await query(`
      SELECT * FROM briefcase_items 
      WHERE ${whereClause}
      ORDER BY updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset])

    const items = itemsResult.map(row => ({
      id: row.id,
      briefcaseId: row.briefcase_id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      description: row.description,
      content: row.content ? JSON.parse(row.content) : undefined,
      blobUrl: row.blob_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      tags: row.tags || [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      isPrivate: row.is_private,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))

    return {
      items,
      total: parseInt(countResult[0].total)
    }
  }

  /**
   * Get user's current avatar
   */
  async getUserAvatar(userId: string): Promise<BriefcaseItem | null> {
    const sql = getSql()
    // @ts-ignore - neon client typing issue
    const result = await sql(`
      SELECT * FROM briefcase_items 
      WHERE user_id = $1 AND type = 'avatar'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId])

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      briefcaseId: row.briefcase_id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      description: row.description,
      blobUrl: row.blob_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      tags: row.tags || [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      isPrivate: row.is_private,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  /**
   * Delete items by type
   */
  private async deleteItemsByType(userId: string, type: string): Promise<void> {
    // Get items to delete blob files
    const items = await query(`
      SELECT blob_url FROM briefcase_items 
      WHERE user_id = $1 AND type = $2 AND blob_url IS NOT NULL
    `, [userId, type])

    // Delete blob files
    for (const item of items) {
      if (item.blob_url) {
        try {
          await deleteFile(item.blob_url)
        } catch (error) {
          logWarn('Failed to delete blob:', error)
        }
      }
    }

    // Delete database records
    await query(`
      DELETE FROM briefcase_items 
      WHERE user_id = $1 AND type = $2
    `, [userId, type])
  }

  /**
   * Delete a specific item
   */
  async deleteItem(userId: string, itemId: string): Promise<boolean> {
    // Get item details for blob cleanup
    const sql = getSql()
    const result = await (sql as any)(`
      SELECT blob_url FROM briefcase_items 
      WHERE id = $1 AND user_id = $2
    `, [itemId, userId])

    if (result.length === 0) return false

    // Delete blob file if exists
    if (result[0].blob_url) {
      try {
        await deleteFile(result[0].blob_url)
      } catch (error) {
        logWarn('Failed to delete blob:', error)
      }
    }

    // Delete database record
    await query(`
      DELETE FROM briefcase_items 
      WHERE id = $1 AND user_id = $2
    `, [itemId, userId])

    return true
  }
}

// Export singleton instance
export const unifiedBriefcase = UnifiedBriefcaseManager.getInstance()