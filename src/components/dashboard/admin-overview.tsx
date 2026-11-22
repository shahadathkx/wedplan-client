"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  adminApiFetch,
  formatCurrencyAmount,
  normalizeAdminStats,
  type AdminStats,
} from "@/lib/admin-api";

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await adminApiFetch("/api/admin/stats", { signal });
    return normalizeAdminStats(await response.json());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setStats(result);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load admin statistics.");
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
    try {
      setStats(await load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load admin statistics.");
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: "Total users", value: stats?.totalUsers, icon: Users },
    { label: "Vendors", value: stats?.totalVendors, icon: ShieldCheck },
    { label: "Customers", value: stats?.totalCustomers, icon: Users },
    { label: "Total services", value: stats?.totalServices, icon: BriefcaseBusiness },
    { label: "Pending services", value: stats?.pendingServices, icon: RefreshCw },
    { label: "Total bookings", value: stats?.totalBookings, icon: CalendarDays },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Administration</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Platform overview</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Monitor the people, listings, and activity that keep WedPlan moving.
      </p>

      {error && (
        <div role="alert" className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void retry()} className="inline-flex shrink-0 items-center gap-2 font-semibold">
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      )}

      <section aria-label="Admin statistics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-800">
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

      {stats && stats.revenueByCurrency.length > 0 && (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Revenue</p>
          <div className="mt-2 flex flex-wrap gap-6">
            {stats.revenueByCurrency.map(({ currency, amount }) => (
              <p key={currency} className="font-serif text-3xl text-stone-900">
                {formatCurrencyAmount(amount, currency)}
              </p>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Manage users", href: "/admin/dashboard/users" },
          { label: "Review services", href: "/admin/dashboard/services" },
          { label: "View transactions", href: "/admin/dashboard/transactions" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl border border-stone-200 bg-white p-5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-800">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
