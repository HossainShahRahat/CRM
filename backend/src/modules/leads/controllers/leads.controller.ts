import type { Request, Response } from "express";

import { leadsService } from "../services/leads.service.js";

export const getLeadsModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(leadsService.getModuleInfo());
};

