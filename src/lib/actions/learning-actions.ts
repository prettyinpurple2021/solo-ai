'use server';

import { auth } from '@/lib/auth';
import { LearningEngineService } from '@/lib/services/learning-engine-service';

export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

export async function submitAssessmentAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const assessmentId = formData.get('assessmentId') as string;
  
  if (!assessmentId) {
    return { error: 'Missing required fields' };
  }

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('answer_')) {
      const qId = key.replace('answer_', '');
      answers[qId] = value as string;
    }
  }

  if (Object.keys(answers).length === 0) {
    return { error: 'No answers provided' };
  }

  try {
    const result = await LearningEngineService.submitAssessment(session.user.id, assessmentId, answers);
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error(`Error in submitAssessmentAction:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return { error: errorMessage };
  }
}
