import type { Metadata } from "next";
import { AdminOverview } from "@/components/dashboard/admin-overview";

export const metadata: Metadata = {
  title: "Admin Overview",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
