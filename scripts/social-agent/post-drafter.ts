


import { generateText } from 'ai';
import { getTeamMemberConfig, teamMemberModels } from '../../src/lib/ai-config';
import dotenv from 'dotenv';
import path from 'path';

// Try loading .env.local first (overrides)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
// Then load .env (defaults)
dotenv.config();


export async function draftPost(commits: string): Promise<string> {
  let echoConfig = getTeamMemberConfig('echo');
  
  // Check for API keys and fallback if needed
  if (!process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY not found. Falling back to OpenAI (Roxy model) for Echo persona.");
    // Use Echo's prompt but OpenAI model
    echoConfig = {
      model: teamMemberModels.roxy.model, // Reuse Roxy's model (GPT-4o)
      systemPrompt: echoConfig.systemPrompt // Still use Echo's persona
    };
  } else if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return "Error: No API keys found for Anthropic or OpenAI. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env.";
  }

  if (!commits || commits.includes("No recent commits found.")) {
    return "No recent updates to share right now.";
  }

  const prompt = `
    Build-in-Public Update:
    Here are the recent commits for SoloSuccess AI:
    ${commits}
    
    Create a short, engaging X (Twitter) post about these updates.
    Focus on the progress and value. Use your punk rock persona (Echo).
    Keep it under 280 characters if possible, but meaningful.
    Format it as plain text without Markdown. Do not include hashtags unless critical.
  `;


  try {
    const { text } = await generateText({
      model: echoConfig.model,
      system: echoConfig.systemPrompt,
      prompt: prompt,
    });
    
    return text.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if any
  } catch (error: any) {
    console.warn("⚠️  Primary model generation failed:", error.message || error);
    
    // Fallback to Roxy (OpenAI) if primary failed
    if (echoConfig.model !== teamMemberModels.roxy.model && process.env.OPENAI_API_KEY) {
        console.log("🔄  Retrying with OpenAI (Roxy model)...");
        try {
            const { text } = await generateText({
                model: teamMemberModels.roxy.model,
                system: echoConfig.systemPrompt, // Keep Echo persona
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

