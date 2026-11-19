import type { Metadata } from "next";
import { AddVendorServiceForm } from "@/components/dashboard/add-vendor-service-form";

export const metadata: Metadata = {
  title: "Add Service",
};

export default function AddVendorServicePage() {
  return <AddVendorServiceForm />;
}
