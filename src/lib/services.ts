import { publicApiFetch, resolveApiUrl } from "@/lib/api";

export type VendorSummary = {
  id: string;
  name: string;
  businessName: string;
  image: string | null;
};

export type WeddingService = {
  id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendor: VendorSummary | null;
  status: string;
  isAvailable: boolean;
  createdAt: string;
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
  if (!record) {
    return "";
  }
  return asId(record.id ?? record._id);
}

function getVendor(value: Record<string, unknown>): VendorSummary | null {
  const vendor =
    asRecord(value.vendor) ??
    asRecord(value.vendorInfo) ??
    asRecord(value.vendorId);
  if (!vendor) {
    const name = asText(value.vendorName);
    const businessName = asText(value.businessName);
    if (!name && !businessName) {
      return null;
    }
    return {
      id: asId(value.vendorId),
      name: name || "Wedding professional",
      businessName,
      image: asText(value.vendorImage) || null,
    };
  }

  const id = asId(vendor.id ?? vendor._id ?? value.vendorId);
  return {
    id,
    name: asText(vendor.name, "Wedding professional"),
    businessName: asText(vendor.businessName),
    image: asText(vendor.image) || null,
  };
}

function normalizeService(value: unknown): WeddingService {
  const service = asRecord(value);
  if (!service) {
    throw new Error("The services API returned an invalid service.");
  }

  const id = asId(service.id ?? service._id);
  const priceValue = service.price;
  const price =
    typeof priceValue === "number"
      ? priceValue
      : typeof priceValue === "string"
        ? Number(priceValue)
        : Number.NaN;
  if (!id || !asText(service.serviceName ?? service.name) || !Number.isFinite(price)) {
    throw new Error("The services API returned incomplete service details.");
  }

  const images = Array.isArray(service.images)
    ? service.images
        .map((image) => {
          if (typeof image === "string") {
            return image;
          }
          const imageRecord = asRecord(image);
          return asText(imageRecord?.url ?? imageRecord?.src);
        })
        .filter(Boolean)
    : [];

  const vendor = getVendor(service);
  return {
    id,
    vendorId: asId(service.vendorId) || vendor?.id || "",
    serviceName: asText(service.serviceName ?? service.name),
    category: asText(service.category, "Wedding service"),
    description: asText(service.description),
    price,
    location: asText(service.location, "Location available on request"),
    images,
    vendor,
    status: asText(service.status, "pending"),
    isAvailable: service.isAvailable === true,
    createdAt: asText(service.createdAt),
  };
}

function findServiceList(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }
  const record = asRecord(payload);
  if (!record) {
    return null;
  }
  for (const key of ["services", "items", "results", "data"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (candidate && typeof candidate === "object") {
      const nested = findServiceList(candidate);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

export function normalizeServiceList(payload: unknown) {
  const list = findServiceList(payload);
  if (!list) {
    throw new Error("The services API returned an unexpected response.");
  }
  return list.map(normalizeService);
}

export function normalizeServiceDetails(payload: unknown) {
  let service = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = asRecord(service);
    if (!record || record.serviceName || record.name || record._id || record.id) {
      break;
    }
    if (record.service) {
      service = record.service;
    } else if (record.data && !Array.isArray(record.data)) {
      service = record.data;
    } else {
      break;
    }
  }
  return normalizeService(service);
}

async function requestServiceApi(path: string, signal?: AbortSignal) {
  return publicApiFetch(path, { signal });
}

export async function fetchServiceList(
  endpoint: string,
  signal?: AbortSignal,
) {
  let requestUrl: URL;
  try {
    requestUrl = resolveApiUrl(endpoint);
  } catch (error) {
    console.error("[services] Request URL configuration failed", {
      endpoint,
      envVar: "NEXT_PUBLIC_API_URL",
      error,
    });
    throw error;
  }

  let response: Response;
  try {
    response = await publicApiFetch(endpoint, { signal });
  } catch (error) {
    if (
      signal?.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw error;
    }
    throw error;
  }
  if (!response.ok) {
    const error = await responseError(response);
    console.error("[services] Request failed", {
      message: `[services] Request failed: ${response.url || requestUrl.href} (env: NEXT_PUBLIC_API_URL, status: ${response.status})`,
      error,
    });
    throw error;
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("[services] Invalid JSON response", {
      message: `[services] Invalid JSON response: ${response.url || requestUrl.href} (env: NEXT_PUBLIC_API_URL, status: ${response.status})`,
      error,
    });
    throw new Error(`Services API returned invalid JSON (${response.status}).`);
  }
  try {
    return normalizeServiceList(payload);
  } catch (error) {
    console.error("[services] Invalid services response", {
      message: `[services] Invalid services response: ${response.url || requestUrl.href} (env: NEXT_PUBLIC_API_URL, status: ${response.status})`,
      error,
    });
    throw error;
  }
}

export async function fetchServiceDetails(id: string, signal?: AbortSignal) {
  const response = await requestServiceApi(
    `/api/services/${encodeURIComponent(id)}`,
    signal,
  );
  if (!response.ok) {
    throw await responseError(response);
  }
  return normalizeServiceDetails(await response.json());
}

async function responseError(response: Response) {
  let message = `Unable to load services (${response.status}).`;
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.trim()) {
      message = body.message;
    }
  } catch {
    message = `Unable to load services (${response.status}).`;
  }
  return new Error(message);
}

export function serviceDetailsPath(id: string) {
  return `/services/${encodeURIComponent(id)}`;
}

export function serviceDetailsHref(id: string, isAuthenticated: boolean) {
  const path = serviceDetailsPath(id);
  return isAuthenticated
    ? path
    : `/sign-in?callbackURL=${encodeURIComponent(path)}`;
}

export function formatServicePrice(price: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    price,
  );
}
