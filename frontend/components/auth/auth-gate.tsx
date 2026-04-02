"use client";

import type { ReactNode } from "react";

import { AuthScreen } from "./auth-screen";
import { useAuth } from "./auth-provider";

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-shell">
        <section className="auth-card">Loading session...</section>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthScreen />;
  }

  return <>{children}</>;
};

