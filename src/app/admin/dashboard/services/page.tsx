import type { Metadata } from "next";
import { AdminServices } from "@/components/dashboard/admin-services";

export const metadata: Metadata = {
  title: "Manage Services",
};

export default function AdminServicesPage() {
  return <AdminServices />;
}
