import { apiRequest, buildQueryString } from "./api-client";

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

export const fetchDeals = (params?: { pipeline?: string }) => {
  const queryString = buildQueryString({
    page: 1,
    limit: 100,
    pipeline: params?.pipeline,
  });

  return apiRequest<{ data: DealRecord[] }>(`/deals?${queryString}`);
};

export const createDeal = (payload: Record<string, unknown>) =>
  apiRequest<DealRecord>("/deals", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDealStage = (
  dealId: string,
  payload: { stage: DealStage; pipelinePosition: number },
) =>
  apiRequest<DealRecord>(`/deals/${dealId}/stage`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteDeal = (dealId: string) =>
  apiRequest<{ message: string }>(`/deals/${dealId}`, {
    method: "DELETE",
  });
