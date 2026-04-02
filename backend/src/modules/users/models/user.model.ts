import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  objectId,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const userSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "sales_rep", "support"],
      required: true,
      default: "sales_rep",
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
    managerId: objectId(),
    createdBy: objectId(),
    updatedBy: objectId(),
  },
  createBaseSchemaOptions(),
);

userSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
userSchema.index({ workspaceId: 1, role: 1, status: 1 });
userSchema.index({ workspaceId: 1, managerId: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema, "users");

