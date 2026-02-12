
import { db } from "../src/lib/database-client";
import { learningPaths, learningModules } from "../src/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { generateObject } from "ai";
import { openai } from "../src/lib/ai-config";
import { z } from "zod";
import { logInfo, logError } from "../src/lib/logger";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function populateLearningMetadata() {
  logInfo("🚀 Starting Learning Module Metadata Population...");

  try {
    // 1. Ensure core paths exist
    const corePaths = [
      {
        title: "Marketing Fundamentals for Solopreneurs",
        description: "Master the basics of digital marketing, branding, and customer acquisition as a solo founder.",
        category: "Marketing",
        difficulty: "Beginner",
      },
      {
        title: "Financial Management & Scaling",
        description: "Learn how to manage your business finances, taxes, and prepare for sustainable growth.",
        category: "Finance",
        difficulty: "Intermediate",
      },
      {
        title: "Operations & Automation",
        description: "Streamline your solo business with automation tools and efficient operational workflows.",
        category: "Operations",
        difficulty: "Intermediate",
      }
    ];

    for (const pathData of corePaths) {
      const existing = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.title, pathData.title)
      });

      if (!existing) {
        logInfo(`Creating path: ${pathData.title}`);
        await db.insert(learningPaths).values({
          ...pathData,
          is_public: true
        });
      }
    }

    // 2. Fetch all paths to ensure we have IDs for modules
    const allPaths = await db.query.learningPaths.findMany();

    // 3. Ensure some base modules exist if path is empty
    const baseModules = [
      {
        pathTitle: "Marketing Fundamentals for Solopreneurs",
        modules: [
          { title: "Finding Your Niche", content: "# Finding Your Niche\nIdentify the specific market segment where you can provide the most value.", order: 1 },
          { title: "Building a Brand Identity", content: "# Brand Identity\nCreate a visual and verbal identity that resonates with your audience.", order: 2 },
          { title: "Basic Content Strategy", content: "# Content Strategy\nPlan and execute a content schedule that drives engagement.", order: 3 }
        ]
      },
      {
        pathTitle: "Financial Management & Scaling",
        modules: [
          { title: "Bookkeeping Basics", content: "# Bookkeeping\nTrack every dollar in and out of your business.", order: 1 },
          { title: "Tax Planning for Solos", content: "# Tax Planning\nUnderstand your tax obligations and how to optimize them.", order: 2 }
        ]
      }
    ];

    for (const group of baseModules) {
      const path = allPaths.find(p => p.title === group.pathTitle);
      if (!path) continue;

      for (const moduleData of group.modules) {
        const existing = await db.query.learningModules.findFirst({
          where: and(
            eq(learningModules.path_id, path.id),
            eq(learningModules.title, moduleData.title)
          )
        });

        if (!existing) {
          logInfo(`Creating module: ${moduleData.title} in ${path.title}`);
          await db.insert(learningModules).values({
            ...moduleData,
            path_id: path.id,
            module_type: 'article',
            duration_minutes: 15
          });
        }
      }
    }

    // 4. Enrich modules with missing metadata
    const modulesToEnrich = await db.query.learningModules.findMany();
    
    logInfo(`Checking ${modulesToEnrich.length} modules for metadata enrichment...`);

    for (const module of modulesToEnrich) {
      // Check if enrichment is needed (e.g. description is null or skills_covered is empty)
      const needsEnrichment = !module.description || 
                             !module.skills_covered || 
                             (Array.isArray(module.skills_covered) && module.skills_covered.length === 0);

      if (!needsEnrichment) {
          logInfo(`Skipping enrichment for: ${module.title} (already enriched)`);
          continue;
      }

      logInfo(`Enriching module: ${module.title}...`);

      try {
        const enrichment = await generateObject({
          model: openai("gpt-4o"),
          schema: z.object({
            description: z.string(),
            difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
            skills_covered: z.array(z.string()),
            prerequisites: z.array(z.string()),
            estimated_duration: z.number().int().min(1)
          }),
          prompt: `
            Enrich a learning module with metadata.
            
            Module Title: ${module.title}
            Content Preview: ${module.content.substring(0, 500)}...
            
            Provide a professional description, difficulty level, a list of specific skills covered, prerequisites, and an estimated duration in minutes.
          `
        });

        await db.update(learningModules)
          .set({
            description: enrichment.object.description,
            difficulty: enrichment.object.difficulty,
            skills_covered: enrichment.object.skills_covered,
            prerequisites: enrichment.object.prerequisites,
            duration_minutes: enrichment.object.estimated_duration,
            updated_at: new Date()
          })
          .where(eq(learningModules.id, module.id));

        logInfo(`✅ Successfully enriched: ${module.title}`);
      } catch (aiError) {
        logError(`Failed to enrich module ${module.title} via AI`, aiError as Error);
      }
    }

    logInfo("✨ Learning Module Metadata Population Complete!");
    process.exit(0);
  } catch (error) {
    logError("Fatal error during population", error as Error);
    process.exit(1);
  }
}

populateLearningMetadata();
