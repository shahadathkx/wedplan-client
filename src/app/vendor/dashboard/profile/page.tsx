import type { Metadata } from "next";
import { ProfileSettingsForm } from "@/components/profile-settings-form";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default function VendorProfilePage() {
  return <ProfileSettingsForm embedded />;
}
