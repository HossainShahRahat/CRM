import type { Request, Response } from "express";

import { tasksService } from "../services/tasks.service.js";

export const getTasksModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(tasksService.getModuleInfo());
};

