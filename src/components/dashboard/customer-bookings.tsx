"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  customerApiFetch,
  normalizeCustomerBookings,
  type CustomerBooking,
} from "@/lib/customer-api";

async function fetchBookings(signal?: AbortSignal) {
  try {
    const response = await customerApiFetch("/api/customer/bookings", { signal });
    return normalizeCustomerBookings(await response.json());
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("(404)") || error.message.includes("not found"))
    ) {
      const response = await customerApiFetch("/api/bookings", { signal });
      return normalizeCustomerBookings(await response.json());
    }
    throw error;
  }
}

function formatDate(value: string) {
  if (!value) {
    return "Not provided";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}

function statusStyle(status: CustomerBooking["status"]) {
  if (status === "accepted") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (status === "rejected") {
    return "bg-red-50 text-red-800";
  }
  if (status === "cancelled") {
    return "bg-stone-100 text-stone-600";
  }
  return "bg-amber-50 text-amber-900";
}

export function CustomerBookings() {
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [details, setDetails] = useState<CustomerBooking | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      return await fetchBookings(signal);
    } catch (cause) {
      if (!signal?.aborted) {
        throw cause;
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((result) => {
        if (result && !controller.signal.aborted) {
          setBookings(result);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your bookings.",
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
    try {
      const result = await load();
      if (result) {
        setBookings(result);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(booking: CustomerBooking) {
    if (
      !window.confirm(
        `Cancel your booking request for ${booking.serviceName}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyId(booking.id);
    try {
      await customerApiFetch(
        `/api/bookings/${encodeURIComponent(booking.id)}`,
        { method: "DELETE" },
      );
      setBookings((current) =>
        current?.map((item) =>
          item.id === booking.id ? { ...item, status: "cancelled" } : item,
        ) ?? null,
      );
      if (details?.id === booking.id) {
        setDetails({ ...booking, status: "cancelled" });
      }
      toast.success("Your booking request has been cancelled.");
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Could not cancel this booking.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Your requests
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        My bookings
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Review the details and status of every service you have booked or
        requested.
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

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading bookings">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <div className="h-44 animate-pulse bg-stone-100" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-stone-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
                <div className="h-10 animate-pulse rounded-xl bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings?.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => (
            <article key={booking.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="relative h-44 bg-stone-100">
                {booking.serviceImage ? (
                  <Image
                    src={booking.serviceImage}
                    alt={booking.serviceName}
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
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-serif text-2xl leading-tight text-stone-900">
                  {booking.serviceName}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {booking.vendorBusinessName || booking.vendorName}
                </p>
                <dl className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm">
                  <div className="flex gap-2 text-stone-600">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-rose-700" />
                    <div>
                      <dt className="text-xs text-stone-400">Event date</dt>
                      <dd className="mt-0.5 font-medium text-stone-700">{formatDate(booking.eventDate)}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2 text-stone-600">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-rose-700" />
                    <div>
                      <dt className="text-xs text-stone-400">Location</dt>
                      <dd className="mt-0.5 font-medium text-stone-700">{booking.eventLocation || "Not provided"}</dd>
                    </div>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-stone-400">
                  Requested {formatDate(booking.requestedAt)}
                </p>
                <div className="mt-5 flex gap-2 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setDetails(booking)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    View details
                  </button>
                  {booking.status === "pending" && (
                    <button
                      type="button"
                      disabled={busyId === booking.id}
                      onClick={() => void cancelBooking(booking)}
                      aria-label={`Cancel booking for ${booking.serviceName}`}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-red-100 text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      {busyId === booking.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-800">
            <CalendarDays className="size-6" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-stone-900">No booking requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Browse wedding professionals and send your first booking request.
          </p>
        </section>
      )}

      {details && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/45 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setDetails(null);
          }
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="booking-details-title" className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setDetails(null)}
              aria-label="Close booking details"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
            >
              <X className="size-5" />
            </button>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(details.status)}`}>
              {details.status}
            </span>
            <h2 id="booking-details-title" className="mt-4 pr-10 font-serif text-3xl text-stone-900">
              {details.serviceName}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {details.vendorBusinessName || details.vendorName}
            </p>
            <dl className="mt-6 space-y-4 border-t border-stone-100 pt-5 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Event date</dt>
                <dd className="mt-1 text-stone-700">{formatDate(details.eventDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Event location</dt>
                <dd className="mt-1 text-stone-700">{details.eventLocation || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Requested</dt>
                <dd className="mt-1 text-stone-700">{formatDate(details.requestedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Your message</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-6 text-stone-700">{details.message || "No message included."}</dd>
              </div>
            </dl>
            {details.status === "pending" && (
              <button
                type="button"
                disabled={busyId === details.id}
                onClick={() => void cancelBooking(details)}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {busyId === details.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Cancel booking request
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
