import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, index, uniqueIndex, uuid, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { learningModules } from './content';

// User Skills table - Tracking individual skill progressions
export const userSkills = pgTable('user_skills', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    skill_name: varchar('skill_name', { length: 255 }).notNull(), // e.g., 'Decision Making', 'Priority Setting'
    current_level: integer('current_level').notNull().default(1),
    current_xp: integer('current_xp').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
    userIdIdx: index('user_skills_user_id_idx').on(table.user_id),
    userSkillUnique: uniqueIndex('user_skills_user_skill_idx').on(table.user_id, table.skill_name),
    chkLevel: check('chk_user_skills_level', sql`current_level >= 1`),
    chkXp: check('chk_user_skills_xp', sql`current_xp >= 0`),
}));

// Assessments table - Holds knowledge check configuration
export const assessments = pgTable('assessments', {
    id: uuid('id').primaryKey().defaultRandom(),
    module_id: uuid('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    questions_data: jsonb('questions_data').$type<any[]>().notNull().default([]), // Array of { id, text, type, options, correct_answer, xp_reward }
    passing_score: integer('passing_score').notNull().default(70),
    is_adaptive: boolean('is_adaptive').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
    moduleIdIdx: index('assessments_module_id_idx').on(table.module_id),
    chkPassingScoreRange: check('chk_learning_passing_score_range', sql`passing_score BETWEEN 0 AND 100`),
}));

// Assessment Submissions table - User's attempt history
export const assessmentSubmissions = pgTable('assessment_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    assessment_id: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'restrict' }),
    score: integer('score').notNull(),
    passed: boolean('passed').notNull(),
    answers_data: jsonb('answers_data').$type<any[]>().notNull().default([]), // Array of user answers
    xp_earned: integer('xp_earned').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userAssessmentIdx: index('assessment_submissions_user_assessment_idx').on(table.user_id, table.assessment_id),
    assessmentIdIdx: index('assessment_submissions_assessment_id_idx').on(table.assessment_id),
    chkScoreRange: check('chk_learning_score_range', sql`score BETWEEN 0 AND 100`),
}));
