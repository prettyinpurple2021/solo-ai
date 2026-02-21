
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { goals, tasks, briefcases } from '@/shared/db/schema';
import { onboardingAI } from '@/services/onboarding-ai';
import { ApiError, handleApiError, successResponse } from '@/lib/api-utils';
import { logInfo, logError } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

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

    // 2. Save detailed roadmap to DB using a transaction
    const result = await db.transaction(async (tx) => {
      // Find or create "Empire Launch Mission" briefcase
      let briefcaseId: string;
      
      const existingBriefcase = await tx.query.briefcases.findFirst({
        where: (briefcases, { eq, and }) => and(
          eq(briefcases.user_id, userId),
          eq(briefcases.title, 'Empire Launch Mission')
        )
      });

      if (existingBriefcase) {
        briefcaseId = existingBriefcase.id;
      } else {
        const newBriefcaseId = uuidv4();
        await tx.insert(briefcases).values({
          id: newBriefcaseId,
          user_id: userId,
          title: 'Empire Launch Mission',
          description: 'Your AI-generated roadmap to launch your business.',
          status: 'active'
        });
        briefcaseId = newBriefcaseId;
      }

      // Create Goals (Phases) and Tasks
      for (const phase of launchPlan.roadmap) {
        const goalId = uuidv4();
        const goalDueDate = new Date();
        const weekIndex = launchPlan.roadmap.indexOf(phase);
        goalDueDate.setDate(goalDueDate.getDate() + (7 * (weekIndex + 1)));

        // Insert Goal
        await tx.insert(goals).values({
          id: goalId,
          user_id: userId,
          briefcase_id: briefcaseId,
          title: phase.phaseName,
          status: 'pending',
          priority: 'high',
          due_date: goalDueDate
        });

        // Insert Tasks for this Goal
        for (const task of phase.tasks) {
          await tx.insert(tasks).values({
            id: uuidv4(),
            user_id: userId,
            goal_id: goalId,
            briefcase_id: briefcaseId,
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: 'medium',
            estimated_minutes: task.estimatedMinutes
          });
        }
      }

      return { briefcaseId };
    });

    return successResponse({
      message: 'Empire Roadmap generated successfully',
      briefcaseId: result.briefcaseId,
      roadmap: launchPlan
    });

  } catch (error) {
    logError('Onboarding Roadmap Failed', error);
    return handleApiError(error);
  }
}
