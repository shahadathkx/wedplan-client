import type { Metadata } from "next";
import { VendorOverview } from "@/components/dashboard/vendor-overview";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
};

export default function VendorDashboardPage() {
  return <VendorOverview />;
}
