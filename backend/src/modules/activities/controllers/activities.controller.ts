import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { activitiesService } from "../services/activities.service.js";

export const getActivities = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await activitiesService.getActivities({
      workspaceId: request.auth!.workspaceId,
      page: Number(request.query.page ?? 1),
      limit: Number(request.query.limit ?? 20),
      entityType:
        typeof request.query.entityType === "string"
          ? (request.query.entityType as any)
          : undefined,
      entityId:
        typeof request.query.entityId === "string" ? request.query.entityId : undefined,
    });

    response.status(200).json(result);
  },
);

