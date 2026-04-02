import { Types } from "mongoose";

import { ActivityModel } from "../models/activity.model.js";

type ListActivitiesInput = {
  workspaceId: string;
  page: number;
  limit: number;
  entityType?: "contact" | "lead" | "deal" | "task" | "note" | "user";
  entityId?: string;
};

export const activitiesService = {
  getActivities: async (input: ListActivitiesInput) => {
    const query: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(input.workspaceId),
    };

    if (input.entityType && input.entityId) {
      query.$or = [
        {
          "subject.entityType": input.entityType,
          "subject.entityId": new Types.ObjectId(input.entityId),
        },
        {
          relatedEntities: {
            $elemMatch: {
              entityType: input.entityType,
              entityId: new Types.ObjectId(input.entityId),
            },
          },
        },
      ];
    }

    const skip = (input.page - 1) * input.limit;
    const [activities, total] = await Promise.all([
      ActivityModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(input.limit).lean(),
      ActivityModel.countDocuments(query),
    ]);

    return {
      data: activities.map((activity) => ({
        id: activity._id.toString(),
        activityType: activity.activityType,
        message: activity.message ?? "",
        subject: {
          entityType: activity.subject?.entityType ?? "task",
          entityId: activity.subject?.entityId?.toString() ?? "",
        },
        relatedEntities: (activity.relatedEntities ?? []).map((entity) => ({
          entityType: entity.entityType,
          entityId: entity.entityId.toString(),
        })),
        createdAt: activity.createdAt,
      })),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit) || 1,
      },
    };
  },
};
