import { apiRequest } from "./api-client";

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

export const fetchDashboardOverview = async () => {
  return apiRequest<DashboardOverview>("/dashboard/overview");
};
