import dotenv from "dotenv";

dotenv.config();

type Environment = {
  NODE_ENV: string;
  PORT: number;
  APP_NAME: string;
  API_PREFIX: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  MONGODB_MAX_POOL_SIZE: number;
  MONGODB_MIN_POOL_SIZE: number;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  BCRYPT_SALT_ROUNDS: number;
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
  MONGODB_MAX_POOL_SIZE: Number(getEnv("MONGODB_MAX_POOL_SIZE", "20")),
  MONGODB_MIN_POOL_SIZE: Number(getEnv("MONGODB_MIN_POOL_SIZE", "5")),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", "replace-with-access-secret"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_ISSUER: getEnv("JWT_ISSUER", "crm-backend"),
  JWT_AUDIENCE: getEnv("JWT_AUDIENCE", "crm-users"),
  BCRYPT_SALT_ROUNDS: Number(getEnv("BCRYPT_SALT_ROUNDS", "12")),
};
