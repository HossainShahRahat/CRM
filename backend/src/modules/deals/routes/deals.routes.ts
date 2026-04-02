import { Router } from "express";

import { getDealsModuleInfo } from "../controllers/deals.controller.js";

export const dealsRouter = Router();

dealsRouter.get("/", getDealsModuleInfo);

