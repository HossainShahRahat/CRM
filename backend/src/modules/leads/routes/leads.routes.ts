import { Router } from "express";

import { getLeadsModuleInfo } from "../controllers/leads.controller.js";

export const leadsRouter = Router();

leadsRouter.get("/", getLeadsModuleInfo);

