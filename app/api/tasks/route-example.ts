import { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  handleApiError
} from '@/lib/api-response'
import { withApiMiddleware } from '@/lib/api-middleware'
import { getDb } from '@/lib/database-client'
import { tasks } from '@/db/schema'
import { eq, and, desc, asc, count } from 'drizzle-orm'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schemas
const TaskQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'due_date', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  due_date: z.string().datetime().optional(),
  estimated_minutes: z.number().positive().optional(),
  energy_level: z.enum(['low', 'medium', 'high']).default('medium'),
  goal_id: z.number().positive().optional(),
  briefcase_id: z.number().positive().optional()
})

const UpdateTaskSchema = CreateTaskSchema.partial()

// GET /api/tasks - List tasks with filtering and pagination
export const GET = withApiMiddleware(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const queryResult = TaskQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

      if (!queryResult.success) {
        return createErrorResponse('Invalid query parameters', 400)
      }

      const {
        page,
        limit,
        status,
        priority,
        category,
        sort_by,
        sort_order
      } = queryResult.data

      // Validate pagination
      if (page < 1 || limit < 1 || limit > 100) {
        return createErrorResponse('Invalid pagination parameters', 400)
      }

      const db = getDb()
      const offset = (page - 1) * limit

      // Build where conditions
      const conditions = []

      // Note: In a real implementation, you'd get the user from authentication
      // For now, we'll use a placeholder
      const userId = 'user-id-from-auth' // This would come from authenticateRequest()
      conditions.push(eq(tasks.user_id, userId))

      if (status) {
        conditions.push(eq(tasks.status, status))
      }
      if (priority) {
        conditions.push(eq(tasks.priority, priority))
      }
      if (category) {
        conditions.push(eq(tasks.category, category))
      }

      // Build order by clause
      const sortColumns = {
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
        due_date: tasks.due_date,
        priority: tasks.priority
      }

      const sortColumn = sortColumns[sort_by as keyof typeof sortColumns] || tasks.created_at

      const orderBy = sort_order === 'asc'
        ? asc(sortColumn)
        : desc(sortColumn)

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(tasks)
        .where(and(...conditions))

      const total = totalResult[0]?.count || 0

      // Get tasks
      const taskResults = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset)

      return createPaginatedResponse(
        taskResults,
        { page, limit, total },
        'Tasks retrieved successfully'
      )

    } catch (error) {
      return handleApiError(error, 'Get tasks')
    }
  },
  {
    rateLimit: 'api',
    requireAuth: true
  }
)

// POST /api/tasks - Create a new task
export const POST = withApiMiddleware(
  async (request: NextRequest) => {
    try {
      // Get user from authentication
      const userId = 'user-id-from-auth' // This would come from authenticateRequest()

      const db = getDb()

      // Create the task
      const [newTask] = await db
        .insert(tasks)
        .values({
          user_id: userId,
          title: 'New Task',
          description: 'Task description',
          status: 'pending',
          priority: 'medium',
          energy_level: 'medium',
          tags: [],
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning()

      return createSuccessResponse(newTask, 'Task created successfully', 201)

    } catch (error) {
      return handleApiError(error, 'Create task')
    }
  },
  {
    rateLimit: 'api',
    validate: {
      body: CreateTaskSchema
    },
    requireAuth: true
  }
)


