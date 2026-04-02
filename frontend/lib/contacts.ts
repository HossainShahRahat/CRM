import { apiRequest, buildQueryString } from "./api-client";

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

export const fetchContacts = async (params: {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  company?: string;
}) => {
  const queryString = buildQueryString({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search,
    tag: params.tag,
    company: params.company,
  });
  return apiRequest<ContactsResponse>(`/contacts?${queryString}`);
};

export const fetchContact = async (contactId: string) =>
  apiRequest<ContactRecord>(`/contacts/${contactId}`);

export const createContact = async (payload: ContactFormPayload) =>
  apiRequest<ContactRecord>("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateContact = async (contactId: string, payload: ContactFormPayload) =>
  apiRequest<ContactRecord>(`/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteContact = async (contactId: string) =>
  apiRequest<{ message: string; deletedContactId: string }>(`/contacts/${contactId}`, {
    method: "DELETE",
  });
