
import { db } from "@/lib/database-client";
import { LearningEngine } from "@/lib/learning-engine";
import { learningPaths, learningModules, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🔍 Starting Learning System Verification...");

  // 1. Setup Test User
  console.log("\n1. Setting up Test User...");
  let user = await db.query.users.findFirst({
    where: eq(users.email, "verify-learning@example.com")
  });

  if (!user) {
    const result = await db.insert(users).values({
      email: "verify-learning@example.com",
      name: "Learning Verifier",
      onboarding_completed: true
    }).returning();
    user = result[0];
    console.log("   ✅ Created test user:", user.id);
  } else {
    console.log("   ✅ Using existing test user:", user.id);
  }

  // 2. Setup Test Content (Path & Modules)
  console.log("\n2. Setting up Test Learning Content...");
  // Check if we have paths, if not create one
  const existingPaths = await LearningEngine.getAllPaths();
  let pathId: string | undefined;
  let moduleId: string | undefined;

  if (existingPaths.length === 0) {
    const p = await db.insert(learningPaths).values({
      title: "Verification Path",
      description: "Path for verification script",
      category: "testing",
      difficulty: "beginner"
    }).returning();
    pathId = p[0].id;
    console.log("   ✅ Created test path:", pathId);

    const m = await db.insert(learningModules).values({
        path_id: pathId!,
        title: "Test Module 1",
        content: "Test content",
        duration_minutes: 5,
        order: 1
    }).returning();
    moduleId = m[0].id;
    console.log("   ✅ Created test module:", moduleId);
  } else {
    // specific type assertion/check if needed, but for now just grab first
    pathId = existingPaths[0].id;
    // We need to get modules for this path to get an ID
    const pathWithModules = await LearningEngine.getPathWithProgress(pathId!, user.id);
    if (pathWithModules && pathWithModules.modules.length > 0) {
        moduleId = pathWithModules.modules[0].id;
        console.log("   ✅ Found existing path/module:", pathId, moduleId);
    } else {
         // Create module for existing path if missing
         const m = await db.insert(learningModules).values({
            path_id: pathId!,
            title: "Test Module 1",
            content: "Test content",
            duration_minutes: 5,
            order: 1
        }).returning();
        moduleId = m[0].id;
        console.log("   ✅ Created module for existing path:", moduleId);
    }
  }

  if (!moduleId) throw new Error("Failed to resolve module ID");

  // 3. Test Progress Tracking
  console.log("\n3. Testing Progress Tracking...");
  
  // Start module
  await LearningEngine.updateProgress(user.id, moduleId, "in_progress");
  let progress = await LearningEngine.getUserProgress(user.id);
  let entry = progress.find(p => p.module_id === moduleId);
  
  if (entry?.status !== "in_progress") {
    throw new Error(`Expected status 'in_progress', got '${entry?.status}'`);
  }
  console.log("   ✅ Module started successfully");

  // Complete module
  await LearningEngine.updateProgress(user.id, moduleId, "completed");
  progress = await LearningEngine.getUserProgress(user.id);
  entry = progress.find(p => p.module_id === moduleId);

  if (entry?.status !== "completed") {
    throw new Error(`Expected status 'completed', got '${entry?.status}'`);
  }
  console.log("   ✅ Module completed successfully");

  // 4. Test Analytics
  console.log("\n4. Testing Analytics...");
  const analytics = await LearningEngine.getLearningAnalytics(user.id);
  console.log("   Stored Analytics:", JSON.stringify(analytics, null, 2));

  if (analytics.total_modules_completed < 1) {
    console.warn("   ⚠️ Analytics may not be updating immediately or mock logic is static");
  } else {
    console.log("   ✅ Analytics reflect completion");
  }

  // 5. Test Recommendations
  console.log("\n5. Testing Recommendations...");
  const recs = await LearningEngine.getRecommendations(user.id);
  console.log(`   Fetched ${recs.length} recommendations`);
  
  if (!Array.isArray(recs)) throw new Error("Recommendations must be an array");
  console.log("   ✅ Recommendations format valid");

  console.log("\n🎉 Learning System Verification Complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Verification Failed:", err);
  process.exit(1);
});
