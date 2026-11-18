import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "WedPlan | Your wedding, your way",
    template: "%s | WedPlan",
  },
  description:
    "Find trusted wedding vendors and bring every detail of your celebration together with WedPlan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
