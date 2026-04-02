import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import {
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(authGuard);
notificationsRouter.get("/", getNotifications);
notificationsRouter.patch("/:notificationId/read", markNotificationAsRead);

