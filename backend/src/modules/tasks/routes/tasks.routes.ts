import { Router } from "express";

import { getTasksModuleInfo } from "../controllers/tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.get("/", getTasksModuleInfo);

