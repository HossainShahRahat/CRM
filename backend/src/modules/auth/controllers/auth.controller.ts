import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { env } from "../../../core/config/env.js";
import { authService } from "../services/auth.service.js";

export const register = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.register(request.body);
  response.status(201).json(result);
});

export const login = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body);
  response.status(200).json(result);
});

export const logout = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const decoded = jwt.decode(request.accessToken ?? "", { complete: true });
    const exp =
      typeof decoded === "object" &&
      decoded &&
      typeof decoded.payload === "object" &&
      decoded.payload &&
      typeof decoded.payload.exp === "number"
        ? new Date(decoded.payload.exp * 1000)
        : null;

    const result = await authService.logout({
      userId: request.auth!.id,
      workspaceId: request.auth!.workspaceId,
      tokenId: request.accessTokenId!,
      expiresAt: exp,
    });

    response.status(200).json(result);
  },
);

export const me = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const user = await authService.getCurrentUser(
      request.auth!.id,
      request.auth!.workspaceId,
    );

    response.status(200).json({
      user,
      tokenPolicy: {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      },
    });
  },
);
