import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

  if (error instanceof jwt.JsonWebTokenError) {
    response.status(401).json({
      message: "Invalid authentication token",
    });
    return;
  }

  if (error instanceof jwt.TokenExpiredError) {
    response.status(401).json({
      message: "Authentication token has expired",
    });
    return;
  }

  response.status(500).json({
    message: "Internal server error",
  });
};
