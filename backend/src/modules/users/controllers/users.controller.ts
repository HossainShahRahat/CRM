import type { Request, Response } from "express";

import { usersService } from "../services/users.service.js";

export const getUsersModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(usersService.getModuleInfo());
};

