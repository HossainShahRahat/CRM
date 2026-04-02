import { z } from "zod";

const objectIdPattern = /^[a-f\d]{24}$/i;

const emailEntrySchema = z.object({
  value: z.string().email().trim().toLowerCase(),
  label: z.string().trim().min(1).max(40).default("work"),
  isPrimary: z.boolean().default(false),
});

const phoneEntrySchema = z.object({
  value: z.string().trim().min(5).max(30),
  label: z.string().trim().min(1).max(40).default("mobile"),
  isPrimary: z.boolean().default(false),
});

const contactBodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).default(""),
  company: z
    .object({
      name: z.string().trim().max(160).optional(),
      title: z.string().trim().max(160).optional(),
    })
    .default({}),
  emails: z.array(emailEntrySchema).min(1, "At least one email is required"),
  phones: z.array(phoneEntrySchema).min(1, "At least one phone is required"),
  tags: z.array(z.string().trim().min(1).max(50)).default([]),
});

export const createContactSchema = z.object({
  body: contactBodySchema,
});

export const updateContactSchema = z.object({
  params: z.object({
    contactId: z.string().regex(objectIdPattern, "Invalid contact id"),
  }),
  body: contactBodySchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required",
  ),
});

export const listContactsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(120).optional(),
    tag: z.string().trim().max(50).optional(),
    company: z.string().trim().max(160).optional(),
  }),
});

export const contactIdParamSchema = z.object({
  params: z.object({
    contactId: z.string().regex(objectIdPattern, "Invalid contact id"),
  }),
});
