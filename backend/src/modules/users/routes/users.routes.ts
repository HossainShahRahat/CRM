import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { authorizeRoles } from "../../../middleware/authorize-roles.js";
import {
  getAdminUsersSummary,
  getProtectedUsersSummary,
  getUsersModuleInfo,
} from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/", getUsersModuleInfo);
usersRouter.get("/protected", authGuard, getProtectedUsersSummary);
usersRouter.get("/admin", authGuard, authorizeRoles("admin"), getAdminUsersSummary);
