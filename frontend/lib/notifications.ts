import { apiRequest } from "./api-client";

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

export const fetchNotifications = async () => {
  return apiRequest<{ data: NotificationRecord[]; unreadCount: number }>("/notifications");
};

export const markNotificationAsRead = async (notificationId: string) => {
  return apiRequest<NotificationRecord>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};
