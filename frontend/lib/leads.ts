import { appConfig } from "./app-config";

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

export const fetchLeads = (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  return request<{ data: LeadRecord[]; meta: { page: number; totalPages: number; total: number } }>(
    `/leads?${searchParams.toString()}`,
  );
};

export const fetchLeadDetails = (leadId: string) => request<LeadDetails>(`/leads/${leadId}`);
export const fetchUserOptions = () => request<UserOption[]>("/users/options");
export const createLead = (payload: Record<string, unknown>) =>
  request<LeadRecord>("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateLeadStatus = (leadId: string, status: string) =>
  request<LeadRecord>(`/leads/${leadId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const assignLead = (leadId: string, assignedUserId: string) =>
  request<LeadRecord>(`/leads/${leadId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedUserId }),
  });
export const addLeadNote = (leadId: string, body: string) =>
  request(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
export const addLeadFollowUp = (
  leadId: string,
  payload: { title: string; description?: string; dueDate: string; priority: string; assignedUserId: string },
) =>
  request(`/leads/${leadId}/follow-ups`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

