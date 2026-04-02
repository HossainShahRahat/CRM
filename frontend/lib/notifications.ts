import { appConfig } from "./app-config";

export type NotificationRecord = {
  id: string;
  type: "lead_assigned" | "task_due" | "deal_updated";
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  relatedEntity: {
    entityType: "lead" | "task" | "deal";
    entityId: string;
  };
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

export const fetchNotifications = async () => {
  const response = await fetch(`${appConfig.apiBaseUrl}/notifications`, {
    headers: createHeaders(),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to fetch notifications");
  }

  return data as { data: NotificationRecord[]; unreadCount: number };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: createHeaders(),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to mark notification as read");
  }

  return data as NotificationRecord;
};

