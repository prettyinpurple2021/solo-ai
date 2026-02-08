
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import path from 'path';

// Load envs globally
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
dotenv.config();

// Persona-specific model configuration
export function getAgentConfig(role: 'social' | 'coder' | 'reviewer' | 'committer') {
  // Use cheapest models unless quality demands otherwise
  const primaryModel = process.env.ANTHROPIC_API_KEY 
    ? anthropic('claude-3-haiku-20240307') 
    : openai('gpt-4o-mini');
  
  const fallbackModel = openai('gpt-4o-mini');

  const personas = {
    social: {
      name: "Social Media Manager (Haiku)",
      systemPrompt: `You are the Social Media Manager for SoloSuccess AI.
      Role: Build-in-Public Founder Persona.
      Tone: Authentic, technical, succinct.
      Goal: Share progress and engage with the builder community.`,
      model: primaryModel,
      fallback: fallbackModel
    },
    coder: {
      name: "Code Generator (Haiku/Mini)",
      systemPrompt: `You are the Lead Developer for SoloSuccess AI.
      Role: Generating boilerplate and feature code.
      Tone: Efficient, clean, modern TypeScript/Next.js.
      Goal: Scaffolding robust code structures.`,
      model: primaryModel, // Haiku is great for code gen speed/cost
      fallback: fallbackModel
    },
    reviewer: {
      name: "Code Reviewer (Haiku)",
      systemPrompt: `You are the Senior Code Reviewer.
      Role: Analyzing code for bugs, security issues, and style.
      Tone: Critical but constructive. Focus on production readiness.
      Goal: Identify issues before deployment.`,
      model: primaryModel,
      fallback: fallbackModel
    },
    committer: {
      name: "Repo Committer (Haiku)",
      systemPrompt: `You are the Git Operator.
      Role: Summarizing changes into Conventional Commits.
      Tone: Professional, concise.
      Format: type(scope): subject
      Goal: Clear git history.`,
      model: primaryModel,
      fallback: fallbackModel
    }
  };

  return personas[role];
}
