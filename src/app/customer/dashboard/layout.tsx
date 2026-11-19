import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

export default async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDashboardUser("customer");

  return (
    <DashboardShell role="customer" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
