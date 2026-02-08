
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import dotenv from 'dotenv';
import path from 'path';

// Load envs
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
dotenv.config();

const ANTHROPIC_MODELS = [
  'claude-3-haiku-20240307',  // Cheapest Anthropic
  'claude-3-5-sonnet-20241022', // Check if unlocked
];

const OPENAI_MODELS = [
  'gpt-4o-mini', // Cheapest OpenAI (usually)
  'gpt-3.5-turbo',
];

async function testModel(provider: 'anthropic' | 'openai', modelId: string) {
  process.stdout.write(`Testing ${modelId.padEnd(30)} ... `);
  try {
    const model = provider === 'anthropic' ? anthropic(modelId) : openai(modelId);
    await generateText({
      model,
      prompt: "Hi",
    });
    console.log("✅ Success");
  } catch (error: any) {
    console.log(`❌ Error: ${error.message?.substring(0, 40)}...`);
  }
}

async function run() {
  console.log("🔍 Cost-Effective Model Tester");
  console.log("========================================");

  if (process.env.ANTHROPIC_API_KEY) {
    console.log("\nAnthropic:");
    for (const m of ANTHROPIC_MODELS) {
      await testModel('anthropic', m);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    console.log("\nOpenAI:");
    for (const m of OPENAI_MODELS) {
      await testModel('openai', m);
    }
  }
  
  console.log("\nDone.");
}

run().catch(console.error);
