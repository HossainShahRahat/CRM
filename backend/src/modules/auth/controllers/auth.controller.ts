import type { Request, Response } from "express";

import { authService } from "../services/auth.service.js";

export const getAuthModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(authService.getModuleInfo());
};

