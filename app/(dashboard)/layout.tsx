import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-poppins">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
