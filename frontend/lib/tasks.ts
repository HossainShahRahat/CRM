import { appConfig } from "./app-config";

export type TaskRecord = {
  id: string;
  assignedUserId: string;
  taskType: "call" | "meeting" | "follow_up";
  title: string;
  description: string;
  relatedTo: {
    entityType: "contact" | "lead" | "deal";
    entityId: string;
  };
  dueDate: string | null;
  reminderAt: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  completedAt: string | null;
};

export type ActivityRecord = {
  id: string;
  activityType: string;
  message: string;
  subject: {
    entityType: string;
    entityId: string;
  };
  relatedEntities: Array<{
    entityType: string;
    entityId: string;
  }>;
  createdAt?: string;
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

export const fetchTasks = () =>
  request<{ data: TaskRecord[]; reminders: Array<{ id: string; title: string; reminderAt: string }> }>(
    "/tasks?page=1&limit=100",
  );

export const createTask = (payload: Record<string, unknown>) =>
  request<TaskRecord>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTaskStatus = (taskId: string, status: string) =>
  request<TaskRecord>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const fetchActivities = () =>
  request<{ data: ActivityRecord[] }>("/activities?page=1&limit=20");
