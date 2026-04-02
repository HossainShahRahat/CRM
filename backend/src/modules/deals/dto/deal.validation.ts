import { z } from "zod";

const objectIdPattern = /^[a-f\d]{24}$/i;

const dealStageSchema = z.enum([
  "qualification",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const createDealSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200),
    amount: z.coerce.number().min(0),
    stage: dealStageSchema.default("qualification"),
    expectedCloseDate: z.string().datetime(),
    ownerId: z.string().regex(objectIdPattern, "Invalid owner id"),
    pipeline: z.string().trim().min(1).max(100).default("default"),
    currency: z.string().trim().length(3).default("USD"),
    probability: z.coerce.number().min(0).max(100).default(10),
    primaryContactId: z.string().regex(objectIdPattern).optional(),
    leadId: z.string().regex(objectIdPattern).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).default([]),
  }),
});

export const updateDealSchema = z.object({
  params: z.object({
    dealId: z.string().regex(objectIdPattern, "Invalid deal id"),
  }),
  body: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),
      amount: z.coerce.number().min(0).optional(),
      expectedCloseDate: z.string().datetime().optional(),
      ownerId: z.string().regex(objectIdPattern).optional(),
      pipeline: z.string().trim().min(1).max(100).optional(),
      currency: z.string().trim().length(3).optional(),
      probability: z.coerce.number().min(0).max(100).optional(),
      primaryContactId: z.string().regex(objectIdPattern).optional(),
      leadId: z.string().regex(objectIdPattern).optional(),
      tags: z.array(z.string().trim().min(1).max(50)).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
});

export const updateDealStageSchema = z.object({
  params: z.object({
    dealId: z.string().regex(objectIdPattern, "Invalid deal id"),
  }),
  body: z.object({
    stage: dealStageSchema,
    pipelinePosition: z.coerce.number().int().min(0).optional(),
  }),
});

export const listDealsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    search: z.string().trim().max(120).optional(),
    stage: dealStageSchema.optional(),
    pipeline: z.string().trim().max(100).optional(),
    ownerId: z.string().regex(objectIdPattern).optional(),
  }),
});

export const dealIdParamSchema = z.object({
  params: z.object({
    dealId: z.string().regex(objectIdPattern, "Invalid deal id"),
  }),
});
