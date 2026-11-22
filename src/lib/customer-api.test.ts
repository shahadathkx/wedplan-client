import assert from "node:assert/strict";
import test from "node:test";
import {
  cancelCustomerBooking,
  fetchCustomerBookings,
} from "./customer-api";

async function withMockApi(
  callback: (requests: Array<{ url: string; method: string }>) => Promise<void>,
) {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const previousFetch = globalThis.fetch;
  const requests: Array<{ url: string; method: string }> = [];
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url === "/api/auth/token") {
      return new Response(JSON.stringify({ token: "test-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    requests.push({ url, method });
    return new Response(JSON.stringify({ bookings: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await callback(requests);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
}

test("customer booking list uses the supported customer route", async () => {
  await withMockApi(async (requests) => {
    assert.deepEqual(await fetchCustomerBookings(), []);
    assert.deepEqual(requests, [
      {
        url: "https://api.example.test/api/customer/bookings",
        method: "GET",
      },
    ]);
  });
});

test("customer booking cancellation uses the supported PATCH route", async () => {
  await withMockApi(async (requests) => {
    await cancelCustomerBooking("booking/123");
    assert.deepEqual(requests, [
      {
        url: "https://api.example.test/api/customer/bookings/booking%2F123/cancel",
        method: "PATCH",
      },
    ]);
  });
});
