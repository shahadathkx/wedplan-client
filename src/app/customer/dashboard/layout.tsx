import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardAuthError } from "@/components/dashboard/dashboard-auth-error";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

export default async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await requireDashboardUser("customer");
  if (result.status === "error") {
    return <DashboardAuthError message={result.message} />;
  }

  return (
    <DashboardShell role="customer" userName={result.user.name}>
      {children}
    </DashboardShell>
  );
}
