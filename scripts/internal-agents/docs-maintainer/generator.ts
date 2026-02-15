
import { generateText } from 'ai';
import { getAgentConfig } from '../shared/index';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

export async function generateReadme(): Promise<string> {
    const docsConfig = getAgentConfig('docs');
    if (!docsConfig) return "Error: Config not found";

    // Gather project context
    const packageJson = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    
    let roadMap = '';
    try {
        roadMap = fs.readFileSync(path.join(process.cwd(), 'ROADMAP.md'), 'utf8');
    } catch (e) {
        console.warn("ROADMAP.md not found, proceeding without it.");
    }

    const prompt = `
    Generate a comprehensive README.md for this project.
    
    Context:
    Package.json: ${packageJson}
    Roadmap / Status: ${roadMap}
    
    Requirements:
    - Use "DEVELOPER MODE".
    - Tone: Professional, technical, concise.
    - Structure:
        - Project Title & Description
        - Key Features (based on installed packages and tasks)
        - Tech Stack
        - Internal Agents (Social, Blog, SEO, Docs)
        - Getting Started (npm install, etc.)
        - Roadmap (from task.md)
    `;

    console.log("📚 Analyzing project structure for README...");

    try {
        const { text } = await generateText({
            model: docsConfig.model,
            system: docsConfig.systemPrompt,
            prompt: prompt,
        });
        
        // Strip markdown blocks if present
        let content = text.trim();
        if (content.startsWith('```markdown')) content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');
        else if (content.startsWith('```')) content = content.replace(/^```\n/, '').replace(/\n```$/, '');

        fs.writeFileSync(path.join(process.cwd(), 'README.md'), content);
        return "README.md updated successfully.";
    } catch (error) {
        return "Failed to generate README.";
    }
}

export async function generateUserGuide(topic: string): Promise<string> {
    const docsConfig = getAgentConfig('docs');
    if (!docsConfig) return "Error: Config not found";

    const prompt = `
    Write a user-facing "How-to" guide for: "${topic}"
    
    Requirements:
    - Use "USER MODE" (Instructional, simple, encouraging).
    - Format: Markdown with Frontmatter.
    - Frontmatter keys: title, excerpt, date ("${new Date().toISOString().split('T')[0]}"), category ("User Guide").
    - Structure:
        - Introduction (Why this matters)
        - Prerequisities (if any)
        - Step-by-Step Instructions (numbered)
        - Troubleshooting / Tips
    `;

    console.log(`📘 Drafting User Guide: "${topic}"...`);

    try {
        const { text } = await generateText({
            model: docsConfig.model,
            system: docsConfig.systemPrompt,
            prompt: prompt,
        });

        // Strip markdown blocks
        let content = text.trim();
        if (content.startsWith('```markdown')) content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');
        else if (content.startsWith('```')) content = content.replace(/^```\n/, '').replace(/\n```$/, '');

        // Generate slug
        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const filePath = path.join(DOCS_DIR, `${slug}.md`);
        
        // Ensure directory exists
        if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

        fs.writeFileSync(filePath, content);
        return `User Guide saved to: content/docs/${slug}.md`;
    } catch (error) {
        return "Failed to generate User Guide.";
    }
}
