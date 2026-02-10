
import { generateText } from 'ai';
import { getAgentConfig } from '../shared/index';
import fs from 'fs';
import path from 'path';

export async function draftBlogPost(topic: string): Promise<string> {
  const writerConfig = getAgentConfig('writer');
  if (!writerConfig) {
    return "Error: Could not load writer agent configuration.";
  }

  const prompt = `
    Write a comprehensive, engaging technical blog post about: "${topic}"
    
    Target Audience: Solo founders, indie hackers, and developers interested in AI.
    
    Requirements:
    - Use strict Markdown format.
    - Include a Frontmatter block at the very top:
      ---
      title: "Catchy Title Here"
      date: "${new Date().toISOString().split('T')[0]}"
      excerpt: "1-2 sentence summary for SEO and previews."
      category: "Choose one: Building in Public, Technical Deep Dive, Growth, or Automation"
      readTime: "Estimated read time (e.g., 5 min read)"
      ---
    - Use H2 (##) and H3 (###) for structure.
    - Keep paragraphs short and punchy.
    - Use code blocks where relevant.
    - Ending with a "Key Takeaways" section.
    - Tone: Authentic, "builder-to-builder", slightly opinionated but helpful.
  `;

  console.log(`🧠 Brainstorming content for: "${topic}"...`);

  try {
    const { text } = await generateText({
      model: writerConfig.model,
      system: writerConfig.systemPrompt,
      prompt: prompt,
    });
    
    // Clean up potential markdown code block artifacts if the model wraps the whole thing
    let content = text.trim();
    if (content.startsWith('```markdown')) {
        content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
        content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return content;
  } catch (error: any) {
    console.warn("⚠️  Primary model generation failed:", error.message || error);
    
    if (writerConfig.fallback) {
        console.log("🔄  Retrying with fallback model...");
        try {
            const { text } = await generateText({
                model: writerConfig.fallback,
                system: writerConfig.systemPrompt,
                prompt: prompt,
            });
            let content = text.trim();
            if (content.startsWith('```markdown')) content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');
            else if (content.startsWith('```')) content = content.replace(/^```\n/, '').replace(/\n```$/, '');
            return content;
        } catch (retryError) {
            console.error("❌  Retry failed:", retryError);
            return "Failed to generate blog post.";
        }
    }
    return "Failed to generate blog post.";
  }
}

export function saveBlogPost(content: string, slug?: string): string {
    // Basic slug generation from title if not provided
    if (!slug) {
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        if (titleMatch && titleMatch[1]) {
            slug = titleMatch[1].toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        } else {
            slug = `post-${Date.now()}`;
        }
    }

    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Blog post saved to: content/blog/${slug}.md`);
    return filePath;
}
