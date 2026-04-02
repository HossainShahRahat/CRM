import { appConfig } from "./app-config";

export type DealStage = "qualification" | "proposal" | "negotiation" | "won" | "lost";

export type DealRecord = {
  id: string;
  ownerId: string;
  name: string;
  stage: DealStage;
  status: string;
  pipeline: string;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: string | null;
  pipelinePosition: number;
  tags: string[];
};

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("crm_access_token");
};

const createHeaders = () => {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...createHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
};

export const fetchDeals = (params?: { pipeline?: string }) => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", "1");
  searchParams.set("limit", "100");
  if (params?.pipeline) searchParams.set("pipeline", params.pipeline);

  return request<{ data: DealRecord[] }>(`/deals?${searchParams.toString()}`);
};

export const createDeal = (payload: Record<string, unknown>) =>
  request<DealRecord>("/deals", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDealStage = (
  dealId: string,
  payload: { stage: DealStage; pipelinePosition: number },
) =>
  request<DealRecord>(`/deals/${dealId}/stage`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteDeal = (dealId: string) =>
  request<{ message: string }>(`/deals/${dealId}`, {
    method: "DELETE",
  });
