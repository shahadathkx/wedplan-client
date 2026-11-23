import { Suspense, type ReactNode } from "react";
import { DashboardGate } from "@/components/dashboard/dashboard-gate";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export const instant = false;

export default function VendorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardGate role="vendor">{children}</DashboardGate>
    </Suspense>
  );
}
