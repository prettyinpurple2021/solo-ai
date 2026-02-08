


import { generateText } from 'ai';
import { getTeamMemberConfig, teamMemberModels } from '../../src/lib/ai-config';
import dotenv from 'dotenv';
import path from 'path';

// Try loading .env.local first (overrides)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
// Then load .env (defaults)
dotenv.config();



import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// ... (imports)

export async function draftPost(commits: string): Promise<string> {
  // Founder Persona Configuration
  // COST OPTIMIZATION: Using absolute cheapest models as requested
  // Primary: Claude 3 Haiku (Anthropic) - cheapest Anthropic model
  // Fallback: GPT-4o-mini (OpenAI) - cheapest OpenAI model
  
  const founderConfig = {
    model: anthropic('claude-3-haiku-20240307'), 
    systemPrompt: `You are a Technical Founder building SoloSuccess AI in public.
    
    Your Personality:
    - Authentic, transparent, and enthusiastic about progress.
    - You share the "grind" and the wins equally.
    - You talk like a builder/hacker, not a marketing department.
    - You love efficient code, solving hard problems, and shipping.
    - You use "I" and "We" interchangeably but lean towards personal ownership ("I just shipped...").
    
    Your Goal:
    - Share technical updates that show momentum.
    - Engage with other builders on X (Twitter).
    - Avoid corporate speak, buzzwords, or hashtags (unless relevant tags like #buildinpublic).
    
    Format:
    - Short, punchy updates (under 280 chars).
    - Focus on *what* changed and *why* it matters.
    `
  };

  // Check for API keys
  if (!process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY not found. Using OpenAI (GPT-4o-mini) as primary.");
    founderConfig.model = openai('gpt-4o-mini');
  } else if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return "Error: No API keys found for Anthropic or OpenAI. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env.";
  }

  if (!commits || commits.includes("No recent commits found.")) {
    return "No recent updates to share right now.";
  }

  const prompt = `
    Here are the recent git commits for SoloSuccess AI:
    ${commits}
    
    Draft a "Build-in-Public" tweet about this progress.
    - Highlight specific features or fixes if they sound interesting.
    - If it's refactoring or "boring" work, frame it as "laying the foundation" or "cleaning house".
    - Keep it under 280 characters.
    - No emojis unless they fit the "builder" vibe (🚀, 🛠️, 🐛).
    - No hashtags except maybe #buildinpublic.
    - Plain text only.
  `;

  try {
    const { text } = await generateText({
      model: founderConfig.model,
      system: founderConfig.systemPrompt,
      prompt: prompt,
    });
    
    return text.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if any
  } catch (error: any) {
    console.warn("⚠️  Primary model (Haiku) generation failed:", error.message || error);
    
    // Fallback to OpenAI (GPT-4o-mini) if primary failed
    if (process.env.OPENAI_API_KEY) {
        console.log("🔄  Retrying with OpenAI (GPT-4o-mini)...");
        try {
            const { text } = await generateText({
                model: openai('gpt-4o-mini'),
                system: founderConfig.systemPrompt, // Keep Founder persona
                prompt: prompt,
            });
            return text.trim().replace(/^"|"$/g, '');
        } catch (retryError) {
            console.error("❌  Retry failed:", retryError);
            return "Failed to generate post.";
        }
    }
    
    return "Failed to generate post.";
  }
}


