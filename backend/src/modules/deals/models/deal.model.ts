import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const dealSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    ownerId: requiredObjectId(),
    primaryContactId: objectId(),
    contactIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    leadId: objectId(),
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stage: {
      type: String,
      enum: [
        "qualification",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      default: "qualification",
    },
    status: {
      type: String,
      enum: ["open", "won", "lost", "archived"],
      default: "open",
    },
    pipeline: {
      type: String,
      default: "default",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      trim: true,
      uppercase: true,
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    expectedCloseDate: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    lossReason: {
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
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

dealSchema.index({ workspaceId: 1, ownerId: 1, status: 1, stage: 1 });
dealSchema.index({ workspaceId: 1, primaryContactId: 1 });
dealSchema.index({ workspaceId: 1, contactIds: 1 });
dealSchema.index({ workspaceId: 1, expectedCloseDate: 1, status: 1 });
dealSchema.index({ workspaceId: 1, pipeline: 1, stage: 1 });

export type DealDocument = InferSchemaType<typeof dealSchema>;
export const DealModel = model("Deal", dealSchema, "deals");

