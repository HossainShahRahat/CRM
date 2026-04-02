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
  logger.error(
    `Failed to bootstrap backend. Verify MongoDB is running and reachable at ${env.MONGODB_URI}. For local development, start MongoDB locally or run "docker compose up mongodb -d" if Docker is installed.`,
    error,
  );
  process.exit(1);
});
