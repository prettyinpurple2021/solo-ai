"use server"

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

export const voiceIntentSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  estimatedMinutes: z.number(),
  actions: z.array(z.object({
    type: z.string(),
    content: z.string(),
    order: z.number()
  })).optional(),
  tags: z.array(z.string()).optional()
});

export type VoiceIntent = z.infer<typeof voiceIntentSchema>;

/**
 * Process a voice transcript to extract structured intent using Gemini 1.5 Flash
 */
export async function processVoiceIntent(text: string): Promise<VoiceIntent> {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: voiceIntentSchema as any,
      prompt: `
        Analyze the following voice transcript and extract structured task information.
        Be precise and professional. Extract multi-step actions if present (Deep Command parsing).
        
        Transcript: "${text}"
        
        Extract:
        - title: A concise, action-oriented title.
        - description: A detailed description capturing all context.
        - priority: One of: low, medium, high, urgent.
        - estimatedMinutes: A numeric estimate of time required.
        - actions: If the user describes multiple steps, break them into an array of sub-tasks.
        - tags: Relevant categories (e.g., "marketing", "admin", "dev").
      `
    }) as any;

    return result.object;
  } catch (error) {
    logError("Voice intent processing failed", error as Error);
    // Return a minimal valid object as fallback if AI fails
    return {
      title: text.slice(0, 50),
      description: text,
      priority: "medium",
      estimatedMinutes: 30,
      actions: []
    };
  }
}
