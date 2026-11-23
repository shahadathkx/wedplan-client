"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { weddingCategories } from "@/lib/categories";
import {
  fetchVendorServices,
  vendorApiFetch,
} from "@/lib/vendor-api";
import {
  formatServicePrice,
  type WeddingService,
} from "@/lib/services";

type EditValues = {
  serviceName: string;
  category: string;
  description: string;
  location: string;
  price: string;
};

function editValues(service: WeddingService): EditValues {
  return {
    serviceName: service.serviceName,
    category: service.category,
    description: service.description,
    location: service.location,
    price: String(service.price),
  };
}

function statusStyle(status: string) {
  if (status === "approved") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (status === "rejected") {
    return "bg-red-50 text-red-800";
  }
  return "bg-amber-50 text-amber-800";
}

export function VendorServicesManager() {
  const [services, setServices] = useState<WeddingService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<EditValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getServices = useCallback(
    (signal?: AbortSignal) => fetchVendorServices(signal),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void getServices(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setServices(result);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your services.",
          );
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [getServices]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setServices(await getServices());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load your services.",
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(service: WeddingService) {
    setEditingId(service.id);
    setValues(editValues(service));
    setConfirmDeleteId(null);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !values) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await vendorApiFetch(`/api/vendor/services/${encodeURIComponent(editingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: values.serviceName.trim(),
          category: values.category,
          description: values.description.trim(),
          location: values.location.trim(),
          price: Number(values.price),
        }),
      });
      toast.success("Service updated.");
      setEditingId(null);
      setValues(null);
      await load();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not update the service.";
      setError(message);
      toast.error(
        message,
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(service: WeddingService) {
    setBusyId(service.id);
    setError(null);
    try {
      await vendorApiFetch(
        `/api/vendor/services/${encodeURIComponent(service.id)}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !service.isAvailable }),
        },
      );
      setServices((current) =>
        current?.map((item) =>
          item.id === service.id
            ? { ...item, isAvailable: !item.isAvailable }
            : item,
        ) ?? null,
      );
      toast.success(
        service.isAvailable ? "Service marked unavailable." : "Service is now available.",
      );
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Could not update service availability.";
      setError(message);
      toast.error(
        message,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteService(service: WeddingService) {
    setBusyId(service.id);
    setError(null);
    try {
      await vendorApiFetch(`/api/vendor/services/${encodeURIComponent(service.id)}`, {
        method: "DELETE",
      });
      setServices((current) => current?.filter((item) => item.id !== service.id) ?? []);
      setConfirmDeleteId(null);
      if (editingId === service.id) {
        setEditingId(null);
        setValues(null);
      }
      toast.success("Service deleted.");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not delete the service.";
      setError(message);
      toast.error(
        message,
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
            Service management
          </p>
          <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
            My services
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Keep your listings accurate, available, and ready to be discovered.
          </p>
        </div>
        <Link
          href="/vendor/dashboard/services/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
        >
          <Plus className="size-4" />
          Add service
        </Link>
      </div>

      {error && (
        <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 inline-flex items-center gap-2 font-semibold"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading services">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <div className="h-48 animate-pulse bg-stone-100" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-stone-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
                <div className="h-10 animate-pulse rounded-xl bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      ) : services?.length ? (
        <div className="mt-8 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative h-48 bg-stone-100">
                {service.images[0] ? (
                  <Image
                    src={service.images[0]}
                    alt={service.serviceName}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-400">
                    No service photo
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(service.status)}`}>
                    {service.status}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {service.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <h2 className="mt-3 font-serif text-2xl leading-tight text-stone-900">
                  {service.serviceName}
                </h2>
                <p className="mt-1 text-sm text-stone-500">{service.category}</p>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                  <span className="truncate pr-3 text-stone-500">{service.location}</span>
                  <span className="shrink-0 font-semibold text-stone-900">
                    ${formatServicePrice(service.price)}
                  </span>
                </div>

                {editingId === service.id && values ? (
                  <form onSubmit={saveEdit} className="mt-5 space-y-3 border-t border-stone-100 pt-5">
                    <label className="block text-xs font-semibold text-stone-600">
                      Service name
                      <input
                        required
                        maxLength={100}
                        value={values.serviceName}
                        onChange={(event) => setValues({ ...values, serviceName: event.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-stone-200 px-3 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-stone-600">
                      Category
                      <select
                        required
                        value={values.category}
                        onChange={(event) => setValues({ ...values, category: event.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-normal"
                      >
                        {weddingCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-stone-600">
                      Description
                      <textarea
                        required
                        rows={3}
                        maxLength={2000}
                        value={values.description}
                        onChange={(event) => setValues({ ...values, description: event.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-stone-200 p-3 text-sm font-normal"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-semibold text-stone-600">
                        Price
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={values.price}
                          onChange={(event) => setValues({ ...values, price: event.target.value })}
                          className="mt-1.5 h-10 w-full rounded-lg border border-stone-200 px-3 text-sm font-normal"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-stone-600">
                        Location
                        <input
                          required
                          maxLength={120}
                          value={values.location}
                          onChange={(event) => setValues({ ...values, location: event.target.value })}
                          className="mt-1.5 h-10 w-full rounded-lg border border-stone-200 px-3 text-sm font-normal"
                        />
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-rose-800 px-4 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {saving && <LoaderCircle className="size-4 animate-spin" />}
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setValues(null); }}
                        className="min-h-10 rounded-full border border-stone-200 px-4 text-sm font-semibold text-stone-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                    <button
                      type="button"
                      onClick={() => startEdit(service)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === service.id}
                      aria-pressed={service.isAvailable}
                      onClick={() => void toggleAvailability(service)}
                      className="min-h-10 flex-1 rounded-full border border-stone-200 px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                    >
                      {busyId === service.id ? "Updating..." : service.isAvailable ? "Pause listing" : "Make available"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(confirmDeleteId === service.id ? null : service.id)}
                      className="flex size-10 items-center justify-center rounded-full border border-red-100 text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${service.serviceName}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                    {confirmDeleteId === service.id && (
                      <div className="w-full rounded-xl bg-red-50 p-3 text-sm text-red-900" role="group" aria-label="Confirm service deletion">
                        <p>Delete this service? This cannot be undone.</p>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full px-3 py-1.5 font-semibold text-stone-700"
                          >
                            Keep service
                          </button>
                          <button
                            type="button"
                            disabled={busyId === service.id}
                            onClick={() => void deleteService(service)}
                            className="rounded-full bg-red-700 px-3 py-1.5 font-semibold text-white disabled:opacity-60"
                          >
                            {busyId === service.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <BriefcaseBusinessIcon />
          <h2 className="mt-4 font-serif text-2xl text-stone-900">Your first listing starts here</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Add your service details and photos so couples can find the right fit for their day.
          </p>
          <Link
            href="/vendor/dashboard/services/new"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
          >
            Create a service
          </Link>
        </section>
      )}
    </div>
  );
}

function BriefcaseBusinessIcon() {
  return (
    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-800">
      <Plus className="size-6" />
    </span>
  );
}
