"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleX,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import {
  customerApiFetch,
  type CustomerStats,
} from "@/lib/customer-api";

export function CustomerOverview() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await customerApiFetch("/api/customer/stats", { signal });
      const payload = (await response.json()) as {
        stats?: Partial<Record<
          "totalBookings" | "pendingBookings" | "acceptedBookings" | "rejectedBookings",
          number
        >>;
      };
      const stats = payload.stats;
      if (
        !stats ||
        typeof stats.totalBookings !== "number" ||
        typeof stats.pendingBookings !== "number" ||
        typeof stats.acceptedBookings !== "number" ||
        typeof stats.rejectedBookings !== "number"
      ) {
        throw new Error("The customer stats API returned an unexpected response.");
      }

      return {
        total: stats.totalBookings,
        pending: stats.pendingBookings,
        accepted: stats.acceptedBookings,
        rejected: stats.rejectedBookings,
      } satisfies CustomerStats;
    } catch (cause) {
      if (signal?.aborted) {
        return null;
      }
      throw cause;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((result) => {
        if (result && !controller.signal.aborted) {
          setStats(result);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your booking overview.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [load]);

  async function retry() {
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      const result = await load();
      if (result) {
        setStats(result);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load your booking overview.",
      );
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      label: "Total bookings",
      value: stats?.total,
      icon: CalendarDays,
      tone: "bg-rose-50 text-rose-800",
    },
    {
      label: "Pending",
      value: stats?.pending,
      icon: CalendarClock,
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "Accepted",
      value: stats?.accepted,
      icon: CalendarCheck,
      tone: "bg-emerald-50 text-emerald-800",
    },
    {
      label: "Rejected",
      value: stats?.rejected,
      icon: CircleX,
      tone: "bg-red-50 text-red-800",
    },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Customer workspace
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Your wedding bookings
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Keep track of the professionals you have contacted and follow every
        booking response in one place.
      </p>

      {error && (
        <div role="alert" className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void retry()} className="inline-flex shrink-0 items-center gap-2 font-semibold">
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      )}

      <section aria-label="Booking statistics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-5 text-sm font-medium text-stone-500">{label}</p>
            <div className="mt-1 min-h-10">
              {loading ? (
                <LoaderCircle className="size-5 animate-spin text-stone-300" aria-label="Loading" />
              ) : (
                <p className="font-serif text-3xl text-stone-900">{value ?? "—"}</p>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Next step</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">Review your booking requests</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              See event details, vendor information, request dates, and current statuses.
            </p>
          </div>
          <Link href="/customer/dashboard/bookings" className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900">
            View my bookings
          </Link>
        </div>
      </section>
    </div>
  );
}
