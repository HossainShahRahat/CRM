import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const emailSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      trim: true,
      default: "work",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const phoneSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      default: "mobile",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const contactSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    ownerId: requiredObjectId(),
    assignedUserIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      name: {
        type: String,
        trim: true,
      },
      title: {
        type: String,
        trim: true,
      },
    },
    emails: {
      type: [emailSchema],
      default: [],
    },
    phones: {
      type: [phoneSchema],
      default: [],
    },
    activityTimelineRef: {
      entityType: {
        type: String,
        default: "contact",
      },
      entityId: objectId(),
    },
    source: {
      type: String,
      enum: ["manual", "lead-conversion", "import", "api", "web-form"],
      default: "manual",
    },
    tags: {
      type: [String],
      default: [],
    },
    lifecycleStage: {
      type: String,
      enum: ["prospect", "customer", "former_customer"],
      default: "prospect",
    },
    linkedDealIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    primaryAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

contactSchema.index({ workspaceId: 1, ownerId: 1, createdAt: -1 });
contactSchema.index({ workspaceId: 1, fullName: 1 });
contactSchema.index({ workspaceId: 1, "company.name": 1 });
contactSchema.index({ workspaceId: 1, "emails.value": 1 });
contactSchema.index({ workspaceId: 1, "phones.value": 1 });
contactSchema.index({ workspaceId: 1, tags: 1 });
contactSchema.index({ workspaceId: 1, linkedDealIds: 1 });

export type ContactDocument = InferSchemaType<typeof contactSchema>;
export const ContactModel = model("Contact", contactSchema, "contacts");
