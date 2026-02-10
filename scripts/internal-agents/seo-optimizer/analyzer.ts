
import { generateText } from 'ai';
import { getAgentConfig } from '../shared/index';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function analyzeBlogPost(slug: string): Promise<string> {
  const seoConfig = getAgentConfig('seo');
  if (!seoConfig) {
    return "Error: Could not load SEO agent configuration.";
  }

  // Construct file path
  // Handle if slug includes .md or not
  const fileName = slug.endsWith('.md') ? slug : `${slug}.md`;
  const filePath = path.join(process.cwd(), 'content', 'blog', fileName);

  if (!fs.existsSync(filePath)) {
    return `Error: Blog post not found at ${filePath}`;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContents);

  const prompt = `
    Analyze the following blog post for SEO optimization.
    
    Frontmatter:
    ${JSON.stringify(frontmatter, null, 2)}
    
    Content (first 2000 words):
    ${content.substring(0, 8000)}
    
    Provide an audit report covering:
    1. **Title & Meta**: Is the title catchy? Is it under 60 chars?
    2. **Structure**: Are headers used correctly?
    3. **Keywords**: Identify primary keywords and suggest improvements.
    4. **Readability**: Is it easy to read?
    5. **Actionable Fixes**: Bullet points of what to change immediately.
    
    Give a score out of 100.
  `;

  console.log(`🔍 Analyzing SEO for: "${slug}"...`);

  try {
    const { text } = await generateText({
      model: seoConfig.model,
      system: seoConfig.systemPrompt,
      prompt: prompt,
    });
    
    return text;
  } catch (error: any) {
    console.warn("⚠️  Primary model generation failed:", error.message || error);
    if (seoConfig.fallback) {
         try {
            const { text } = await generateText({
                model: seoConfig.fallback,
                system: seoConfig.systemPrompt,
                prompt: prompt,
            });
            return text;
        } catch (retryError) {
            return "Failed to analyze blog post.";
        }
    }
    return "Failed to analyze blog post.";
  }
}
