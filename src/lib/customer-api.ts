import { apiFetch } from "@/lib/api";

export type CustomerBooking = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string | null;
  vendorName: string;
  vendorBusinessName: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  requestedAt: string;
};

export type CustomerStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
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

function findList(payload: unknown): unknown[] | null {
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
      const nested = findList(candidate);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

function normalizeStatus(value: unknown): CustomerBooking["status"] {
  const status = asText(value, "pending").toLowerCase();
  if (status === "accepted" || status === "approved") {
    return "accepted";
  }
  if (status === "rejected" || status === "declined") {
    return "rejected";
  }
  if (status === "cancelled" || status === "canceled") {
    return "cancelled";
  }
  return "pending";
}

function normalizeBooking(value: unknown): CustomerBooking {
  const booking = asRecord(value);
  if (!booking) {
    throw new Error("The bookings API returned an invalid booking.");
  }
  const service =
    asRecord(booking.service) ??
    asRecord(booking.serviceDetails);
  const vendor =
    asRecord(booking.vendor) ??
    asRecord(service?.vendor) ??
    asRecord(booking.vendorInfo);
  const id = asId(booking.id ?? booking._id);
  if (!id) {
    throw new Error("The bookings API returned a booking without an ID.");
  }

  let serviceImage: string | null = null;
  const images = Array.isArray(service?.images) ? service.images : [];
  if (typeof images[0] === "string") {
    serviceImage = images[0];
  } else {
    const imageRecord = asRecord(images[0]);
    serviceImage =
      typeof imageRecord?.url === "string"
        ? imageRecord.url
        : typeof imageRecord?.src === "string"
          ? imageRecord.src
          : typeof booking.serviceImage === "string"
            ? booking.serviceImage
            : null;
  }

  return {
    id,
    serviceId: asId(
      booking.serviceId ??
        service?.id ??
        service?._id,
    ),
    serviceName: asText(
      booking.serviceName ??
        service?.serviceName ??
        service?.name,
      "Wedding service",
    ),
    serviceImage,
    vendorName: asText(
      booking.vendorName ??
        vendor?.name,
      "Wedding professional",
    ),
    vendorBusinessName: asText(
      booking.vendorBusinessName ??
        vendor?.businessName,
    ),
    eventDate: asText(booking.eventDate),
    eventLocation: asText(booking.eventLocation),
    message: asText(booking.message),
    status: normalizeStatus(booking.status),
    requestedAt: asText(
      booking.requestedAt ??
        booking.createdAt ??
        booking.created_at,
    ),
  };
}

export function normalizeCustomerBookings(payload: unknown) {
  const list = findList(payload);
  if (!list) {
    throw new Error("The bookings API returned an unexpected response.");
  }
  return list.map(normalizeBooking);
}

export function deriveCustomerStats(bookings: CustomerBooking[]): CustomerStats {
  return {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    accepted: bookings.filter((booking) => booking.status === "accepted").length,
    rejected: bookings.filter((booking) => booking.status === "rejected").length,
  };
}

export async function customerApiFetch(path: string, init: RequestInit = {}) {
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
    throw await customerResponseError(response);
  }
  return response;
}

async function customerResponseError(response: Response) {
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
