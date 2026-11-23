import assert from "node:assert/strict";
import test from "node:test";
import {
  adminApiFetch,
  formatCurrencyAmount,
  normalizeAdminStats,
} from "./admin-api";
import { dashboardPath } from "./roles";
import { normalizeVendorStats } from "./vendor-api";

test("dashboard routes are selected from the authenticated role", () => {
  assert.equal(dashboardPath("admin"), "/admin/dashboard");
  assert.equal(dashboardPath("vendor"), "/vendor/dashboard");
  assert.equal(dashboardPath("customer"), "/customer/dashboard");
});

test("admin API failures for unauthorized and forbidden responses are explicit", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = "https://api.example";

  try {
    for (const [status, expectedMessage] of [
      [401, "admin session has expired or is invalid"],
      [403, "Admin access is required"],
    ] as const) {
      globalThis.fetch = async (input) => {
        if (String(input) === "/api/auth/token") {
          return new Response(JSON.stringify({ token: "test-token" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ message: "Access denied." }), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      };

      await assert.rejects(
        adminApiFetch("/api/admin/stats"),
        new RegExp(expectedMessage, "i"),
      );
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  }
});

test("admin stats preserve paid revenue grouped by currency", () => {
  assert.deepEqual(
    normalizeAdminStats({
      stats: {
        revenueByCurrency: [
          { currency: "usd", amount: 1250 },
          { currency: "jpy", amount: 500 },
          { currency: "", amount: 10 },
          { currency: "eur", amount: "invalid" },
        ],
      },
    }).revenueByCurrency,
    [
      { currency: "USD", amount: 1250 },
      { currency: "JPY", amount: 500 },
    ],
  );
});

test("transaction amounts use each currency's minor-unit precision", () => {
  assert.equal(formatCurrencyAmount(1250, "USD"), "$12.50");
  assert.equal(formatCurrencyAmount(500, "JPY"), "¥500");
});

test("admin stats include the transaction total", () => {
  assert.equal(
    normalizeAdminStats({ stats: { totalTransactions: 7 } }).totalTransactions,
    7,
  );
});

test("vendor stats include accepted booking totals", () => {
  assert.equal(
    normalizeVendorStats({ stats: { acceptedBookings: 4 } }).acceptedBookings,
    4,
  );
});
