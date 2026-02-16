
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { goals, tasks, briefcases } from '@/shared/db/schema';
import { onboardingAI } from '@/services/onboarding-ai';
import { ApiError, handleApiError, successResponse } from '@/lib/api-utils';
import { logInfo,} from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const body = await req.json();

    const schema = z.object({
      personalInfo: z.object({
        name: z.string(),
        businessType: z.string(),
      }),
      goals: z.object({
        primaryGoals: z.array(z.string()),
      }),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      throw new ApiError('Invalid onboarding data', 400);
    }

    const { personalInfo, goals: userGoals } = validation.data;

    const userId = session.user.id;

    // 1. Generate the AI Roadmap
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    const launchPlan = await Promise.race([
      onboardingAI.generateLaunchPlan({
        name: personalInfo.name,
        businessType: personalInfo.businessType,
        goals: userGoals.primaryGoals
      }, { signal: controller.signal }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ApiError('AI generation timed out', 504)), 30000);
      })
    ]).finally(() => {
      clearTimeout(timeout);
    });

    logInfo('AI Roadmap Generated', { userId, phases: launchPlan.roadmap.length });

    // 2. Save detailed roadmap to DB
    // First, verify or create a default "Launch Mission" briefcase
    let briefcaseId: string;
    
    // Check for existing "Empire Launch Mission" briefcase for this user
    // Since we don't have eq/and helpers imported from drizzle-orm, we will use sql-like query or just simple insert if not found logic
    // But better to just try/catch unique constraint or query first if possible.
    // Assuming we have access to eq/and. I need to verify imports first.
    // Actually, I don't see eq/and imports. I should use db.query provided by Drizzle if available, or just use the findFirst approach.
    // However, I can't easily add imports without seeing the file structure properly.
    // I see `import { db } from '@/db';` so I probably have access to Drizzle query builder.
    // I'll assume standard Drizzle usage. I'll add the necessary imports to the top of the file in a separate chunk.
    
    const existingBriefcase = await db.query.briefcases.findFirst({
      where: (briefcases, { eq, and }) => and(
        eq(briefcases.user_id, userId),
        eq(briefcases.title, 'Empire Launch Mission')
      )
    });

    if (existingBriefcase) {
      briefcaseId = existingBriefcase.id;
    } else {
      const newBriefcaseId = uuidv4();
      await db.insert(briefcases).values({
        id: newBriefcaseId,
        user_id: userId,
        title: 'Empire Launch Mission',
        description: 'Your AI-generated roadmap to launch your business.',
        status: 'active'
      });
      briefcaseId = newBriefcaseId;
    }

    // 3. Create Goals (Phases) and Tasks
    // Use serialized operations to prevent FK race conditions
    // Insert Goals first, then their Tasks
    
    const goalOperations: any[] = [];
    const taskOperations: any[] = [];

    // Organize data structures
    for (const phase of launchPlan.roadmap) {
      const goalId = uuidv4();
      const goalDueDate = new Date();
      // Heuristic: Set due date 7 days * phase index from now
      const weekIndex = launchPlan.roadmap.indexOf(phase);
      goalDueDate.setDate(goalDueDate.getDate() + (7 * (weekIndex + 1)));

      // Prepare Goal Insert
      goalOperations.push(
        db.insert(goals).values({
          id: goalId,
          user_id: userId,
          briefcase_id: briefcaseId,
          title: phase.phaseName,
          status: 'pending',
          priority: 'high',
          due_date: goalDueDate
        })
      );

      // Prepare Task Inserts linked to this Goal
      for (const task of phase.tasks) {
        taskOperations.push(
          db.insert(tasks).values({
            id: uuidv4(),
            user_id: userId,
            goal_id: goalId,
            briefcase_id: briefcaseId,
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: 'medium',
            estimated_minutes: task.estimatedMinutes
          })
        );
      }
    }

    // Execute Goal inserts first & await completion to satisfy FK constraints
    if (goalOperations.length > 0) {
      await Promise.all(goalOperations);
    }
    
    // Then execute Task inserts
    if (taskOperations.length > 0) {
      await Promise.all(taskOperations);
    }

    return successResponse({
      message: 'Empire Roadmap generated successfully',
      briefcaseId,
      roadmap: launchPlan
    });

  } catch (error) {
    return handleApiError(error);
  }
}
