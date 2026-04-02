import { Schema } from "mongoose";

export const objectId = () => ({
  type: Schema.Types.ObjectId,
});

export const requiredObjectId = () => ({
  type: Schema.Types.ObjectId,
  required: true,
});

export const createBaseSchemaOptions = () => ({
  timestamps: true as const,
  versionKey: false as const,
});
