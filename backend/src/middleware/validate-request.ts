import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { AppError } from "../core/errors/app-error.js";

export const validateRequest = (schema: ZodSchema) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError("Invalid request payload", 400, {
          issues: result.error.flatten(),
        }),
      );
      return;
    }

    request.body = result.data.body;
    request.params = result.data.params ?? request.params;
    request.query = result.data.query ?? request.query;
    next();
  };
};

