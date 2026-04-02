import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const noteSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    authorUserId: requiredObjectId(),
    entityType: {
      type: String,
      enum: ["contact", "lead", "deal", "task"],
      required: true,
    },
    entityId: requiredObjectId(),
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["workspace", "private"],
      default: "workspace",
    },
    mentions: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

noteSchema.index({ workspaceId: 1, entityType: 1, entityId: 1, createdAt: -1 });
noteSchema.index({ workspaceId: 1, authorUserId: 1, createdAt: -1 });
noteSchema.index({ workspaceId: 1, mentions: 1 });

export type NoteDocument = InferSchemaType<typeof noteSchema>;
export const NoteModel = model("Note", noteSchema, "notes");

