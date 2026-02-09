


import { generateText } from 'ai';

import dotenv from 'dotenv';
import path from 'path';

// Try loading .env.local first (overrides)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
// Then load .env (defaults)
dotenv.config();



import { getAgentConfig } from '../shared/index';

// ... (imports)

export async function draftPost(commits: string): Promise<string> {
  // Founder Persona Configuration
  // COST OPTIMIZATION: Using absolute cheapest models as requested
  // Primary: Claude 3 Haiku (Anthropic) - cheapest Anthropic model
  // Fallback: GPT-4o-mini (OpenAI) - cheapest OpenAI model
  
  const founderConfig = getAgentConfig('social');

  if (!founderConfig) {
    return "Error: Could not load social agent configuration.";
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
    if (founderConfig.fallback) {
        console.log("🔄  Retrying with fallback model...");
        try {
            const { text } = await generateText({
                model: founderConfig.fallback,
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


