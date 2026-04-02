import { apiRequest } from "./api-client";

export type WorkspaceSettings = {
  id: string;
  workspaceId: string;
  customFields: Array<{
    entityType: "contact" | "lead" | "deal" | "task";
    key: string;
    label: string;
    fieldType: "text" | "number" | "date" | "select";
    required: boolean;
    options: string[];
  }>;
  pipelines: {
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
  rolePermissions: Array<{
    role: "admin" | "manager" | "sales";
    permissions: string[];
  }>;
};

export const fetchSettings = async () => apiRequest<WorkspaceSettings>("/settings");

export const updateSettings = async (
  payload: Partial<Pick<WorkspaceSettings, "customFields" | "pipelines" | "rolePermissions">>,
) =>
  apiRequest<WorkspaceSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
