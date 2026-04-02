"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "../../config/navigation";
import { appConfig } from "../../lib/app-config";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <p className="sidebar__brand">{appConfig.appName}</p>
      <nav className="sidebar__nav" aria-label="Primary">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

