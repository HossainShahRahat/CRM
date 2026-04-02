import type { NextFunction, Request, Response } from "express";

import { AppError } from "../core/errors/app-error.js";

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  response.status(500).json({
    message: "Internal server error",
  });
};

