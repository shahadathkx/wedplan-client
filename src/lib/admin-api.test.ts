import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrencyAmount, normalizeAdminStats } from "./admin-api";
import { normalizeVendorStats } from "./vendor-api";

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
