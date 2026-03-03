
import { z } from 'zod';

/**
 * Base schema for all agent tools
 */
export const ToolBaseSchema = z.object({
  id: z.string().uuid().optional(),
  requiresApproval: z.boolean().default(true),
});

/**
 * Schema for sendEmail tool
 */
export const SendEmailSchema = ToolBaseSchema.extend({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

/**
 * Schema for scheduleMeeting tool
 */
export const ScheduleMeetingSchema = ToolBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attendees: z.array(z.string().email()),
  location: z.string().optional(),
});

/**
 * Schema for createProjectTask tool
 */
export const CreateProjectTaskSchema = ToolBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional(),
  assignedAgentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type ToolType = 'sendEmail' | 'scheduleMeeting' | 'createProjectTask';

/**
 * Registry of all available tools
 */
export const ToolRegistry = {
  sendEmail: {
    name: 'sendEmail',
    description: 'Send a professional email via Resend',
    schema: SendEmailSchema,
  },
  scheduleMeeting: {
    name: 'scheduleMeeting',
    description: 'Schedule a meeting on Google Calendar',
    schema: ScheduleMeetingSchema,
  },
  createProjectTask: {
    name: 'createProjectTask',
    description: 'Create a new task in the internal project manager',
    schema: CreateProjectTaskSchema,
  },
} as const;
