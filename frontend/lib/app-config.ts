const defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

const resolveApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return defaultApiBaseUrl;
  }

  try {
    const configuredUrl = new URL(defaultApiBaseUrl);
    const pageHostname = window.location.hostname;
    const configuredHostname = configuredUrl.hostname;
    const usesLoopbackHost =
      configuredHostname === "localhost" || configuredHostname === "127.0.0.1";
    const pageUsesLoopbackHost = pageHostname === "localhost" || pageHostname === "127.0.0.1";

    // When the app is opened through a LAN/public IP, keep the configured port/path
    // but swap out localhost so the browser doesn't block the request as loopback-only.
    if (usesLoopbackHost && !pageUsesLoopbackHost) {
      configuredUrl.hostname = pageHostname;
      return configuredUrl.toString().replace(/\/$/, "");
    }
  } catch {
    return defaultApiBaseUrl;
  }

  return defaultApiBaseUrl;
};

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "CRM Dashboard",
  apiBaseUrl: resolveApiBaseUrl(),
};
