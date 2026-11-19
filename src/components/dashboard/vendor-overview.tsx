"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarClock,
  Eye,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { normalizeVendorStats, vendorApiFetch } from "@/lib/vendor-api";

type LoadState = {
  loading: boolean;
  error: string | null;
  stats: ReturnType<typeof normalizeVendorStats> | null;
};

const cards = [
  {
    key: "totalServices",
    label: "Total services",
    icon: BriefcaseBusiness,
    href: "/vendor/dashboard/services",
  },
  {
    key: "availableServices",
    label: "Available services",
    icon: Eye,
    href: "/vendor/dashboard/services",
  },
  {
    key: "totalBookings",
    label: "Total bookings",
    icon: CalendarCheck2,
    href: "/vendor/dashboard/bookings",
  },
  {
    key: "pendingBookings",
    label: "Pending requests",
    icon: CalendarClock,
    href: "/vendor/dashboard/bookings",
  },
] as const;

export function VendorOverview() {
  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    stats: null,
  });
  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await vendorApiFetch("/api/vendor/stats", { signal });
      const stats = normalizeVendorStats(await response.json());
      return { stats, error: null };
    } catch (error) {
      if (signal?.aborted) {
        return null;
      }
      return {
        stats: null,
        error:
          error instanceof Error ? error.message : "Unable to load your overview.",
      };
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchStats(controller.signal).then((result) => {
      if (result && !controller.signal.aborted) {
        setState({
          loading: false,
          error: result.error,
          stats: result.stats,
        });
      }
    });
    return () => controller.abort();
  }, [fetchStats]);

  async function load() {
    setState((current) => ({ ...current, loading: true, error: null }));
    const result = await fetchStats();
    if (result) {
      setState({
        loading: false,
        error: result.error,
        stats: result.stats,
      });
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Vendor workspace
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Your business at a glance
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Keep your services up to date and stay close to the couples planning
        their celebration.
      </p>

      {state.error && (
        <div
          role="alert"
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{state.error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex shrink-0 items-center gap-2 font-semibold"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      )}

      <section
        aria-label="Vendor statistics"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map(({ key, label, icon: Icon, href }) => (
          <Link
            key={key}
            href={href}
            className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-800">
                <Icon className="size-5" />
              </span>
              <ArrowRight className="size-4 text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-700" />
            </div>
            <p className="mt-6 text-sm font-medium text-stone-500">{label}</p>
            <div className="mt-1 flex min-h-9 items-center">
              {state.loading ? (
                <LoaderCircle
                  className="size-5 animate-spin text-stone-300"
                  aria-label="Loading"
                />
              ) : (
                <p className="font-serif text-3xl text-stone-900">
                  {state.stats?.[key] ?? "—"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
              Next steps
            </p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">
              Make your services shine
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              {state.stats && state.stats.pendingBookings > 0
                ? `You have ${state.stats.pendingBookings} booking ${state.stats.pendingBookings === 1 ? "request" : "requests"} to review.`
                : "Add clear details and beautiful photos so couples can picture your work."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/vendor/dashboard/services/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-800 px-5 text-sm font-semibold text-white transition hover:bg-rose-900"
            >
              Add a service
            </Link>
            <Link
              href="/vendor/dashboard/bookings"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              View bookings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
