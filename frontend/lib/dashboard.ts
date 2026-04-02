import { appConfig } from "./app-config";

export type DashboardOverview = {
  metrics: {
    totalLeads: number;
    conversionRate: number;
    dealsWon: number;
    dealsLost: number;
    revenueForecast: number;
  };
  charts: {
    revenueForecast: Array<{
      month: string;
      forecast: number;
    }>;
    leadSources: Array<{
      name: string;
      value: number;
    }>;
    pipeline: Array<{
      stage: string;
      value: number;
      count: number;
    }>;
  };
};

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("crm_access_token");
};

export const fetchDashboardOverview = async () => {
  const token = getAccessToken();
  const response = await fetch(`${appConfig.apiBaseUrl}/dashboard/overview`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to fetch dashboard data");
  }

  return data as DashboardOverview;
};

