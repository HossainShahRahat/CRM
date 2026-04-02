import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { authorizeRoles } from "../../../middleware/authorize-roles.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { updateSettingsSchema } from "../dto/settings.validation.js";

export const settingsRouter = Router();

settingsRouter.use(authGuard);
settingsRouter.get("/", getSettings);
settingsRouter.put("/", authorizeRoles("admin", "manager"), validateRequest(updateSettingsSchema), updateSettings);

