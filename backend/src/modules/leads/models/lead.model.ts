import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const leadSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    assignedUserId: requiredObjectId(),
    contactId: objectId(),
    source: {
      type: String,
      enum: ["website", "referral", "campaign", "manual", "import", "partner"],
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "disqualified", "converted"],
      default: "new",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    estimatedValue: {
      type: Number,
      default: 0,
    },
    interestedIn: {
      type: [String],
      default: [],
    },
    campaign: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    lastContactedAt: {
      type: Date,
    },
    convertedContactId: objectId(),
    convertedDealId: objectId(),
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

leadSchema.index({ workspaceId: 1, assignedUserId: 1, status: 1, createdAt: -1 });
leadSchema.index({ workspaceId: 1, source: 1, status: 1 });
leadSchema.index({ workspaceId: 1, score: -1 });
leadSchema.index({ workspaceId: 1, email: 1 });
leadSchema.index({ workspaceId: 1, tags: 1 });

export type LeadDocument = InferSchemaType<typeof leadSchema>;
export const LeadModel = model("Lead", leadSchema, "leads");

