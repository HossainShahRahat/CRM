import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import {
  login,
  logout,
  me,
  register,
} from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../dto/auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), register);
authRouter.post("/login", validateRequest(loginSchema), login);
authRouter.post("/logout", authGuard, logout);
authRouter.get("/me", authGuard, me);
