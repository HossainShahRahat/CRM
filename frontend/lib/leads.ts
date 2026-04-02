import { apiRequest, buildQueryString } from "./api-client";

export type UserOption = {
  id: string;
  displayName: string;
  role: string;
  email: string;
};

export type LeadRecord = {
  id: string;
  assignedUserId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "lost";
  score: number;
  scoreBand: "cold" | "warm" | "hot";
  estimatedValue: number;
  interestedIn: string[];
  campaign: string;
  tags: string[];
  lastContactedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadDetails = {
  lead: LeadRecord;
  notes: Array<{ id: string; body: string; isPinned: boolean; createdAt?: string }>;
  followUps: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }>;
};

export const fetchLeads = (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const queryString = buildQueryString(params);

  return apiRequest<{ data: LeadRecord[]; meta: { page: number; totalPages: number; total: number } }>(
    `/leads?${queryString}`,
  );
};

export const fetchLeadDetails = (leadId: string) => apiRequest<LeadDetails>(`/leads/${leadId}`);
export const fetchUserOptions = () => apiRequest<UserOption[]>("/users/options");
export const createLead = (payload: Record<string, unknown>) =>
  apiRequest<LeadRecord>("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateLeadStatus = (leadId: string, status: string) =>
  apiRequest<LeadRecord>(`/leads/${leadId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const assignLead = (leadId: string, assignedUserId: string) =>
  apiRequest<LeadRecord>(`/leads/${leadId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedUserId }),
  });
export const addLeadNote = (leadId: string, body: string) =>
  apiRequest(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
export const addLeadFollowUp = (
  leadId: string,
  payload: { title: string; description?: string; dueDate: string; priority: string; assignedUserId: string },
) =>
  apiRequest(`/leads/${leadId}/follow-ups`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
