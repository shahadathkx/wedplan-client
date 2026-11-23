"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch, SessionExpiredError } from "@/lib/api";

type BookingFormProps = {
  serviceId: string;
  vendorId: string;
  userId: string;
  role: string;
};

type BookingErrorDetails = {
  message: string;
  debug?: string;
};

class BookingResponseError extends Error {
  constructor(
    message: string,
    readonly debug?: string,
  ) {
    super(message);
    this.name = "BookingResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDebug(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return JSON.stringify(value, null, 2);
}

export function BookingForm({
  serviceId,
  vendorId,
  userId,
  role,
}: BookingFormProps) {
  const router = useRouter();
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [bookingError, setBookingError] = useState<BookingErrorDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOwner = Boolean(vendorId) && vendorId === userId;

  if (role === "admin") {
    return (
      <BookingNotice>
        Administrator accounts can manage WedPlan but cannot book a service.
      </BookingNotice>
    );
  }
  if (isOwner) {
    return (
      <BookingNotice>
        You cannot book your own service. Your listing is ready for couples to
        discover.
      </BookingNotice>
    );
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const response = await apiFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          eventDate,
          eventLocation: eventLocation.trim(),
          message: message.trim(),
        }),
      });
      if (!response.ok) {
        let errorMessage = "Your booking request could not be sent.";
        let debug: string | undefined;
        try {
          const result: unknown = await response.json();
          if (isRecord(result)) {
            if (typeof result.message === "string" && result.message) {
              errorMessage = result.message;
            }
            debug = formatDebug(result.debug);
          }
        } catch {
          errorMessage = `Your booking request could not be sent (${response.status}).`;
        }
        throw new BookingResponseError(errorMessage, debug);
      }

      toast.success("Your booking request has been sent.");
      setEventDate("");
      setEventLocation("");
      setMessage("");
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        toast.error(error.message);
        const callbackURL = `${window.location.pathname}${window.location.search}`;
        router.replace(`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`);
        return;
      }
      const details: BookingErrorDetails = {
        message: error instanceof Error
          ? error.message
          : "Your booking request could not be sent.",
        ...(error instanceof BookingResponseError && error.debug
          ? { debug: error.debug }
          : {}),
      };
      setBookingError(details);
      toast.error(
        <div className="space-y-2">
          <p>{details.message}</p>
          {details.debug && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs">
              {details.debug}
            </pre>
          )}
        </div>,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitBooking} className="space-y-4">
      <label className="block text-sm font-semibold text-stone-700">
        Event date
        <input
          type="date"
          required
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-normal text-stone-700 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </label>
      <label className="block text-sm font-semibold text-stone-700">
        Event location
        <input
          required
          maxLength={200}
          value={eventLocation}
          onChange={(event) => setEventLocation(event.target.value)}
          placeholder="City, venue, or neighborhood"
          className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-normal outline-none placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </label>
      <label className="block text-sm font-semibold text-stone-700">
        A note for the vendor
        <textarea
          required
          maxLength={2000}
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell them a little about your plans..."
          className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-normal outline-none placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </label>
      {bookingError && (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
        >
          <p>{bookingError.message}</p>
          {bookingError.debug && (
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white/70 p-3 text-xs leading-5">
              {bookingError.debug}
            </pre>
          )}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
        {isSubmitting ? "Sending request..." : "Request to book"}
      </Button>
      <p className="text-center text-xs leading-5 text-stone-500">
        The vendor will receive your event details and message.
      </p>
    </form>
  );
}

function BookingNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#dbe5d7] bg-[#f3f7f1] p-4 text-sm leading-6 text-[#425a43]"
    >
      {children}
    </div>
  );
}
