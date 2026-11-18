import { Suspense } from "react";
import { BrowseServices } from "@/components/services/browse-services";
import { ServiceCardSkeleton } from "@/components/services/service-card-skeleton";

export const metadata = { title: "Browse wedding services" };

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 bg-[#faf7f4] px-5 py-12 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        </main>
      }
    >
      <BrowseServices />
    </Suspense>
  );
}
