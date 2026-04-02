import { createApp } from "./app.js";
import { connectToDatabase } from "./core/database/mongodb.js";
import { env } from "./core/config/env.js";
import { logger } from "./utils/logger.js";

const bootstrap = async () => {
  await connectToDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`${env.APP_NAME} listening on port ${env.PORT}`);
  });
};

bootstrap().catch((error: unknown) => {
  logger.error("Failed to bootstrap backend", error);
  process.exit(1);
});

