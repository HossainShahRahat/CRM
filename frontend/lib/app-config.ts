export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "CRM Dashboard",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1",
};

