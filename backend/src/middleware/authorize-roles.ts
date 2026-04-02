import type { NextFunction, Response } from "express";

import { AppError } from "../core/errors/app-error.js";
import type { AppRole } from "../modules/auth/auth.types.js";
import type { AuthenticatedRequest } from "./auth-guard.js";

export const authorizeRoles = (...allowedRoles: AppRole[]) => {
  return (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ) => {
    if (!request.auth) {
      next(new AppError("Unauthorized access", 401));
      return;
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
};

