import { z } from "zod";

const customFieldSchema = z.object({
  entityType: z.enum(["contact", "lead", "deal", "task"]),
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  fieldType: z.enum(["text", "number", "date", "select"]),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(80)).default([]),
});

const pipelineStageSchema = z.object({
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  probability: z.coerce.number().min(0).max(100),
  order: z.coerce.number().int().min(0),
});

const rolePermissionSchema = z.object({
  role: z.enum(["admin", "manager", "sales"]),
  permissions: z.array(z.string().trim().min(1).max(120)),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    customFields: z.array(customFieldSchema).optional(),
    pipelines: z
      .object({
        default: z.object({
          name: z.string().trim().min(1).max(120),
          stages: z.array(pipelineStageSchema).min(1),
        }),
      })
      .optional(),
    rolePermissions: z.array(rolePermissionSchema).optional(),
  }),
});

