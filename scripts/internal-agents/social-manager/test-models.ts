
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
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-latest',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
];

async function testModel(provider: 'anthropic' | 'openai', modelId: string) {
  process.stdout.write(`Testing ${modelId.padEnd(30)} ... `);
  try {
    const model = provider === 'anthropic' ? anthropic(modelId) : openai(modelId);
    await generateText({
      model,
      prompt: "Hi",
      maxTokens: 5,
    });
    console.log("✅ Custom success"); // Using custom success instead of emoji
  } catch (error: any) {
    if (error.message?.includes('not_found_error') || error.message?.includes('model_not_found')) {
        console.log("❌ Not Found / No Access");
    } else if (error.message?.includes('insufficient_quota')) {
        console.log("❌ Insufficient Quota");
    } else {
        console.log(`❌ Error: ${error.message?.substring(0, 50)}...`);
    }
  }
}

async function run() {
  console.log("🔍 Model Access Tester");
  console.log("========================================");

  if (process.env.ANTHROPIC_API_KEY) {
    console.log("\nAnthropic Models:");
    for (const m of ANTHROPIC_MODELS) {
      await testModel('anthropic', m);
    }
  } else {
    console.log("\nAnthropic: Skipped (No API Key)");
  }

  if (process.env.OPENAI_API_KEY) {
    console.log("\nOpenAI Models:");
    for (const m of OPENAI_MODELS) {
      await testModel('openai', m);
    }
  } else {
    console.log("\nOpenAI: Skipped (No API Key)");
  }
  
  console.log("\nDone.");
}

run().catch(console.error);
