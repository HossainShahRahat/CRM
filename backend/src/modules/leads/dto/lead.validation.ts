import { z } from "zod";

const objectIdPattern = /^[a-f\d]{24}$/i;

const leadStatusSchema = z.enum(["new", "contacted", "qualified", "lost"]);

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().max(100).default(""),
    email: z.string().email().trim().toLowerCase().optional(),
    phone: z.string().trim().min(5).max(30).optional(),
    companyName: z.string().trim().max(160).optional(),
    source: z.enum(["website", "referral", "campaign", "manual", "import", "partner"]),
    assignedUserId: z.string().regex(objectIdPattern, "Invalid assigned user id"),
    estimatedValue: z.coerce.number().min(0).default(0),
    interestedIn: z.array(z.string().trim().min(1).max(80)).default([]),
    campaign: z.string().trim().max(160).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).default([]),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
  body: z
    .object({
      firstName: z.string().trim().min(1).max(100).optional(),
      lastName: z.string().trim().max(100).optional(),
      email: z.string().email().trim().toLowerCase().optional(),
      phone: z.string().trim().min(5).max(30).optional(),
      companyName: z.string().trim().max(160).optional(),
      source: z
        .enum(["website", "referral", "campaign", "manual", "import", "partner"])
        .optional(),
      estimatedValue: z.coerce.number().min(0).optional(),
      interestedIn: z.array(z.string().trim().min(1).max(80)).optional(),
      campaign: z.string().trim().max(160).optional(),
      tags: z.array(z.string().trim().min(1).max(50)).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
});

export const assignLeadSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
  body: z.object({
    assignedUserId: z.string().regex(objectIdPattern, "Invalid assigned user id"),
  }),
});

export const updateLeadStatusSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
  body: z.object({
    status: leadStatusSchema,
  }),
});

export const addLeadNoteSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
  body: z.object({
    body: z.string().trim().min(1).max(4000),
    isPinned: z.boolean().optional(),
  }),
});

export const addLeadFollowUpSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    dueDate: z.string().datetime(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignedUserId: z.string().regex(objectIdPattern, "Invalid assigned user id"),
  }),
});

export const leadIdParamSchema = z.object({
  params: z.object({
    leadId: z.string().regex(objectIdPattern, "Invalid lead id"),
  }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(120).optional(),
    status: leadStatusSchema.optional(),
    source: z
      .enum(["website", "referral", "campaign", "manual", "import", "partner"])
      .optional(),
    assignedUserId: z.string().regex(objectIdPattern).optional(),
  }),
});
