import type { ReactNode } from "react";
import { DashboardAuthError } from "@/components/dashboard/dashboard-auth-error";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  requireDashboardUser,
  type DashboardRole,
} from "@/lib/dashboard-auth";

export async function DashboardGate({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  const result = await requireDashboardUser(role);
  if (result.status === "error") {
    return <DashboardAuthError message={result.message} />;
  }

  return (
    <DashboardShell role={role} userName={result.user.name}>
      {children}
    </DashboardShell>
  );
}
