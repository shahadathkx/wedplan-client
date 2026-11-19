import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

export default async function VendorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDashboardUser("vendor");

  return (
    <DashboardShell role="vendor" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
