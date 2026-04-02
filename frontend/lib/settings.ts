import { appConfig } from "./app-config";

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

export const fetchSettings = async () => {
  const response = await fetch(`${appConfig.apiBaseUrl}/settings`, {
    headers: createHeaders(),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to fetch settings");
  }

  return data as WorkspaceSettings;
};

export const updateSettings = async (
  payload: Partial<Pick<WorkspaceSettings, "customFields" | "pipelines" | "rolePermissions">>,
) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/settings`, {
    method: "PUT",
    headers: createHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to update settings");
  }

  return data as WorkspaceSettings;
};

