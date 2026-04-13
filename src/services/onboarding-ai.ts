
import { OpenAI } from 'openai';
import { z } from 'zod';
import { logInfo, logError, logWarn } from '@/lib/logger';

interface OnboardingProfile {
  name: string;
  businessType: string;
  goals: string[];
}

interface GeneratedTask {
  title: string;
  description: string;
  estimatedMinutes: number;
}

interface GeneratedPhase {
  phaseName: string; // e.g., "Week 1: Foundation"
  tasks: GeneratedTask[];
}

export interface LaunchPlan {
  roadmap: GeneratedPhase[];
}

export class OnboardingAIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logWarn('OPENAI_API_KEY is not set. Onboarding AI Service will use fallback mode.');
    }
  }

  async generateLaunchPlan(profile: OnboardingProfile, options?: { signal?: AbortSignal }): Promise<LaunchPlan> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY is missing. Onboarding AI Service requires an active OpenAI subscription.');
    }

    try {
      logInfo('Generating AI Launch Plan...', { profile });

      const prompt = `
        You are an expert business strategist for solopreneurs.
        Create a 4-week "Launch Mission" for a new ${profile.businessType} named "${profile.name}".
        Their primary goals are: ${profile.goals.join(', ')}.

        Return ONLY a JSON object with this exact structure (no markdown, no extra text):
        {
          "roadmap": [
            {
              "phaseName": "Week 1: [Theme]",
              "tasks": [
                { "title": "[Actionable Title]", "description": "[Short specific instruction]", "estimatedMinutes": [number 15-60] }
              ]
            }
          ]
        }
        Create exactly 4 phases (Week 1 to Week 4). Each phase should have 3-5 high-impact tasks.
        Make the tasks specific to being a ${profile.businessType}.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Or gpt-3.5-turbo if cost is concern, but 4 is better for strategy
        messages: [
          { role: 'system', content: 'You are a JSON-only API that outputs precise business roadmaps.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }, { signal: options?.signal }); // Pass abort signal to OpenAI client

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      // Define schema for validation
      const TaskSchema = z.object({
        title: z.string(),
        description: z.string(),
        estimatedMinutes: z.number(),
      });

      const PhaseSchema = z.object({
        phaseName: z.string(),
        tasks: z.array(TaskSchema),
      });

      const LaunchPlanSchema = z.object({
        roadmap: z.array(PhaseSchema),
      });

      const plan = JSON.parse(content);
      const validatedPlan = LaunchPlanSchema.parse(plan);
      
      return validatedPlan as unknown as LaunchPlan;

    } catch (error) {
      logError('Failed to generate AI Launch Plan', error);
      throw error;
    }
  }
}

export const onboardingAI = new OnboardingAIService();
