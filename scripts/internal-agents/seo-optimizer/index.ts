
import { fileURLToPath } from 'url';
import { analyzeBlogPost } from './analyzer';

export async function run() {
  console.log("🔍 Internal Agent: SEO Optimizer");
  console.log("------------------------------");

  const args = process.argv.slice(2);
  const command = args[0];
  const slug = args[1];

  if (command !== 'analyze' || !slug) {
    console.log("Usage: npx tsx scripts/internal-agents/agent.ts seo analyze <slug-or-filename>");
    return;
  }

  const report = await analyzeBlogPost(slug);
  console.log("\n📄 SEO Audit Report:\n");
  console.log(report);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
