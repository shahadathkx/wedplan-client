import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardAuthError } from "@/components/dashboard/dashboard-auth-error";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await requireDashboardUser("admin");
  if (result.status === "error") {
    return <DashboardAuthError message={result.message} />;
  }

  return (
    <DashboardShell role="admin" userName={result.user.name}>
      {children}
    </DashboardShell>
  );
}
