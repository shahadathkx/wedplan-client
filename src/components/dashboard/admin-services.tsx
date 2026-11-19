"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminApiFetch,
  normalizeAdminServices,
  type AdminService,
} from "@/lib/admin-api";

function statusStyle(status: AdminService["status"]) {
  if (status === "approved") return "bg-emerald-50 text-emerald-800";
  if (status === "rejected") return "bg-red-50 text-red-800";
  return "bg-amber-50 text-amber-900";
}

export function AdminServices() {
  const [services, setServices] = useState<AdminService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await adminApiFetch("/api/admin/services", { signal });
    return normalizeAdminServices(await response.json());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setServices(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load services.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (services ?? []).filter((service) => {
      const matchesSearch =
        !term ||
        service.serviceName.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term) ||
        service.vendorName.toLowerCase().includes(term);
      return matchesSearch && (status === "all" || service.status === status);
    });
  }, [services, search, status]);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      setServices(await load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(service: AdminService, nextStatus: AdminService["status"]) {
    setBusyId(service.id);
    try {
      await adminApiFetch(
        `/api/admin/services/${encodeURIComponent(service.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setServices((current) =>
        current?.map((item) =>
          item.id === service.id ? { ...item, status: nextStatus } : item,
        ) ?? null,
      );
      toast.success(`Service ${nextStatus}.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update the service.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteService(service: AdminService) {
    if (!window.confirm(`Delete "${service.serviceName}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(service.id);
    try {
      await adminApiFetch(`/api/admin/services/${encodeURIComponent(service.id)}`, {
        method: "DELETE",
      });
      setServices((current) => current?.filter((item) => item.id !== service.id) ?? null);
      toast.success("Service deleted.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete the service.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Content moderation</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Manage services</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Search listings, review moderation status, and keep the directory trustworthy.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search services</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service, category, or vendor..." className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void retry()} className="inline-flex items-center gap-2 font-semibold"><RefreshCw className="size-4" />Try again</button>
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading services">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <div className="h-44 animate-pulse bg-stone-100" />
              <div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-stone-100" /><div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <article key={service.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="relative h-44 bg-stone-100">
                {service.images[0] ? (
                  <Image src={service.images[0]} alt={service.serviceName} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-400">No service photo</div>
                )}
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(service.status)}`}>{service.status}</span>
              </div>
              <div className="p-5">
                <h2 className="font-serif text-2xl leading-tight text-stone-900">{service.serviceName}</h2>
                <p className="mt-1 text-sm text-stone-500">{service.vendorName} · {service.category}</p>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">{service.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                  <span className="truncate pr-3 text-stone-500">{service.location || "Location not set"}</span>
                  <span className="shrink-0 font-semibold text-stone-900">${new Intl.NumberFormat("en-US").format(service.price)}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                  {service.status !== "approved" && (
                    <button type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "approved")} className="min-h-10 flex-1 rounded-full bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {busyId === service.id ? "Updating..." : "Approve"}
                    </button>
                  )}
                  {service.status !== "rejected" && (
                    <button type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "rejected")} className="min-h-10 flex-1 rounded-full border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                      Reject
                    </button>
                  )}
                  {service.status === "approved" && (
                    <button type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "pending")} className="min-h-10 flex-1 rounded-full border border-amber-200 px-3 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60">
                      Set pending
                    </button>
                  )}
                  {service.status === "rejected" && (
                    <button type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "pending")} className="min-h-10 flex-1 rounded-full border border-amber-200 px-3 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60">
                      Set pending
                    </button>
                  )}
                  <button type="button" disabled={busyId === service.id} onClick={() => void deleteService(service)} aria-label={`Delete ${service.serviceName}`} className="flex size-10 items-center justify-center rounded-full border border-red-100 text-red-700 hover:bg-red-50 disabled:opacity-60">
                    {busyId === service.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-stone-900">No matching services</h2>
          <p className="mt-2 text-sm text-stone-600">Try changing your search or status filter.</p>
        </section>
      )}
    </div>
  );
}
