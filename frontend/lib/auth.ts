import { appConfig } from "./app-config";
import { ApiError } from "./api-client";

export type AuthUser = {
  id: string;
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: "admin" | "manager" | "sales";
  status: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  expiresAt: string | null;
};

const TOKEN_KEY = "crm_access_token";
const WORKSPACE_KEY = "crm_workspace_id";

export const authStorage = {
  getToken: () => (typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY)),
  getWorkspaceId: () =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(WORKSPACE_KEY) ?? "",
  setSession: (accessToken: string, workspaceId: string) => {
    window.localStorage.setItem(TOKEN_KEY, accessToken);
    window.localStorage.setItem(WORKSPACE_KEY, workspaceId);
  },
  clearSession: () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(WORKSPACE_KEY);
  },
};

const parseResponse = async <T>(response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      typeof data?.message === "string" ? data.message : "Authentication request failed",
      response.status,
      data,
    );
  }

  return data as T;
};

export const loginRequest = async (payload: {
  email: string;
  password: string;
  workspaceId: string;
}) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
};

export const registerRequest = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "manager" | "sales";
}) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
};

export const fetchCurrentUser = async () => {
  const token = authStorage.getToken();

  if (!token) {
    throw new ApiError("Missing authentication token", 401);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await parseResponse<{ user: AuthUser }>(response);
  return data.user;
};

export const logoutRequest = async () => {
  const token = authStorage.getToken();

  if (!token) {
    authStorage.clearSession();
    return;
  }

  await fetch(`${appConfig.apiBaseUrl}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  authStorage.clearSession();
};

