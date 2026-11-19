import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDashboardUser("admin");

  return (
    <DashboardShell role="admin" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
