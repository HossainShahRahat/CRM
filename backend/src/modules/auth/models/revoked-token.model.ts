import { model, Schema, type InferSchemaType } from "mongoose";

import {
  createBaseSchemaOptions,
  requiredObjectId,
} from "../../../core/database/base-schema.js";

const revokedTokenSchema = new Schema(
  {
    workspaceId: requiredObjectId(),
    userId: requiredObjectId(),
    tokenId: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  createBaseSchemaOptions(),
);

revokedTokenSchema.index({ tokenId: 1 }, { unique: true });
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
revokedTokenSchema.index({ workspaceId: 1, userId: 1, expiresAt: -1 });

export type RevokedTokenDocument = InferSchemaType<typeof revokedTokenSchema>;
export const RevokedTokenModel = model(
  "RevokedToken",
  revokedTokenSchema,
  "revoked_tokens",
);

