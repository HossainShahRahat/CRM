import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { notificationsService } from "../services/notifications.service.js";

export const getNotifications = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await notificationsService.getNotifications(
      request.auth!.workspaceId,
      request.auth!.id,
    );

    response.status(200).json(result);
  },
);

export const markNotificationAsRead = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const notification = await notificationsService.markAsRead(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.notificationId),
    );

    response.status(200).json(notification);
  },
);

