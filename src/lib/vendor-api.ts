import { apiFetch } from "@/lib/api";
import { normalizeServiceList, type WeddingService } from "@/lib/services";

export type VendorStats = {
  totalServices: number;
  availableServices: number;
  totalBookings: number;
  pendingBookings: number;
};

export type VendorBooking = {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  const record = asRecord(value);
  return record ? asId(record.id ?? record._id) : "";
}

function asNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
}

function unwrapStats(payload: unknown): Record<string, unknown> {
  let value = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = asRecord(value);
    if (!record) {
      break;
    }
    if (
      "totalServices" in record ||
      "serviceCount" in record ||
      "pendingBookings" in record
    ) {
      return record;
    }
    value = record.stats ?? record.data ?? value;
  }
  const record = asRecord(value);
  if (!record) {
    throw new Error("The vendor stats API returned an unexpected response.");
  }
  return record;
}

export function normalizeVendorStats(payload: unknown): VendorStats {
  const stats = unwrapStats(payload);
  return {
    totalServices: asNumber(stats, [
      "totalServices",
      "serviceCount",
      "servicesCount",
    ]),
    availableServices: asNumber(stats, [
      "availableServices",
      "activeServices",
      "availableServiceCount",
    ]),
    totalBookings: asNumber(stats, [
      "totalBookings",
      "bookingCount",
      "bookingsCount",
    ]),
    pendingBookings: asNumber(stats, [
      "pendingBookings",
      "pendingBookingCount",
      "bookingRequests",
    ]),
  };
}

function findBookingList(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }
  const record = asRecord(payload);
  if (!record) {
    return null;
  }
  for (const key of ["bookings", "items", "results", "data"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (candidate && typeof candidate === "object") {
      const nested = findBookingList(candidate);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

function normalizeBooking(value: unknown): VendorBooking {
  const booking = asRecord(value);
  if (!booking) {
    throw new Error("The bookings API returned an invalid booking.");
  }
  const service = asRecord(booking.service);
  const customer = asRecord(booking.customer);
  const id = asId(booking.id ?? booking._id);
  if (!id) {
    throw new Error("The bookings API returned a booking without an ID.");
  }
  return {
    id,
    serviceId: asId(booking.serviceId ?? service?.id ?? service?._id),
    serviceName: asText(
      booking.serviceName ?? service?.serviceName ?? service?.name,
      "Wedding service",
    ),
    customerName: asText(
      booking.customerName ?? customer?.name,
      "WedPlan customer",
    ),
    eventDate: asText(booking.eventDate),
    eventLocation: asText(booking.eventLocation),
    message: asText(booking.message),
    status: asText(booking.status, "pending"),
  };
}

export function normalizeVendorBookings(payload: unknown) {
  const bookings = findBookingList(payload);
  if (!bookings) {
    throw new Error("The bookings API returned an unexpected response.");
  }
  return bookings.map(normalizeBooking);
}

export async function vendorApiFetch(
  path: string,
  init: RequestInit = {},
) {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not connect to the WedPlan API. Please try again.");
    }
    throw error;
  }

  if (!response.ok) {
    throw await responseError(response);
  }
  return response;
}

export async function fetchVendorServices(signal?: AbortSignal) {
  const response = await vendorApiFetch("/api/vendor/services", { signal });
  return normalizeServiceList(await response.json()) satisfies WeddingService[];
}

export async function fetchVendorBookings(signal?: AbortSignal) {
  const response = await vendorApiFetch("/api/vendor/bookings", { signal });
  return normalizeVendorBookings(await response.json());
}

export async function responseError(response: Response) {
  let message = `Request failed (${response.status}).`;
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.trim()) {
      message = body.message;
    }
  } catch {
    message = `Request failed (${response.status}).`;
  }
  return new Error(message);
}
