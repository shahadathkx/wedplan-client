"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceCardSkeleton } from "@/components/services/service-card-skeleton";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { weddingCategories } from "@/lib/categories";
import { fetchServiceList, type WeddingService } from "@/lib/services";

const pageSize = 12;

export function BrowseServices() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data: session } = authClient.useSession();
  const [services, setServices] = useState<WeddingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    fetchServiceList(`/api/services?${params.toString()}`, controller.signal, {
      cacheFor60Seconds: true,
    })
      .then((loadedServices) => {
        setServices((current) =>
          page === 1 ? loadedServices : [...current, ...loadedServices],
        );
        setHasMore(loadedServices.length === pageSize);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(
          cause instanceof Error ? cause.message : "Services could not be loaded.",
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => controller.abort();
  }, [page, query, retry]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["q", "category", "location", "sort"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params.set(key, value);
      }
    }
    setServices([]);
    setError("");
    setIsLoading(true);
    setIsLoadingMore(false);
    router.push(`/services${params.size ? `?${params.toString()}` : ""}`);
  }

  function loadMore() {
    const params = new URLSearchParams(query);
    params.set("page", String(page + 1));
    params.set("limit", String(pageSize));
    setError("");
    setIsLoadingMore(true);
    router.push(`/services?${params.toString()}`);
  }

  return (
    <main className="flex-1 bg-[#faf7f4]">
      <section className="border-b border-stone-200/80 bg-white px-5 py-12 sm:px-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-7xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
            Your people are out there
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
            Browse wedding services
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Find trusted professionals for the moments and details that make
            your celebration your own.
          </p>

          <form
            key={query}
            onSubmit={applyFilters}
            className="mt-8 grid gap-3 rounded-3xl border border-stone-200 bg-[#fffdfa] p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
          >
            <label className="relative block">
              <span className="sr-only">Search by service name</span>
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <input
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="Search services"
                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <label>
              <span className="sr-only">Filter by category</span>
              <select
                name="category"
                defaultValue={searchParams.get("category") ?? ""}
                className="h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              >
                <option value="">All categories</option>
                {weddingCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by location</span>
              <input
                name="location"
                defaultValue={searchParams.get("location") ?? ""}
                placeholder="City or location"
                className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <label>
              <span className="sr-only">Sort by price</span>
              <select
                name="sort"
                defaultValue={searchParams.get("sort") ?? ""}
                className="h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              >
                <option value="">Recommended</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>
            <Button type="submit" className="h-12 rounded-xl">
              <SlidersHorizontal className="size-4" />
              Apply
            </Button>
          </form>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-stone-900">
              {searchParams.get("category") || "All wedding services"}
            </h2>
            {!isLoading && !error && (
              <p className="mt-1 text-sm text-stone-500">
                {services.length} {services.length === 1 ? "service" : "services"} shown
              </p>
            )}
          </div>
          {(searchParams.has("q") ||
            searchParams.has("category") ||
            searchParams.has("location") ||
            searchParams.has("sort")) && (
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="text-sm font-semibold text-rose-800 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
          >
            <p className="font-semibold text-stone-800">We couldn&apos;t load these services</p>
            <p className="mt-2 text-sm text-stone-600">{error}</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setError("");
                setIsLoading(true);
                setRetry((value) => value + 1);
              }}
            >
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min((index % pageSize) * 0.035, 0.28),
                  }}
                >
                  <ServiceCard
                    service={service}
                    isAuthenticated={Boolean(session)}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  disabled={isLoadingMore}
                  onClick={loadMore}
                >
                  {isLoadingMore ? "Loading more..." : "Show more services"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <Sparkles className="mx-auto size-7 text-rose-700" />
            <h2 className="mt-3 font-serif text-2xl text-stone-900">
              No services found just yet
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Try a different name, category, or location.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => router.push("/services")}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
