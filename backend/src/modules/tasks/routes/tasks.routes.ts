import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import {
  createTaskSchema,
  listTasksSchema,
  taskIdParamSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../dto/task.validation.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.use(authGuard);
tasksRouter.get("/", validateRequest(listTasksSchema), getTasks);
tasksRouter.get("/:taskId", validateRequest(taskIdParamSchema), getTaskById);
tasksRouter.post("/", validateRequest(createTaskSchema), createTask);
tasksRouter.patch("/:taskId", validateRequest(updateTaskSchema), updateTask);
tasksRouter.patch("/:taskId/status", validateRequest(updateTaskStatusSchema), updateTaskStatus);
tasksRouter.delete("/:taskId", validateRequest(taskIdParamSchema), deleteTask);
