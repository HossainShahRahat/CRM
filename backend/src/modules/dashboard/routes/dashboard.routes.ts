import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { getDashboardOverview } from "../controllers/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(authGuard);
dashboardRouter.get("/overview", getDashboardOverview);

