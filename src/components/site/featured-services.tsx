"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceCardSkeleton } from "@/components/services/service-card-skeleton";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { fetchServiceList, type WeddingService } from "@/lib/services";

const featuredCount = 6;

export function FeaturedServices() {
  const { data: session } = authClient.useSession();
  const [services, setServices] = useState<WeddingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchServiceList(`/api/services/featured?limit=${featuredCount}`, controller.signal)
      .then(setServices)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        if (controller.signal.aborted) {
          return;
        }
        setError(
          cause instanceof Error ? cause.message : "Featured services could not be loaded.",
        );
        toast.error("Featured services could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [retry]);

  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
              Lovely people, meaningful details
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              Meet a few of our favorites
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              Discover the talented wedding professionals ready to help make
              your day feel like yours.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-800 hover:gap-3"
          >
            Browse all services
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>

        {error ? (
          <div
            role="alert"
            className="mt-9 flex flex-col items-center rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
          >
            <p className="font-semibold text-stone-800">Featured services are unavailable</p>
            <p className="mt-2 max-w-lg text-sm text-stone-600">{error}</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setIsLoading(true);
                setError("");
                setRetry((value) => value + 1);
              }}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: featuredCount }, (_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, featuredCount).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28) }}
              >
                <ServiceCard
                  service={service}
                  isAuthenticated={Boolean(session)}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-dashed border-stone-300 bg-[#fffdfa] px-6 py-12 text-center">
            <Heart className="mx-auto size-7 text-rose-700" />
            <p className="mt-3 font-serif text-xl text-stone-900">
              No featured services yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Check back soon to meet our wedding professionals.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
