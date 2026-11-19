import type { Metadata } from "next";
import { CustomerOverview } from "@/components/dashboard/customer-overview";

export const metadata: Metadata = {
  title: "Customer Dashboard",
};

export default function CustomerDashboardPage() {
  return <CustomerOverview />;
}
