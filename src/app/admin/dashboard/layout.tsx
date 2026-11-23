import { Suspense, type ReactNode } from "react";
import { DashboardGate } from "@/components/dashboard/dashboard-gate";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export const instant = false;

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardGate role="admin">{children}</DashboardGate>
    </Suspense>
  );
}
