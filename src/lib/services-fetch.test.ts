import assert from "node:assert/strict";
import test from "node:test";
import { fetchServiceList, normalizeServiceList } from "./services";

test("featured service normalization preserves vendor profile and plan fields", () => {
  const [service] = normalizeServiceList([
    {
      _id: "service-1",
      vendorId: "vendor-1",
      serviceName: "Wedding photography",
      price: 1200,
      vendor: {
        id: "vendor-1",
        name: "Avery Smith",
        businessName: "Avery Studio",
        image: "https://lh3.googleusercontent.com/avatar",
        subscriptionPlan: "premium",
      },
    },
  ]);

  assert.deepEqual(service.vendor, {
    id: "vendor-1",
    name: "Avery Smith",
    businessName: "Avery Studio",
    image: "https://lh3.googleusercontent.com/avatar",
    subscriptionPlan: "premium",
  });
});

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
      (error: unknown) => {
        assert.equal(error instanceof Error, true);
        const thrownError = error as Error;
        assert.match(thrownError.message, /network error: Failed to fetch/);
        assert.match(
          thrownError.message,
          /https:\/\/api\.example\.test\/api\/services\/featured\?limit=6/,
        );
        return true;
      },
    );
    assert.equal(loggedErrors.length, 1);
    assert.equal(loggedErrors[0][0], "[api] Express API request failed");
    const details = loggedErrors[0][1] as {
      url: string;
      envVar: string;
      error: unknown;
    };
    assert.equal(details.url, "https://api.example.test/api/services/featured?limit=6");
    assert.equal(details.envVar, "NEXT_PUBLIC_API_URL");
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

test("service fetch strips a trailing slash and reports a missing env variable", async () => {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const previousFetch = globalThis.fetch;

  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/";
  globalThis.fetch = async (input) => {
    assert.equal(
      String(input),
      "https://api.example.test/api/services/featured?limit=6",
    );
    return new Response(JSON.stringify({ services: [] }), { status: 200 });
  };

  try {
    await fetchServiceList("/api/services/featured?limit=6");
  } finally {
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }

  delete process.env.NEXT_PUBLIC_API_URL;
  try {
    await assert.rejects(
      fetchServiceList("/api/services/featured?limit=6"),
      /NEXT_PUBLIC_API_URL is not configured/,
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
});
