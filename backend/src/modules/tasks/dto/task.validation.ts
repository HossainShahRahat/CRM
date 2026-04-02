import { z } from "zod";

const objectIdPattern = /^[a-f\d]{24}$/i;

const taskTypeSchema = z.enum(["call", "meeting", "follow_up"]);
const taskStatusSchema = z.enum(["todo", "in_progress", "completed", "cancelled"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const createTaskSchema = z.object({
  body: z.object({
    taskType: taskTypeSchema,
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    assignedUserId: z.string().regex(objectIdPattern, "Invalid assigned user id"),
    relatedTo: z.object({
      entityType: z.enum(["contact", "lead", "deal"]),
      entityId: z.string().regex(objectIdPattern, "Invalid related entity id"),
    }),
    dueDate: z.string().datetime(),
    priority: taskPrioritySchema.default("medium"),
    reminderAt: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid task id"),
  }),
  body: z
    .object({
      taskType: taskTypeSchema.optional(),
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(2000).optional(),
      assignedUserId: z.string().regex(objectIdPattern).optional(),
      dueDate: z.string().datetime().optional(),
      priority: taskPrioritySchema.optional(),
      reminderAt: z.string().datetime().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid task id"),
  }),
  body: z.object({
    status: taskStatusSchema,
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    taskType: taskTypeSchema.optional(),
    assignedUserId: z.string().regex(objectIdPattern).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid task id"),
  }),
});
