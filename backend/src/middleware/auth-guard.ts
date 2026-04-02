import type { NextFunction, Request, Response } from "express";

import { AppError } from "../core/errors/app-error.js";
import { verifyAccessToken } from "../modules/auth/auth.utils.js";
import { RevokedTokenModel } from "../modules/auth/models/revoked-token.model.js";
import { UserModel } from "../modules/users/models/user.model.js";

export type AuthenticatedUser = {
  id: string;
  workspaceId: string;
  role: "admin" | "manager" | "sales";
};

export type AuthenticatedRequest = Request & {
  auth?: AuthenticatedUser;
  accessToken?: string;
  accessTokenId?: string;
};

const getBearerToken = (request: Request) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AppError("Authorization token is required", 401);
  }

  return authorizationHeader.slice("Bearer ".length).trim();
};

export const authGuard = async (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(request);
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new AppError("Invalid token type", 401);
    }

    const isRevoked = await RevokedTokenModel.exists({ tokenId: payload.tokenId });
    if (isRevoked) {
      throw new AppError("Token has been revoked", 401);
    }

    const user = await UserModel.findOne({
      _id: payload.sub,
      workspaceId: payload.workspaceId,
      status: "active",
    })
      .select("_id workspaceId role")
      .lean();

    if (!user) {
      throw new AppError("Authenticated user was not found", 401);
    }

    request.auth = {
      id: user._id.toString(),
      workspaceId: user.workspaceId.toString(),
      role: user.role,
    };
    request.accessToken = token;
    request.accessTokenId = payload.tokenId;

    next();
  } catch (error) {
    next(
      error instanceof AppError ? error : new AppError("Unauthorized access", 401),
    );
  }
};

