import type { Metadata } from "next";
import { PaymentCancel } from "@/components/payments/payment-cancel";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default function PaymentCancelPage() {
  return <PaymentCancel />;
}
