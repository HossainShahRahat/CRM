import type { Request, Response } from "express";

import { dealsService } from "../services/deals.service.js";

export const getDealsModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(dealsService.getModuleInfo());
};

