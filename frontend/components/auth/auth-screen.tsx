"use client";

import { useState, useTransition } from "react";

import { useAuth } from "./auth-provider";
import { authStorage } from "../../lib/auth";
import { isValidEmail, requireFields } from "../../lib/validation";

type AuthMode = "login" | "register";

export const AuthScreen = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    workspaceId: authStorage.getWorkspaceId(),
  });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "manager" | "sales",
  });

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      { valid: isValidEmail(loginForm.email), message: "Valid email is required." },
      { valid: loginForm.password.length >= 8, message: "Password is required." },
      {
        valid: loginForm.workspaceId.trim().length === 24,
        message: "Workspace ID must be a valid 24-character id.",
      },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await login({
          email: loginForm.email.trim(),
          password: loginForm.password,
          workspaceId: loginForm.workspaceId.trim(),
        });
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : "Login failed.");
      }
    });
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      {
        valid: registerForm.firstName.trim().length > 0,
        message: "First name is required.",
      },
      {
        valid: registerForm.lastName.trim().length > 0,
        message: "Last name is required.",
      },
      { valid: isValidEmail(registerForm.email), message: "Valid email is required." },
      {
        valid: registerForm.password.length >= 8,
        message: "Password must be at least 8 characters.",
      },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await register({
          firstName: registerForm.firstName.trim(),
          lastName: registerForm.lastName.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          role: registerForm.role,
        });
      } catch (registerError) {
        setError(
          registerError instanceof Error ? registerError.message : "Registration failed.",
        );
      }
    });
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-card__header">
          <p className="sidebar__brand">CRM Dashboard</p>
          <h1>{mode === "login" ? "Sign in" : "Create workspace admin"}</h1>
          <p>
            {mode === "login"
              ? "Sign in with your workspace credentials to access the CRM."
              : "Register the first workspace user. The workspace id will be stored automatically after registration."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`button ${mode === "login" ? "" : "button--secondary"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`button ${mode === "register" ? "" : "button--secondary"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <input
              name="workspaceId"
              autoComplete="off"
              placeholder="Workspace ID"
              value={loginForm.workspaceId}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, workspaceId: event.target.value }))
              }
            />
            <button type="submit" className="button" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              name="firstName"
              autoComplete="given-name"
              placeholder="First name"
              value={registerForm.firstName}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, firstName: event.target.value }))
              }
            />
            <input
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              value={registerForm.lastName}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, lastName: event.target.value }))
              }
            />
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <select
              name="role"
              value={registerForm.role}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  role: event.target.value as "admin" | "manager" | "sales",
                }))
              }
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="sales">Sales</option>
            </select>
            <button type="submit" className="button" disabled={isPending}>
              {isPending ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        {error ? <p className="status-message status-message--error">{error}</p> : null}
      </section>
    </div>
  );
};
