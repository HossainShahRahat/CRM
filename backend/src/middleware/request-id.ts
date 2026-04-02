import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

export const requestIdMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const requestId = crypto.randomUUID();

  request.headers["x-request-id"] = requestId;
  response.setHeader("x-request-id", requestId);

  next();
};

