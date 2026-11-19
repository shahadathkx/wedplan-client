"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  fetchVendorBookings,
  vendorApiFetch,
  type VendorBooking,
} from "@/lib/vendor-api";

function formatEventDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date to be confirmed"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "long",
      }).format(date);
}

export function VendorBookings() {
  const [bookings, setBookings] = useState<VendorBooking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const getBookings = useCallback(
    (signal?: AbortSignal) => fetchVendorBookings(signal),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void getBookings(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setBookings(result);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load booking requests.",
          );
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [getBookings]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBookings(await getBookings());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load booking requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function respond(booking: VendorBooking, action: "accept" | "reject") {
    setBusyId(booking.id);
    try {
      await vendorApiFetch(`/api/vendor/bookings/${encodeURIComponent(booking.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setBookings((current) =>
        current?.map((item) =>
          item.id === booking.id
            ? { ...item, status: action === "accept" ? "accepted" : "rejected" }
            : item,
        ) ?? null,
      );
      toast.success(action === "accept" ? "Booking accepted." : "Booking declined.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update this booking.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Your calendar
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Booking requests
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Review event details and respond to new requests. Only pending requests
        can be accepted or declined.
      </p>

      {error && (
        <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void load()} className="mt-3 inline-flex items-center gap-2 font-semibold">
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-4" aria-label="Loading bookings">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
      ) : bookings?.length ? (
        <div className="mt-8 space-y-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    booking.status === "accepted"
                      ? "bg-emerald-50 text-emerald-800"
                      : booking.status === "rejected"
                        ? "bg-red-50 text-red-800"
                        : "bg-amber-50 text-amber-900"
                  }`}>
                    {booking.status}
                  </span>
                  <h2 className="mt-3 font-serif text-2xl text-stone-900">
                    {booking.serviceName}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Request from <span className="font-semibold text-stone-800">{booking.customerName}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-stone-700">
                  <CalendarDays className="size-4 text-rose-800" />
                  {formatEventDate(booking.eventDate)}
                </div>
              </div>
              <dl className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Event location</dt>
                  <dd className="mt-1 text-sm text-stone-700">{booking.eventLocation || "Not specified"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-stone-400">Couple&apos;s message</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-700">{booking.message || "No message included."}</dd>
                </div>
              </dl>
              {booking.status === "pending" && (
                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-stone-100 pt-5">
                  <button
                    type="button"
                    disabled={busyId === booking.id}
                    onClick={() => void respond(booking, "reject")}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={busyId === booking.id}
                    onClick={() => void respond(booking, "accept")}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900 disabled:opacity-60"
                  >
                    {busyId === booking.id && <LoaderCircle className="size-4 animate-spin" />}
                    Accept booking
                  </button>
                </div>
              )}
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
            When a couple reaches out about one of your services, their request will appear here.
          </p>
        </section>
      )}
    </div>
  );
}
