import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { tasksService } from "../services/tasks.service.js";

export const createTask = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const task = await tasksService.createTask(
      request.auth!.workspaceId,
      request.auth!.id,
      request.body,
    );

    response.status(201).json(task);
  },
);

export const updateTask = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const task = await tasksService.updateTask(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.taskId),
      request.body,
    );

    response.status(200).json(task);
  },
);

export const updateTaskStatus = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const task = await tasksService.updateTaskStatus(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.taskId),
      request.body.status,
    );

    response.status(200).json(task);
  },
);

export const getTaskById = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const task = await tasksService.getTaskById(
      request.auth!.workspaceId,
      String(request.params.taskId),
    );

    response.status(200).json(task);
  },
);

export const deleteTask = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await tasksService.deleteTask(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.taskId),
    );

    response.status(200).json(result);
  },
);

export const getTasks = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await tasksService.getTasks({
      workspaceId: request.auth!.workspaceId,
      page: Number(request.query.page),
      limit: Number(request.query.limit),
      status: typeof request.query.status === "string" ? (request.query.status as any) : undefined,
      priority:
        typeof request.query.priority === "string" ? (request.query.priority as any) : undefined,
      taskType:
        typeof request.query.taskType === "string" ? (request.query.taskType as any) : undefined,
      assignedUserId:
        typeof request.query.assignedUserId === "string"
          ? request.query.assignedUserId
          : undefined,
      dateFrom:
        typeof request.query.dateFrom === "string" ? request.query.dateFrom : undefined,
      dateTo: typeof request.query.dateTo === "string" ? request.query.dateTo : undefined,
    });

    response.status(200).json(result);
  },
);
