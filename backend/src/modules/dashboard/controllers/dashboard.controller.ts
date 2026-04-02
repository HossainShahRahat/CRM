import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { dashboardService } from "../services/dashboard.service.js";

export const getDashboardOverview = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const overview = await dashboardService.getOverview(request.auth!.workspaceId);
    response.status(200).json(overview);
  },
);

