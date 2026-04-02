import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { NotificationModel } from "../models/notification.model.js";

type CreateNotificationInput = {
  workspaceId: string;
  recipientUserId: string;
  type: "lead_assigned" | "task_due" | "deal_updated";
  title: string;
  message: string;
  relatedEntity: {
    entityType: "lead" | "task" | "deal";
    entityId: string;
  };
  metadata?: Record<string, unknown>;
  createdBy?: string;
};

const formatNotification = (notification: any) => ({
  id: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  isRead: Boolean(notification.isRead),
  readAt: notification.readAt ?? null,
  relatedEntity: {
    entityType: notification.relatedEntity.entityType,
    entityId: notification.relatedEntity.entityId.toString(),
  },
  createdAt: notification.createdAt,
});

export const notificationsService = {
  createNotification: async (input: CreateNotificationInput) => {
    const notification = await NotificationModel.create({
      workspaceId: new Types.ObjectId(input.workspaceId),
      recipientUserId: new Types.ObjectId(input.recipientUserId),
      type: input.type,
      title: input.title.trim(),
      message: input.message.trim(),
      relatedEntity: {
        entityType: input.relatedEntity.entityType,
        entityId: new Types.ObjectId(input.relatedEntity.entityId),
      },
      metadata: input.metadata ?? {},
      createdBy: input.createdBy ? new Types.ObjectId(input.createdBy) : undefined,
      updatedBy: input.createdBy ? new Types.ObjectId(input.createdBy) : undefined,
    });

    return formatNotification(notification);
  },

  getNotifications: async (workspaceId: string, recipientUserId: string) => {
    const notifications = await NotificationModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
      recipientUserId: new Types.ObjectId(recipientUserId),
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = notifications.reduce(
      (count, item) => count + (item.isRead ? 0 : 1),
      0,
    );

    return {
      data: notifications.map(formatNotification),
      unreadCount,
    };
  },

  markAsRead: async (workspaceId: string, recipientUserId: string, notificationId: string) => {
    const notification = await NotificationModel.findOne({
      _id: new Types.ObjectId(notificationId),
      workspaceId: new Types.ObjectId(workspaceId),
      recipientUserId: new Types.ObjectId(recipientUserId),
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return formatNotification(notification);
  },
};

