import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';
import { learningModules } from './content';

// User Skills table - Tracking individual skill progressions
export const userSkills = pgTable('user_skills', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    skill_name: varchar('skill_name', { length: 255 }).notNull(), // e.g., 'Decision Making', 'Priority Setting'
    current_level: integer('current_level').notNull().default(1),
    current_xp: integer('current_xp').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('user_skills_user_id_idx').on(table.user_id),
    userSkillUnique: uniqueIndex('user_skills_user_skill_idx').on(table.user_id, table.skill_name),
}));

// Assessments table - Holds knowledge check configuration
export const assessments = pgTable('assessments', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    module_id: text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    questions_data: jsonb('questions_data').notNull().default('[]'), // Array of { id, text, type, options, correct_answer, xp_reward }
    passing_score: integer('passing_score').notNull().default(70),
    is_adaptive: boolean('is_adaptive').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    moduleIdIdx: index('assessments_module_id_idx').on(table.module_id),
}));

// Assessment Submissions table - User's attempt history
export const assessmentSubmissions = pgTable('assessment_submissions', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    assessment_id: text('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    passed: boolean('passed').notNull(),
    answers_data: jsonb('answers_data').notNull().default('{}'), // Map of question_id -> user answer
    xp_earned: integer('xp_earned').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('assessment_submissions_user_id_idx').on(table.user_id),
    assessmentIdIdx: index('assessment_submissions_assessment_id_idx').on(table.assessment_id),
}));
