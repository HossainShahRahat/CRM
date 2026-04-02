import { apiRequest } from "./api-client";

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

export const fetchTasks = () =>
  apiRequest<{ data: TaskRecord[]; reminders: Array<{ id: string; title: string; reminderAt: string }> }>(
    "/tasks?page=1&limit=100",
  );

export const createTask = (payload: Record<string, unknown>) =>
  apiRequest<TaskRecord>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTaskStatus = (taskId: string, status: string) =>
  apiRequest<TaskRecord>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const fetchActivities = () =>
  apiRequest<{ data: ActivityRecord[] }>("/activities?page=1&limit=20");
