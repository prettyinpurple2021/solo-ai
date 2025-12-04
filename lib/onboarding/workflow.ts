import { getSql } from '@/lib/api-utils'
import { logError, logInfo, logWarn } from '@/lib/logger'
import { sendWelcomeEmail } from '@/lib/email'

interface WorkflowResult {
  jobId: string
  userId: string
  briefcaseId: number
  goalsCreated: number
  tasksCreated: number
  emailSent: boolean
}

const DEFAULT_BRIEFCASE = {
  title: 'Empire Launch Command Center',
  description:
    'Centralize the most important launch tasks for your SoloSuccess AI journey. Everything you need to build your empire lives here.',
  status: 'active',
  metadata: {
    category: 'onboarding',
    createdBy: 'onboarding_workflow',
  },
}

const DEFAULT_GOALS = [
  {
    title: 'Define your empire vision',
    description: 'Clarify your business focus, revenue targets, and the transformation you want to create.',
    priority: 'high',
    category: 'strategy',
  },
  {
    title: 'Activate your AI squad',
    description: 'Introduce yourself to your agents and assign the first mission for each squad member.',
    priority: 'medium',
    category: 'automation',
  },
  {
    title: 'Launch your first revenue engine',
    description: 'Select one growth initiative and move it from idea to implementation in SoloSuccess.',
    priority: 'high',
    category: 'growth',
  },
]

const DEFAULT_TASKS = [
  {
    title: 'Complete SoloSuccess onboarding wizard',
    description: 'Visit the dashboard onboarding wizard to personalize your experience.',
    estimated_minutes: 15,
    priority: 'high',
  },
  {
    title: 'Schedule the Empire Planning Session',
    description: 'Block 60 minutes on your calendar to focus on defining your growth roadmap.',
    estimated_minutes: 10,
    priority: 'medium',
  },
  {
    title: 'Connect your primary revenue channel',
    description: 'Link the system where most revenue comes from: email, social, funnel dashboard, or CRM.',
    estimated_minutes: 20,
    priority: 'high',
  },
  {
    title: 'Configure Burnout Shield metrics',
    description: 'Set your weekly focus minutes and wellness habits to keep your energy on fire.',
    estimated_minutes: 10,
    priority: 'medium',
  },
]

export async function runOnboardingWorkflow(jobId: string, userId: string): Promise<WorkflowResult> {
  const sql = getSql()

  const userRows = await sql`
    SELECT id, email, full_name
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  ` as Array<{
    id: string
    email: string | null
    full_name: string | null
  }>

  const userRecord = userRows[0]
  if (!userRecord) {
    throw new Error(`User ${userId} not found for onboarding workflow`)
  }

  const briefcaseRows = await sql`
    SELECT id
    FROM briefcases
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
    LIMIT 1
  ` as Array<{ id: number }>

  const insertedBriefcase = briefcaseRows[0]
    ? briefcaseRows[0]
    : (
      (await sql`
          INSERT INTO briefcases (user_id, title, description, status, metadata, created_at, updated_at)
          VALUES (${userId}, ${DEFAULT_BRIEFCASE.title}, ${DEFAULT_BRIEFCASE.description}, ${DEFAULT_BRIEFCASE.status}, ${JSON.stringify(DEFAULT_BRIEFCASE.metadata)}::jsonb, NOW(), NOW())
          RETURNING id
        ` as Array<{ id: number }>)
    )[0]

  if (!insertedBriefcase) {
    throw new Error('Failed to create onboarding briefcase')
  }

  const goalRows: Array<{ id: number; title: string }> = []
  let goalsCreated = 0

  for (const goal of DEFAULT_GOALS) {
    const existing = await sql`
      SELECT id
      FROM goals
      WHERE user_id = ${userId} AND LOWER(title) = LOWER(${goal.title})
      LIMIT 1
    ` as Array<{ id: number }>

    if (existing.length > 0) {
      goalRows.push({ id: existing[0].id, title: goal.title })
      continue
    }

    const created = await sql`
      INSERT INTO goals (user_id, briefcase_id, title, description, priority, status, created_at, updated_at)
      VALUES (${userId}, ${insertedBriefcase.id}, ${goal.title}, ${goal.description}, ${goal.priority}, 'pending', NOW(), NOW())
      RETURNING id, title
    ` as Array<{ id: number; title: string }>

    const createdGoal = created[0]
    if (createdGoal) {
      goalsCreated += 1
      goalRows.push(createdGoal)
    }
  }

  let tasksCreated = 0
  for (const task of DEFAULT_TASKS) {
    const existingTask = await sql` 
      SELECT id FROM tasks WHERE user_id = ${userId} AND LOWER(title) = LOWER(${task.title}) LIMIT 1
    `

    if (existingTask.length > 0) {
      continue
    }

    await sql`
      INSERT INTO tasks (user_id, briefcase_id, title, description, status, priority, estimated_minutes, category, tags, created_at, updated_at)
      VALUES (${userId}, ${insertedBriefcase.id}, ${task.title}, ${task.description}, 'pending', ${task.priority}, ${task.estimated_minutes}, 'onboarding', ${JSON.stringify(['onboarding', 'solosuccess'])}::jsonb, NOW(), NOW())
    `

    tasksCreated += 1
  }

  const onboardingPayload = {
    version: 1,
    initializedAt: new Date().toISOString(),
    briefcaseId: insertedBriefcase.id,
    goals: goalRows.map((goal) => ({
      id: goal.id,
      title: goal.title,
    })),
    checklist: DEFAULT_TASKS.map((task) => ({
      title: task.title,
      estimatedMinutes: task.estimated_minutes,
      priority: task.priority,
    })),
  }

  await sql`
    UPDATE users
    SET onboarding_data = ${JSON.stringify(onboardingPayload)}::jsonb,
        onboarding_completed = false,
        updated_at = NOW()
    WHERE id = ${userId}
  `

  const result = {
    briefcaseId: insertedBriefcase.id,
    goalsCreated,
    tasksCreated,
  }

  let emailSent = false
  if (userRecord.email) {
    try {
      const response = await sendWelcomeEmail(userRecord.email, userRecord.full_name || 'Boss')
      emailSent = response.success
      if (!response.success) {
        logWarn('Welcome email skipped or failed', {
          userId,
          jobId,
          error: response.error,
        })
      }
    } catch (error) {
      logError('Failed to send onboarding welcome email', error)
    }
  } else {
    logWarn('User missing email for onboarding welcome email', { userId, jobId })
  }

  const summary: WorkflowResult = {
    jobId,
    userId,
    briefcaseId: result.briefcaseId,
    goalsCreated: result.goalsCreated,
    tasksCreated: result.tasksCreated,
    emailSent,
  }

  logInfo('Onboarding workflow completed', summary)

  return summary
}

