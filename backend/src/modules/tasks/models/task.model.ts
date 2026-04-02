import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const taskSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    assignedUserId: requiredObjectId(),
    relatedTo: {
      entityType: {
        type: String,
        enum: ["contact", "lead", "deal", "activity", "note"],
      },
      entityId: objectId(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "cancelled"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    reminderAt: {
      type: Date,
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

taskSchema.index({ workspaceId: 1, assignedUserId: 1, status: 1, dueDate: 1 });
taskSchema.index({ workspaceId: 1, "relatedTo.entityType": 1, "relatedTo.entityId": 1 });
taskSchema.index({ workspaceId: 1, priority: 1, dueDate: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const TaskModel = model("Task", taskSchema, "tasks");

