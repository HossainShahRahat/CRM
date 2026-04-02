import { Router } from "express";

import { getAuthModuleInfo } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.get("/", getAuthModuleInfo);

