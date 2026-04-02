import dotenv from "dotenv";

dotenv.config();

type Environment = {
  NODE_ENV: string;
  PORT: number;
  APP_NAME: string;
  API_PREFIX: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env: Environment = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", "5000")),
  APP_NAME: getEnv("APP_NAME", "CRM Backend"),
  API_PREFIX: getEnv("API_PREFIX", "/api/v1"),
  MONGODB_URI: getEnv("MONGODB_URI"),
  MONGODB_DB_NAME: getEnv("MONGODB_DB_NAME", "crm"),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", "replace-with-access-secret"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "replace-with-refresh-secret"),
};

