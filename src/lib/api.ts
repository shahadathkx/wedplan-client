const authTokenPath = "/api/auth/token";

type ApiRequestInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

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
  const tokenResponse = await fetch(authTokenPath, {
    credentials: "include",
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    throw new Error("Unable to retrieve an authentication token.");
  }

  const { token } = (await tokenResponse.json()) as { token?: string };
  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return publicApiFetch(path, {
    ...init,
    headers,
  });
}
