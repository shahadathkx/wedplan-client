import { apiFetch } from "@/lib/api";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  isBlocked: boolean;
  image: string | null;
  businessName: string;
  subscriptionPlan: string;
  createdAt: string;
};

export type AdminService = {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  vendorName: string;
  createdAt: string;
};

export type AdminTransaction = {
  id: string;
  vendorName: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
};

export type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalBookings: number;
  totalTransactions: number;
  revenueByCurrency: Array<{ currency: string; amount: number }>;
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

function findList(payload: unknown, keys: string[]): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }
  const record = asRecord(payload);
  if (!record) {
    return null;
  }
  for (const key of [...keys, "items", "results", "data"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (candidate && typeof candidate === "object") {
      const nested = findList(candidate, keys);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

export function normalizeAdminUsers(payload: unknown): AdminUser[] {
  const list = findList(payload, ["users"]);
  if (!list) {
    throw new Error("The users API returned an unexpected response.");
  }
  return list.map((value) => {
    const user = asRecord(value);
    if (!user) {
      throw new Error("The users API returned an invalid user.");
    }
    const id = asId(user.id ?? user._id);
    if (!id) {
      throw new Error("The users API returned a user without an ID.");
    }
    const role = asText(user.role, "customer").toLowerCase();
    return {
      id,
      name: asText(user.name, "Unnamed user"),
      email: asText(user.email),
      role: role === "vendor" || role === "admin" ? role : "customer",
      isBlocked: user.isBlocked === true,
      image: asText(user.image) || null,
      businessName: asText(user.businessName),
      subscriptionPlan: asText(user.subscriptionPlan, "free"),
      createdAt: asText(user.createdAt ?? user.created_at),
    };
  });
}

export function normalizeAdminServices(payload: unknown): AdminService[] {
  const list = findList(payload, ["services"]);
  if (!list) {
    throw new Error("The services API returned an unexpected response.");
  }
  return list.map((value) => {
    const service = asRecord(value);
    if (!service) {
      throw new Error("The services API returned an invalid service.");
    }
    const id = asId(service.id ?? service._id);
    if (!id) {
      throw new Error("The services API returned a service without an ID.");
    }
    const vendor = asRecord(service.vendor);
    const statusValue = asText(service.status, "pending").toLowerCase();
    const status =
      statusValue === "approved"
        ? "approved"
        : statusValue === "rejected"
          ? "rejected"
          : "pending";
    const priceValue = service.price;
    const price =
      typeof priceValue === "number"
        ? priceValue
        : typeof priceValue === "string"
          ? Number(priceValue)
          : 0;
    const images = Array.isArray(service.images)
      ? service.images
          .map((image) => {
            if (typeof image === "string") {
              return image;
            }
            const record = asRecord(image);
            return asText(record?.url ?? record?.src);
          })
          .filter(Boolean)
      : [];
    return {
      id,
      serviceName: asText(service.serviceName ?? service.name, "Wedding service"),
      category: asText(service.category, "Wedding service"),
      description: asText(service.description),
      price: Number.isFinite(price) ? price : 0,
      location: asText(service.location),
      images,
      status,
      isAvailable: service.isAvailable === true,
      vendorName: asText(
        service.vendorName ??
          vendor?.businessName ??
          vendor?.name,
        "Wedding professional",
      ),
      createdAt: asText(service.createdAt ?? service.created_at),
    };
  });
}

export function normalizeAdminTransactions(payload: unknown): AdminTransaction[] {
  const list = findList(payload, ["transactions", "payments"]);
  if (!list) {
    throw new Error("The transactions API returned an unexpected response.");
  }
  return list.map((value) => {
    const transaction = asRecord(value);
    if (!transaction) {
      throw new Error("The transactions API returned an invalid transaction.");
    }
    const id = asId(transaction.id ?? transaction._id);
    if (!id) {
      throw new Error("The transactions API returned a transaction without an ID.");
    }
    const vendor = asRecord(transaction.vendor);
    const amountValue = transaction.amount;
    const amount =
      typeof amountValue === "number"
        ? amountValue
        : typeof amountValue === "string"
          ? Number(amountValue)
          : 0;
    return {
      id,
      vendorName: asText(
        transaction.vendorName ??
          transaction.vendor ??
          vendor?.businessName ??
          vendor?.name,
        "Vendor",
      ),
      plan: asText(transaction.plan ?? transaction.subscriptionPlan, "Premium"),
      amount: Number.isFinite(amount) ? amount : 0,
      currency: asText(transaction.currency, "USD").toUpperCase(),
      status: asText(transaction.status, "unknown"),
      date: asText(
        transaction.date ??
          transaction.createdAt ??
          transaction.created_at ??
          transaction.paidAt,
      ),
    };
  });
}

function unwrapRecord(payload: unknown): Record<string, unknown> {
  let value = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = asRecord(value);
    if (!record) {
      break;
    }
    if (
      "totalUsers" in record ||
      "users" in record ||
      "totalServices" in record ||
      "pendingServices" in record ||
      "totalTransactions" in record
    ) {
      return record;
    }
    value = record.stats ?? record.data ?? value;
  }
  const record = asRecord(value);
  if (!record) {
    throw new Error("The stats API returned an unexpected response.");
  }
  return record;
}

export function normalizeAdminStats(payload: unknown): AdminStats {
  const stats = unwrapRecord(payload);
  const numberValue = (keys: string[]) => {
    for (const key of keys) {
      const value = stats[key];
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
  };
  const revenueByCurrency = Array.isArray(stats.revenueByCurrency)
    ? stats.revenueByCurrency.flatMap((value) => {
        const record = asRecord(value);
        const currency = asText(record?.currency).toUpperCase();
        const amount = record?.amount;
        if (
          !currency ||
          (typeof amount !== "number" && typeof amount !== "string") ||
          !Number.isFinite(Number(amount))
        ) {
          return [];
        }
        return [{ currency, amount: Number(amount) }];
      })
    : [];
  return {
    totalUsers: numberValue(["totalUsers", "usersCount", "userCount"]),
    totalVendors: numberValue(["totalVendors", "vendorCount", "vendors"]),
    totalCustomers: numberValue(["totalCustomers", "customerCount", "customers"]),
    totalServices: numberValue(["totalServices", "serviceCount", "services"]),
    pendingServices: numberValue(["pendingServices", "pendingServiceCount"]),
    totalBookings: numberValue(["totalBookings", "bookingCount", "bookings"]),
    totalTransactions: numberValue([
      "totalTransactions",
      "transactionCount",
      "transactions",
    ]),
    revenueByCurrency,
  };
}

export function formatCurrencyAmount(amountMinorUnits: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
    });
    const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amountMinorUnits / 10 ** fractionDigits);
  } catch {
    return `${normalizedCurrency} ${(amountMinorUnits / 100).toFixed(2)}`;
  }
}

export async function adminApiFetch(path: string, init: RequestInit = {}) {
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
    throw await adminResponseError(response);
  }
  return response;
}

async function adminResponseError(response: Response) {
  let message = `Request failed (${response.status}).`;
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.trim()) {
      message = body.message;
    }
  } catch {
    message = `Request failed (${response.status}).`;
  }
  if (response.status === 401) {
    message = `Your admin session has expired or is invalid. ${message}`;
  } else if (response.status === 403) {
    message = `Admin access is required for this action. ${message}`;
  }
  return new Error(message);
}
