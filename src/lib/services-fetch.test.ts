import assert from "node:assert/strict";
import test from "node:test";
import { fetchServiceList } from "./services";

test("service list fetch uses NEXT_PUBLIC_API_URL and treats an empty result as success", async () => {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const previousFetch = globalThis.fetch;
  const requestUrls: string[] = [];

  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
  globalThis.fetch = async (input) => {
    requestUrls.push(String(input));
    return new Response(JSON.stringify({ services: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    assert.deepEqual(
      await fetchServiceList("/api/services/featured?limit=6"),
      [],
    );
    assert.deepEqual(requestUrls, [
      "https://api.example.test/api/services/featured?limit=6",
    ]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
});

test("service fetch failure logs the exact request URL and original error", async () => {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const previousFetch = globalThis.fetch;
  const previousConsoleError = console.error;
  const networkError = new TypeError("Failed to fetch");
  const loggedErrors: unknown[][] = [];

  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
  globalThis.fetch = async () => {
    throw networkError;
  };
  console.error = (...args: unknown[]) => {
    loggedErrors.push(args);
  };

  try {
    await assert.rejects(
      fetchServiceList("/api/services/featured?limit=6"),
      networkError,
    );
    assert.equal(loggedErrors.length, 1);
    assert.equal(loggedErrors[0][0], "[services] Request failed");
    const details = loggedErrors[0][1] as {
      message: string;
      error: unknown;
    };
    assert.equal(
      details.message,
      "[services] Request failed: https://api.example.test/api/services/featured?limit=6 (env: NEXT_PUBLIC_API_URL)",
    );
    assert.equal(details.error, networkError);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousConsoleError;
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
});
