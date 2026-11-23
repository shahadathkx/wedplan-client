import assert from "node:assert/strict";
import test from "node:test";
import { apiFetch, SessionExpiredError } from "./api";

async function withMockRequest(
  callback: (requests: string[], logCalls: unknown[][]) => Promise<void>,
  fetchImplementation: typeof fetch,
): Promise<void> {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const previousFetch = globalThis.fetch;
  const previousInfo = console.info;
  const previousError = console.error;
  const requests: string[] = [];
  const logCalls: unknown[][] = [];
  process.env.NEXT_PUBLIC_API_URL = "https://wedplan-server-skhe.vercel.app";
  globalThis.fetch = async (input, init) => {
    requests.push(`${init?.method ?? "GET"} ${String(input)}`);
    return fetchImplementation(input, init);
  };
  console.info = (...args: unknown[]) => logCalls.push(args);
  console.error = () => undefined;

  try {
    await callback(requests, logCalls);
  } finally {
    globalThis.fetch = previousFetch;
    console.info = previousInfo;
    console.error = previousError;
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
}

test("booking reports token request URL and replaces raw token errors with session guidance", async () => {
  await withMockRequest(
    async (requests, logCalls) => {
      await assert.rejects(
        apiFetch("/api/bookings", { method: "POST" }),
        (error: unknown) =>
          error instanceof SessionExpiredError &&
          error.message === "Session expired, please sign in again",
      );
      assert.deepEqual(requests, ["GET /api/auth/token"]);
      assert.deepEqual(logCalls, [
        [
          "[booking-request]",
          {
            method: "GET",
            url: "/api/auth/token",
            status: 401,
          },
        ],
      ]);
    },
    async () =>
      new Response(
        JSON.stringify({ message: "User associated with token was not found" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      ),
  );
});

test("booking logs the API request URL and response status", async () => {
  await withMockRequest(
    async (requests, logCalls) => {
      const response = await apiFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: "service-id" }),
      });
      assert.equal(response.status, 401);
      assert.deepEqual(requests, [
        "GET /api/auth/token",
        "POST https://wedplan-server-skhe.vercel.app/api/bookings",
      ]);
      assert.deepEqual(logCalls, [
        [
          "[booking-request]",
          { method: "GET", url: "/api/auth/token", status: 200 },
        ],
        [
          "[booking-request]",
          {
            method: "POST",
            url: "https://wedplan-server-skhe.vercel.app/api/bookings",
            status: 401,
          },
        ],
      ]);
    },
    async (input) =>
      String(input) === "/api/auth/token"
        ? new Response(JSON.stringify({ token: "mock-token" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        : new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
  );
});
