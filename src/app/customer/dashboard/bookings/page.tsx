import type { Metadata } from "next";
import { CustomerBookings } from "@/components/dashboard/customer-bookings";

export const metadata: Metadata = {
  title: "My Bookings",
};

export default function CustomerBookingsPage() {
  return <CustomerBookings />;
}
