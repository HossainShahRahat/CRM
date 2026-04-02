import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { usersService } from "../services/users.service.js";

export const getUsersModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(usersService.getModuleInfo());
};

export const getProtectedUsersSummary = (
  _request: AuthenticatedRequest,
  response: Response,
) => {
  response.status(200).json(usersService.getProtectedSummary());
};

export const getAdminUsersSummary = (
  _request: AuthenticatedRequest,
  response: Response,
) => {
  response.status(200).json(usersService.getAdminSummary());
};
