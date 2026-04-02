import cors from "cors";
import express from "express";

import { env } from "./core/config/env.js";
import { apiRouter } from "./core/router.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestIdMiddleware } from "./middleware/request-id.js";

export const createApp = () => {
  const app = express();
  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin) || env.NODE_ENV === "development") {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);

  app.get("/", (_request, response) => {
    response.status(200).json({
      service: env.APP_NAME,
      status: "ok",
      health: "/health",
      apiBase: env.API_PREFIX,
    });
  });

  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: env.APP_NAME,
    });
  });

  app.use(env.API_PREFIX, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
