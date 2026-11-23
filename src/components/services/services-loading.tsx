import { ServiceCardSkeleton } from "@/components/services/service-card-skeleton";

export function ServicesLoading() {
  return (
    <main className="flex-1 bg-[#faf7f4] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-72 max-w-full animate-pulse rounded bg-stone-200" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-stone-100" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
