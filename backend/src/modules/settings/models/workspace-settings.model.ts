import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const customFieldSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["contact", "lead", "deal", "task"],
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: ["text", "number", "date", "select"],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const pipelineStageSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const rolePermissionSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "manager", "sales"],
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const workspaceSettingsSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    pipelines: {
      default: {
        name: {
          type: String,
          default: "Default pipeline",
        },
        stages: {
          type: [pipelineStageSchema],
          default: [
            { key: "qualification", label: "Qualification", probability: 20, order: 0 },
            { key: "proposal", label: "Proposal", probability: 50, order: 1 },
            { key: "negotiation", label: "Negotiation", probability: 75, order: 2 },
            { key: "won", label: "Won", probability: 100, order: 3 },
            { key: "lost", label: "Lost", probability: 0, order: 4 },
          ],
        },
      },
    },
    rolePermissions: {
      type: [rolePermissionSchema],
      default: [
        { role: "admin", permissions: ["*"] },
        {
          role: "manager",
          permissions: [
            "dashboard.read",
            "contacts.read",
            "contacts.write",
            "leads.read",
            "leads.write",
            "deals.read",
            "deals.write",
            "tasks.read",
            "tasks.write",
            "settings.read",
          ],
        },
        {
          role: "sales",
          permissions: [
            "dashboard.read",
            "contacts.read",
            "contacts.write",
            "leads.read",
            "leads.write",
            "deals.read",
            "deals.write",
            "tasks.read",
            "tasks.write",
          ],
        },
      ],
    },
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

workspaceSettingsSchema.index({ workspaceId: 1 }, { unique: true });

export type WorkspaceSettingsDocument = InferSchemaType<typeof workspaceSettingsSchema>;
export const WorkspaceSettingsModel = model(
  "WorkspaceSettings",
  workspaceSettingsSchema,
  "workspace_settings",
);

