import type { Metadata } from "next";
import { VendorServicesManager } from "@/components/dashboard/vendor-services-manager";

export const metadata: Metadata = {
  title: "My Services",
};

export default function VendorServicesPage() {
  return <VendorServicesManager />;
}
