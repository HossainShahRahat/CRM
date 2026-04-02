"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authStorage,
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  type AuthUser,
} from "../../lib/auth";
import { ApiError } from "../../lib/api-client";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  login: (payload: { email: string; password: string; workspaceId: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "admin" | "manager" | "sales";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const token = authStorage.getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authStorage.clearSession();
        setUser(null);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (payload: {
    email: string;
    password: string;
    workspaceId: string;
  }) => {
    const result = await loginRequest(payload);
    authStorage.setSession(result.accessToken, result.user.workspaceId);
    setUser(result.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "admin" | "manager" | "sales";
  }) => {
    const result = await registerRequest(payload);
    authStorage.setSession(result.accessToken, result.user.workspaceId);
    setUser(result.user);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

