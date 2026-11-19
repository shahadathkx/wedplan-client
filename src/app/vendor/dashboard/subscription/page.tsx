import type { Metadata } from "next";
import { VendorSubscription } from "@/components/dashboard/vendor-subscription";

export const metadata: Metadata = {
  title: "Subscription",
};

export default function VendorSubscriptionPage() {
  return <VendorSubscription />;
}
