import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/lib/shared/db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding Course 1...');
  
  const existing = await db.query.learningPaths.findFirst({
    where: eq(schema.learningPaths.title, 'Course 1: Priority & Decision-Making Clarity')
  });

  let pathId = existing?.id;

  if (!pathId) {
    const res = await db.insert(schema.learningPaths).values({
      title: 'Course 1: Priority & Decision-Making Clarity',
      description: 'Designed to help founders master ruthless prioritization and scale without burnout.',
      category: 'productivity',
      difficulty: 'intermediate',
      is_public: true,
      tags: ['prioritization', 'decision-making', 'founder', 'scaling']
    }).returning({ id: schema.learningPaths.id });
    pathId = res[0].id;
    console.log(`Created learning path: ${pathId}`);
  } else {
    console.log(`Learning path already exists: ${pathId}`);
  }

  const modules = [
    { title: 'Lesson 1: The Scatter Problem', description: 'The illusion of productivity vs. actual progress and founder failure rates.', content: 'Assignment: Audit your current activities to identify busywork.', order: 1, duration_minutes: 15, module_type: 'article', skills: ['Self-Awareness'] },
    { title: 'Lesson 2: The Three Core Business Drivers', description: 'Identifying what moves revenue (Offer Clarity, Customer Access, and Delivery Excellence).', content: 'Assignment: Document your three business drivers.', order: 2, duration_minutes: 20, module_type: 'article', skills: ['Strategic Planning'] },
    { title: 'Lesson 3: Decision-Making Matrices & Priority Scoring', description: 'RICE scoring and Impact vs. Effort analysis.', content: 'Assignment: Score your current project backlog.', order: 3, duration_minutes: 25, module_type: 'article', skills: ['Decision Making', 'Prioritization'] },
    { title: 'Lesson 4: The Power of "No"', description: 'The cost of over-committing and scripts for declining opportunities.', content: 'Assignment: Practice declining 3 requests this week.', order: 4, duration_minutes: 15, module_type: 'article', skills: ['Boundary Setting'] },
    { title: 'Lesson 5: Building a Freedom-First Business Model', description: 'Defining non-negotiables and mastering a single core offer rather than service sprawl.', content: 'Assignment: Define your single core offer.', order: 5, duration_minutes: 20, module_type: 'article', skills: ['Business Modeling'] },
    { title: 'Lesson 6: The Eisenhower Matrix for Solopreneurs', description: 'Urgent vs. important tasks and time-blocking for deep work.', content: 'Assignment: Create your weekly time-blocking template.', order: 6, duration_minutes: 20, module_type: 'article', skills: ['Time Management'] },
    { title: 'Lesson 7: Energy Management Over Time Management', description: 'Matching tasks to your chronotype and energy rhythms.', content: 'Assignment: Map your energy patterns for two weeks.', order: 7, duration_minutes: 15, module_type: 'article', skills: ['Energy Management'] },
    { title: 'Lesson 8: The Quarterly OKR System', description: 'Setting ambitious goals using Objectives and Key Results.', content: 'Assignment: Set your quarterly OKRs (3-5 goals max).', order: 8, duration_minutes: 25, module_type: 'article', skills: ['Goal Setting'] },
    { title: 'Lesson 9: Decision-Making Under Uncertainty', description: 'Overcoming analysis paralysis using the 70% decision rule.', content: 'Assignment: Make one big decision using only 70% information.', order: 9, duration_minutes: 20, module_type: 'article', skills: ['Decision Making', 'Risk Management'] },
    { title: 'Lesson 10: Priority Audit: Removing the Anchors', description: 'Identifying and sunsetting zombie projects or low-ROI activities.', content: 'Assignment: Eliminate at least 5 time-wasters.', order: 10, duration_minutes: 15, module_type: 'article', skills: ['Prioritization'] },
    { title: 'Lesson 11: Building Your Personal Accountability System', description: 'Weekly review rituals, metrics, and finding accountability partners.', content: 'Assignment: Schedule your first weekly review session.', order: 11, duration_minutes: 20, module_type: 'article', skills: ['Accountability'] },
    { title: 'Final Project: My Business Foundation Document', description: 'A 1,500 to 2,000-word strategic roadmap that typically takes 8 to 12 hours to complete.', content: 'Required Sections: \n1. Executive Summary\n2. The Scatter Problem\n3. Your Solution\n4. Target Customer Profile\n5. 3 Core Business Drivers\n6. Decision-Making Framework\n7. 90-Day Priorities', order: 12, duration_minutes: 600, module_type: 'project', skills: ['Strategic Planning', 'Prioritization', 'Decision Making', 'Business Modeling'] }
  ];
  
  for (const mod of modules) {
    const exists = await db.query.learningModules.findFirst({
       where: eq(schema.learningModules.title, mod.title)
    });
    let moduleId = exists?.id;
    
    if (!moduleId) {
       const inserted = await db.insert(schema.learningModules).values({
           path_id: pathId,
           title: mod.title,
           description: mod.description,
           content: mod.content,
           order: mod.order,
           duration_minutes: mod.duration_minutes,
           module_type: mod.module_type,
           skills_covered: mod.skills
       }).returning({ id: schema.learningModules.id });
       moduleId = inserted[0].id;
       console.log(`Inserted ${mod.title}`);

       // Add a mock adaptive assessment for each module
       if (mod.module_type !== 'project') {
         await db.insert(schema.assessments).values({
            module_id: moduleId,
            title: `Assessment: ${mod.title}`,
            description: `Knowledge check and skill progression for ${mod.title}`,
            passing_score: 70,
            is_adaptive: true,
            questions_data: [
                {
                    id: uuidv4(),
                    type: 'multiple_choice',
                    text: 'What is the primary takeaway from this module?',
                    options: ['A', 'B', 'C', 'D'],
                    correct_answer: 'A',
                    xp_reward: 50
                }
            ]
         });
         console.log(`Added assessment for ${mod.title}`);
       }
    } else {
        console.log(`Module already exists: ${mod.title}`);
    }
  }
  
  console.log('Seed completed successfully.');
  process.exit(0);
}
seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
