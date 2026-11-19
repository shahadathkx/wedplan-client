import type { Metadata } from "next";
import { CustomerProfileSettings } from "@/components/dashboard/customer-profile-settings";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default function CustomerProfilePage() {
  return <CustomerProfileSettings />;
}
