import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/payments/payment-success";

export const metadata: Metadata = {
  title: "Payment confirmed",
};

export default function PaymentSuccessPage() {
  return <PaymentSuccess />;
}
