import { MongoClient, type Db } from "mongodb";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../../utils/logger.js";

let client: MongoClient | null = null;
let database: Db | null = null;
let mongooseConnected = false;

export const connectToDatabase = async () => {
  if (database) {
    return database;
  }

  client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    retryWrites: true,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  database = client.db(env.MONGODB_DB_NAME);
  if (!mongooseConnected) {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
      minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    });
    mongooseConnected = true;
  }

  logger.info(`Connected to MongoDB database: ${env.MONGODB_DB_NAME}`);

  return database;
};

export const getDatabase = () => {
  if (!database) {
    throw new Error("Database connection has not been initialized");
  }

  return database;
};
