import { Router } from "express";

import { getUsersModuleInfo } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/", getUsersModuleInfo);

