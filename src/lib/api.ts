const authTokenPath = "/api/auth/token";
const sessionExpiredMessage = "Session expired, please sign in again";

type ApiRequestInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export class SessionExpiredError extends Error {
  constructor() {
    super(sessionExpiredMessage);
    this.name = "SessionExpiredError";
  }
}

function isBookingSubmission(path: string, method: string): boolean {
  return path === "/api/bookings" && method.toUpperCase() === "POST";
}

function logBookingRequest(url: string, method: string, status: number | null): void {
  console.info("[booking-request]", { method, url, status });
}

function resolveBrowserUrl(path: string): string {
  return typeof window === "undefined"
    ? path
    : new URL(path, window.location.origin).href;
}

export class ApiRequestError extends Error {
  readonly url: string;
  readonly status: number | null;
  readonly causeError: unknown;

  constructor(url: string, causeError: unknown, status: number | null = null) {
    const statusText = status === null ? "network error" : `HTTP ${status}`;
    super(`${statusText}: ${causeError instanceof Error ? causeError.message : String(causeError)} (${url})`);
    this.name = "ApiRequestError";
    this.url = url;
    this.status = status;
    this.causeError = causeError;
  }
}

export function resolveApiUrl(path: string) {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Set it to the Express API origin.",
    );
  }

  const apiUrl = configured.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_URL is invalid. Set it to an absolute HTTP(S) API origin.",
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is invalid. Set it to an absolute HTTP(S) API origin.",
    );
  }

  const endpoint = path.startsWith("/") ? path : `/${path}`;
  try {
    return new URL(`${apiUrl}${endpoint}`);
  } catch (error) {
    throw new ApiRequestError(apiUrl, error);
  }
}

export async function publicApiFetch(
  path: string,
  init: RequestInit = {},
) {
  const url = resolveApiUrl(path);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
    });
  } catch (error) {
    if (
      init.signal?.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw error;
    }
    console.error("[api] Express API request failed", {
      url: url.href,
      envVar: "NEXT_PUBLIC_API_URL",
      error,
    });
    throw new ApiRequestError(url.href, error);
  }
}

export async function apiFetch(path: string, init: ApiRequestInit = {}) {
  const method = init.method ?? "GET";
  const isBooking = isBookingSubmission(path, method);
  const tokenUrl = resolveBrowserUrl(authTokenPath);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(authTokenPath, {
      credentials: "include",
      cache: "no-store",
      signal: init.signal,
    });
  } catch (error) {
    if (isBooking) {
      logBookingRequest(tokenUrl, "GET", null);
    }
    if (
      init.signal?.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw error;
    }
    console.error("[api] Authentication token request failed", {
      url: authTokenPath,
      error,
    });
    throw new SessionExpiredError();
  }

  if (!tokenResponse.ok) {
    if (isBooking) {
      logBookingRequest(tokenResponse.url || tokenUrl, "GET", tokenResponse.status);
    }
    console.error("[api] Authentication token request failed", {
      url: authTokenPath,
      status: tokenResponse.status,
    });
    throw new SessionExpiredError();
  }

  let payload: unknown;
  try {
    payload = await tokenResponse.json();
  } catch (error) {
    if (isBooking) {
      logBookingRequest(tokenResponse.url || tokenUrl, "GET", tokenResponse.status);
    }
    console.error("[api] Authentication token response was invalid", {
      url: authTokenPath,
      status: tokenResponse.status,
      error,
    });
    throw new SessionExpiredError();
  }

  if (isBooking) {
    logBookingRequest(tokenResponse.url || tokenUrl, "GET", tokenResponse.status);
  }

  const token =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as { token?: unknown }).token
      : undefined;
  if (typeof token !== "string" || !token) {
    throw new SessionExpiredError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  let apiUrl: string;
  try {
    apiUrl = resolveApiUrl(path).href;
  } catch (error) {
    if (isBooking) {
      logBookingRequest(path, method.toUpperCase(), null);
    }
    throw error;
  }

  try {
    const response = await publicApiFetch(path, {
      ...init,
      headers,
    });
    if (isBooking) {
      logBookingRequest(response.url || apiUrl, method.toUpperCase(), response.status);
    }
    return response;
  } catch (error) {
    if (isBooking) {
      logBookingRequest(apiUrl, method.toUpperCase(), null);
    }
    throw error;
  }
}
