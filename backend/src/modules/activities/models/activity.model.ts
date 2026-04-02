import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const relatedEntitySchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["contact", "lead", "deal", "task", "note", "user"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    actorUserId: objectId(),
    activityType: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "commented",
        "email",
        "call",
        "meeting",
        "status_changed",
      ],
      required: true,
    },
    subject: {
      entityType: {
        type: String,
        enum: ["contact", "lead", "deal", "task", "note", "user"],
        required: true,
      },
      entityId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
    relatedEntities: {
      type: [relatedEntitySchema],
      default: [],
    },
    message: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    visibility: {
      type: String,
      enum: ["workspace", "private"],
      default: "workspace",
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

activitySchema.index({
  workspaceId: 1,
  "subject.entityType": 1,
  "subject.entityId": 1,
  createdAt: -1,
});
activitySchema.index({
  workspaceId: 1,
  "relatedEntities.entityType": 1,
  "relatedEntities.entityId": 1,
  createdAt: -1,
});
activitySchema.index({ workspaceId: 1, actorUserId: 1, createdAt: -1 });
activitySchema.index({ workspaceId: 1, activityType: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema>;
export const ActivityModel = model("Activity", activitySchema, "activities");

