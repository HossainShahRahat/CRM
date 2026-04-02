import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const notificationSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    recipientUserId: requiredObjectId(),
    type: {
      type: String,
      enum: ["lead_assigned", "task_due", "deal_updated"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ["lead", "task", "deal"],
        required: true,
      },
      entityId: requiredObjectId(),
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

notificationSchema.index({ workspaceId: 1, recipientUserId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ workspaceId: 1, "relatedEntity.entityType": 1, "relatedEntity.entityId": 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model(
  "Notification",
  notificationSchema,
  "notifications",
);

