import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { getActivities } from "../controllers/activities.controller.js";

export const activitiesRouter = Router();

activitiesRouter.use(authGuard);
activitiesRouter.get("/", getActivities);
