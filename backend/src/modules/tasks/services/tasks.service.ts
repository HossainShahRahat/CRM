import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { ActivityModel } from "../../activities/models/activity.model.js";
import { ContactModel } from "../../contacts/models/contact.model.js";
import { DealModel } from "../../deals/models/deal.model.js";
import { LeadModel } from "../../leads/models/lead.model.js";
import { notificationsService } from "../../notifications/services/notifications.service.js";
import { UserModel } from "../../users/models/user.model.js";
import { TaskModel } from "../models/task.model.js";

type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskType = "call" | "meeting" | "follow_up";
type RelatedEntityType = "contact" | "lead" | "deal";

type TaskInput = {
  taskType?: TaskType;
  title?: string;
  description?: string;
  assignedUserId?: string;
  relatedTo?: {
    entityType: RelatedEntityType;
    entityId: string;
  };
  dueDate?: string;
  priority?: TaskPriority;
  reminderAt?: string;
};

type ListTasksInput = {
  workspaceId: string;
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  assignedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
};

const relatedModelMap = {
  contact: ContactModel,
  lead: LeadModel,
  deal: DealModel,
} as const;

const formatTask = (task: any) => ({
  id: task._id.toString(),
  workspaceId: task.workspaceId.toString(),
  assignedUserId: task.assignedUserId.toString(),
  taskType: task.taskType as TaskType,
  title: String(task.title),
  description: task.description ? String(task.description) : "",
  relatedTo: {
    entityType: task.relatedTo?.entityType as RelatedEntityType,
    entityId: task.relatedTo?.entityId?.toString() ?? "",
  },
  dueDate: task.dueDate ?? null,
  reminderAt: task.reminderAt ?? null,
  priority: task.priority as TaskPriority,
  status: task.status as TaskStatus,
  completedAt: task.completedAt ?? null,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const getTaskRelation = (task: any): { entityType: RelatedEntityType; entityId: string } => {
  if (!task.relatedTo?.entityType || !task.relatedTo?.entityId) {
    throw new AppError("Task relation is missing", 500);
  }

  return {
    entityType: task.relatedTo.entityType as RelatedEntityType,
    entityId: task.relatedTo.entityId.toString(),
  };
};

const ensureUser = async (workspaceId: string, userId: string) => {
  const user = await UserModel.findOne({
    _id: new Types.ObjectId(userId),
    workspaceId: new Types.ObjectId(workspaceId),
    status: "active",
  })
    .select("_id displayName")
    .lean();

  if (!user) {
    throw new AppError("Assigned user was not found in this workspace", 400);
  }
};

const ensureRelatedEntity = async (
  workspaceId: string,
  relatedTo: { entityType: RelatedEntityType; entityId: string },
) => {
  const model = relatedModelMap[relatedTo.entityType];
  const exists = await model.exists({
    _id: new Types.ObjectId(relatedTo.entityId),
    workspaceId: new Types.ObjectId(workspaceId),
  });

  if (!exists) {
    throw new AppError("Related CRM record was not found", 400);
  }
};

const createTaskActivity = async (input: {
  workspaceId: string;
  actorUserId: string;
  taskId: string;
  taskType: TaskType;
  relatedTo: { entityType: RelatedEntityType; entityId: string };
  message: string;
  activityType?: "created" | "updated" | "status_changed" | "call" | "meeting";
  metadata?: Record<string, unknown>;
}) => {
  const activityType =
    input.activityType ??
    (input.taskType === "call"
      ? "call"
      : input.taskType === "meeting"
        ? "meeting"
        : "created");

  await ActivityModel.create({
    workspaceId: new Types.ObjectId(input.workspaceId),
    actorUserId: new Types.ObjectId(input.actorUserId),
    activityType,
    subject: {
      entityType: "task",
      entityId: new Types.ObjectId(input.taskId),
    },
    relatedEntities: [
      {
        entityType: input.relatedTo.entityType,
        entityId: new Types.ObjectId(input.relatedTo.entityId),
      },
    ],
    message: input.message,
    metadata: input.metadata ?? {},
    createdBy: new Types.ObjectId(input.actorUserId),
    updatedBy: new Types.ObjectId(input.actorUserId),
  });
};

export const tasksService = {
  createTask: async (workspaceId: string, userId: string, input: TaskInput) => {
    if (
      !input.taskType ||
      !input.title ||
      !input.assignedUserId ||
      !input.relatedTo ||
      !input.dueDate
    ) {
      throw new AppError("Missing required task fields", 400);
    }

    await ensureUser(workspaceId, input.assignedUserId);
    await ensureRelatedEntity(workspaceId, input.relatedTo);

    const task = await TaskModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      assignedUserId: new Types.ObjectId(input.assignedUserId),
      taskType: input.taskType,
      relatedTo: {
        entityType: input.relatedTo.entityType,
        entityId: new Types.ObjectId(input.relatedTo.entityId),
      },
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      dueDate: new Date(input.dueDate),
      priority: input.priority ?? "medium",
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    const relation = getTaskRelation(task);
    await createTaskActivity({
      workspaceId,
      actorUserId: userId,
      taskId: task._id.toString(),
      taskType: task.taskType,
      relatedTo: relation,
      message: `Created ${task.taskType.replace("_", " ")} task: ${task.title}`,
    });

    await notificationsService.createNotification({
      workspaceId,
      recipientUserId: input.assignedUserId,
      type: "task_due",
      title: "Task due scheduled",
      message: `${task.title} is due on ${task.dueDate?.toISOString() ?? "the scheduled date"}`,
      relatedEntity: {
        entityType: "task",
        entityId: task._id.toString(),
      },
      metadata: {
        dueDate: task.dueDate,
        reminderAt: task.reminderAt,
      },
      createdBy: userId,
    });

    return formatTask(task);
  },

  updateTask: async (workspaceId: string, userId: string, taskId: string, input: TaskInput) => {
    const task = await TaskModel.findOne({
      _id: new Types.ObjectId(taskId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (input.assignedUserId) {
      await ensureUser(workspaceId, input.assignedUserId);
      task.assignedUserId = new Types.ObjectId(input.assignedUserId);
    }

    if (input.taskType !== undefined) task.taskType = input.taskType;
    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) task.description = input.description.trim();
    if (input.dueDate !== undefined) task.dueDate = new Date(input.dueDate);
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.reminderAt !== undefined) {
      task.reminderAt = input.reminderAt ? new Date(input.reminderAt) : undefined;
    }

    task.updatedBy = new Types.ObjectId(userId);
    await task.save();

    const relation = getTaskRelation(task);
    await createTaskActivity({
      workspaceId,
      actorUserId: userId,
      taskId: task._id.toString(),
      taskType: task.taskType,
      relatedTo: relation,
      activityType: "updated",
      message: `Updated task: ${task.title}`,
    });

    await notificationsService.createNotification({
      workspaceId,
      recipientUserId: task.assignedUserId.toString(),
      type: "task_due",
      title: "Task updated",
      message: `${task.title} now has status ${task.status} and is due on ${task.dueDate?.toISOString() ?? "the scheduled date"}`,
      relatedEntity: {
        entityType: "task",
        entityId: task._id.toString(),
      },
      metadata: {
        dueDate: task.dueDate,
        reminderAt: task.reminderAt,
      },
      createdBy: userId,
    });

    return formatTask(task);
  },

  updateTaskStatus: async (
    workspaceId: string,
    userId: string,
    taskId: string,
    status: TaskStatus,
  ) => {
    const task = await TaskModel.findOne({
      _id: new Types.ObjectId(taskId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    task.status = status;
    task.completedAt = status === "completed" ? new Date() : undefined;
    task.updatedBy = new Types.ObjectId(userId);
    await task.save();

    const relation = getTaskRelation(task);
    await createTaskActivity({
      workspaceId,
      actorUserId: userId,
      taskId: task._id.toString(),
      taskType: task.taskType,
      relatedTo: relation,
      activityType: "status_changed",
      message: `Task marked as ${status}`,
      metadata: { status },
    });

    return formatTask(task);
  },

  getTaskById: async (workspaceId: string, taskId: string) => {
    const task = await TaskModel.findOne({
      _id: new Types.ObjectId(taskId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return formatTask(task);
  },

  deleteTask: async (workspaceId: string, userId: string, taskId: string) => {
    const task = await TaskModel.findOneAndDelete({
      _id: new Types.ObjectId(taskId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const relation = getTaskRelation(task);
    await createTaskActivity({
      workspaceId,
      actorUserId: userId,
      taskId,
      taskType: task.taskType,
      relatedTo: relation,
      activityType: "updated",
      message: `Deleted task: ${task.title}`,
    });

    return { message: "Task deleted successfully", deletedTaskId: taskId };
  },

  getTasks: async (input: ListTasksInput) => {
    const query: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(input.workspaceId),
    };

    if (input.status) query.status = input.status;
    if (input.priority) query.priority = input.priority;
    if (input.taskType) query.taskType = input.taskType;
    if (input.assignedUserId) query.assignedUserId = new Types.ObjectId(input.assignedUserId);
    if (input.dateFrom || input.dateTo) {
      query.dueDate = {
        ...(input.dateFrom ? { $gte: new Date(input.dateFrom) } : {}),
        ...(input.dateTo ? { $lte: new Date(input.dateTo) } : {}),
      };
    }

    const skip = (input.page - 1) * input.limit;
    const [tasks, total] = await Promise.all([
      TaskModel.find(query).sort({ dueDate: 1, createdAt: -1 }).skip(skip).limit(input.limit).lean(),
      TaskModel.countDocuments(query),
    ]);

    return {
      data: tasks.map(formatTask),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit) || 1,
      },
      reminders: tasks
        .filter((task) => task.reminderAt && task.status !== "completed")
        .map((task) => ({
          id: task._id.toString(),
          title: task.title,
          reminderAt: task.reminderAt,
        })),
    };
  },
};
