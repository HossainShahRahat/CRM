import { appConfig } from "./app-config";

export type ContactRecord = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  emails: Array<{ value: string; label: string; isPrimary: boolean }>;
  phones: Array<{ value: string; label: string; isPrimary: boolean }>;
  company: {
    name?: string;
    title?: string;
  };
  tags: string[];
  activityTimelineRef: {
    entityType: string;
    entityId: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type ContactsResponse = {
  data: ContactRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ContactFormPayload = {
  firstName: string;
  lastName: string;
  emails: Array<{ value: string; label: string; isPrimary: boolean }>;
  phones: Array<{ value: string; label: string; isPrimary: boolean }>;
  company: {
    name?: string;
    title?: string;
  };
  tags: string[];
};

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("crm_access_token");
};

const createHeaders = () => {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchContacts = async (params: {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  company?: string;
}) => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) searchParams.set("search", params.search);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.company) searchParams.set("company", params.company);

  const response = await fetch(
    `${appConfig.apiBaseUrl}/contacts?${searchParams.toString()}`,
    { headers: createHeaders(), cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  return (await response.json()) as ContactsResponse;
};

export const fetchContact = async (contactId: string) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/contacts/${contactId}`, {
    headers: createHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contact");
  }

  return (await response.json()) as ContactRecord;
};

export const createContact = async (payload: ContactFormPayload) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/contacts`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to create contact");
  }

  return data as ContactRecord;
};

export const updateContact = async (contactId: string, payload: ContactFormPayload) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/contacts/${contactId}`, {
    method: "PATCH",
    headers: createHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to update contact");
  }

  return data as ContactRecord;
};

export const deleteContact = async (contactId: string) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/contacts/${contactId}`, {
    method: "DELETE",
    headers: createHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message ?? "Failed to delete contact");
  }
};
