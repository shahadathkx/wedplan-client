const authTokenPath = "/api/auth/token";

type ApiRequestInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export async function apiFetch(path: string, init: ApiRequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

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

  return fetch(new URL(path, apiUrl), {
    ...init,
    headers,
  });
}
