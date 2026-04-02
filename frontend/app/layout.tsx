import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthGate } from "../components/auth/auth-gate";
import { AuthProvider } from "../components/auth/auth-provider";
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
        <AuthProvider>
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
