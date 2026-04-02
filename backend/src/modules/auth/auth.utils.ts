import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

import { env } from "../../core/config/env.js";
import type { AppRole, JwtPayload } from "./auth.types.js";

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

export const comparePassword = async (
  password: string,
  passwordHash: string,
) => bcrypt.compare(password, passwordHash);

export const createAccessToken = (payload: {
  userId: string;
  workspaceId: string;
  role: AppRole;
}) => {
  const tokenId = new Types.ObjectId().toString();
  const signOptions: SignOptions = {
    subject: payload.userId,
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      workspaceId: payload.workspaceId,
      role: payload.role,
      tokenId,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    signOptions,
  );

  const decoded = jwt.decode(token, { complete: true });
  const exp =
    typeof decoded === "object" &&
    decoded &&
    typeof decoded.payload === "object" &&
    decoded.payload &&
    typeof decoded.payload.exp === "number"
      ? new Date(decoded.payload.exp * 1000)
      : null;

  return {
    token,
    tokenId,
    expiresAt: exp,
  };
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, {
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
  }) as JwtPayload;
