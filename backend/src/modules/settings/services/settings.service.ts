import { Types } from "mongoose";

import { WorkspaceSettingsModel } from "../models/workspace-settings.model.js";
import { UserModel } from "../../users/models/user.model.js";

const defaultPermissionsByRole = {
  admin: ["*"],
  manager: [
    "dashboard.read",
    "contacts.read",
    "contacts.write",
    "leads.read",
    "leads.write",
    "deals.read",
    "deals.write",
    "tasks.read",
    "tasks.write",
    "settings.read",
  ],
  sales: [
    "dashboard.read",
    "contacts.read",
    "contacts.write",
    "leads.read",
    "leads.write",
    "deals.read",
    "deals.write",
    "tasks.read",
    "tasks.write",
  ],
} as const;

const formatSettings = (settings: any) => ({
  id: settings._id.toString(),
  workspaceId: settings.workspaceId.toString(),
  customFields: settings.customFields ?? [],
  pipelines: settings.pipelines,
  rolePermissions: settings.rolePermissions ?? [],
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

const ensureSettings = async (workspaceId: string, userId?: string) => {
  const workspaceObjectId = new Types.ObjectId(workspaceId);

  let settings = await WorkspaceSettingsModel.findOne({
    workspaceId: workspaceObjectId,
  });

  if (!settings) {
    settings = await WorkspaceSettingsModel.create({
      workspaceId: workspaceObjectId,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    });
  }

  return settings;
};

export const settingsService = {
  getSettings: async (workspaceId: string, userId: string) => {
    const settings = await ensureSettings(workspaceId, userId);
    return formatSettings(settings);
  },

  updateSettings: async (
    workspaceId: string,
    userId: string,
    input: {
      customFields?: Array<{
        entityType: "contact" | "lead" | "deal" | "task";
        key: string;
        label: string;
        fieldType: "text" | "number" | "date" | "select";
        required: boolean;
        options: string[];
      }>;
      pipelines?: {
        default: {
          name: string;
          stages: Array<{
            key: string;
            label: string;
            probability: number;
            order: number;
          }>;
        };
      };
      rolePermissions?: Array<{
        role: "admin" | "manager" | "sales";
        permissions: string[];
      }>;
    },
  ) => {
    const settings = await ensureSettings(workspaceId, userId);

    if (input.customFields) {
      settings.set("customFields", input.customFields);
    }

    if (input.pipelines) {
      settings.pipelines = input.pipelines as any;
    }

    if (input.rolePermissions) {
      settings.set("rolePermissions", input.rolePermissions);

      await Promise.all(
        input.rolePermissions.map((item) =>
          UserModel.updateMany(
            {
              workspaceId: new Types.ObjectId(workspaceId),
              role: item.role,
            },
            {
              $set: {
                permissions: item.permissions.length
                  ? item.permissions
                  : [...defaultPermissionsByRole[item.role]],
              },
            },
          ),
        ),
      );
    }

    settings.updatedBy = new Types.ObjectId(userId);
    await settings.save();

    return formatSettings(settings);
  },
};
