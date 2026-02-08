
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import dotenv from 'dotenv';
import path from 'path';

// Load envs
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
dotenv.config();

async function testKeys() {
  console.log("🔍 API Key Debugger");
  console.log("--------------------------------");

  const openAIKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  console.log(`OpenAI Key: ${openAIKey ? `Present (${openAIKey.substring(0, 8)}...)` : "MISSING"}`);
  console.log(`Anthropic Key: ${anthropicKey ? `Present (${anthropicKey.substring(0, 8)}...)` : "MISSING"}`);
  console.log("--------------------------------\n");

  // Test OpenAI
  if (openAIKey) {
    console.log("Testing OpenAI (gpt-4o)...");
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: "Say 'OpenAI is working' in 3 words.",
      });
      console.log("✅ OpenAI Success:", text);
    } catch (error: any) {
      console.error("❌ OpenAI Failed:");
      console.error(`   Type: ${error.name}`);
      console.error(`   Message: ${error.message}`);
      if (error.responseBody) {
          console.error(`   Response: ${error.responseBody}`);
      }
    }
  } else {
    console.log("Refusing to test OpenAI (no key).");
  }

  console.log("\n--------------------------------\n");

  // Test Anthropic
  if (anthropicKey) {
    console.log("Testing Anthropic (claude-3-5-sonnet-20241022)...");
    try {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt: "Say 'Anthropic is working' in 3 words.",
      });
      console.log("✅ Anthropic Success:", text);
    } catch (error: any) {
      console.error("❌ Anthropic Failed:");
      console.error(`   Type: ${error.name}`);
      console.error(`   Message: ${error.message}`);
      
      // Try fallback model if specific one fails
      console.log("\n   Thinking: Maybe the user only has access to older models?");
      console.log("   Attempting fallback to 'claude-3-haiku-20240307'...");
      try {
          const { text } = await generateText({
            model: anthropic("claude-3-haiku-20240307"),
            prompt: "Say 'Anthropic Haiku works' in 3 words.",
          });
          console.log("   ✅ Anthropic Haiku Success:", text);
      } catch (fallbackError: any) {
          console.error("   ❌ Anthropic Haiku Failed:", fallbackError.message);
      }
    }
  } else {
    console.log("Refusing to test Anthropic (no key).");
  }
}

testKeys().catch(console.error);
