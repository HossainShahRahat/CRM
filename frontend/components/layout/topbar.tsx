"use client";

import { useTransition } from "react";

import { useAuth } from "../auth/auth-provider";
import { NotificationDropdown } from "./notification-dropdown";

type TopbarProps = {
  title: string;
  subtitle: string;
};

export const Topbar = ({ title, subtitle }: TopbarProps) => {
  const { user, logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="topbar">
      <div className="topbar__intro">
        <h1 className="topbar__title">{title}</h1>
        <p className="topbar__subtitle">{subtitle}</p>
      </div>
      <input
        name="globalSearch"
        className="topbar__search"
        type="search"
        placeholder="Search customers, deals, or tasks"
        aria-label="Search"
      />
      <div className="topbar__actions">
        <NotificationDropdown />
        <div className="topbar__session">
          <div>
            <p className="topbar__user-name">
              {user ? `${user.firstName} ${user.lastName}`.trim() : "Signed in"}
            </p>
            <p className="topbar__user-role">
              {user ? `${user.role} access` : "Workspace session"}
            </p>
          </div>
          <button
            type="button"
            className="button button--ghost"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
};
