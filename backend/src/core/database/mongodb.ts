import { MongoClient, type Db } from "mongodb";

import { env } from "../config/env.js";
import { logger } from "../../utils/logger.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export const connectToDatabase = async () => {
  if (database) {
    return database;
  }

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  database = client.db(env.MONGODB_DB_NAME);

  logger.info(`Connected to MongoDB database: ${env.MONGODB_DB_NAME}`);

  return database;
};

export const getDatabase = () => {
  if (!database) {
    throw new Error("Database connection has not been initialized");
  }

  return database;
};

