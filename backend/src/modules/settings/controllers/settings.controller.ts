import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { settingsService } from "../services/settings.service.js";

export const getSettings = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const settings = await settingsService.getSettings(
      request.auth!.workspaceId,
      request.auth!.id,
    );

    response.status(200).json(settings);
  },
);

export const updateSettings = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const settings = await settingsService.updateSettings(
      request.auth!.workspaceId,
      request.auth!.id,
      request.body,
    );

    response.status(200).json(settings);
  },
);

