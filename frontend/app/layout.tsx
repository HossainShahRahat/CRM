import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "../components/layout/app-shell";
import "../app/globals.css";

export const metadata: Metadata = {
  title: "CRM Dashboard",
  description: "Production-grade CRM frontend scaffold",
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
};

export default RootLayout;

