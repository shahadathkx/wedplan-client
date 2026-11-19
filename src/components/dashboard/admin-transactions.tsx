"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  adminApiFetch,
  normalizeAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin-api";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value || "Unknown"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatAmount(transaction: AdminTransaction) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: transaction.currency,
    }).format(transaction.amount);
  } catch {
    return `${transaction.currency} ${transaction.amount.toFixed(2)}`;
  }
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await adminApiFetch("/api/admin/transactions", { signal });
    return normalizeAdminTransactions(await response.json());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setTransactions(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load transactions.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [load]);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      setTransactions(await load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Payments</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Transactions</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Read-only subscription payment history from WedPlan vendors.
      </p>

      {error && (
        <div role="alert" className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void retry()} className="inline-flex items-center gap-2 font-semibold"><RefreshCw className="size-4" />Try again</button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3" aria-label="Loading transactions">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : transactions?.length ? (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-4">Vendor</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-4 font-semibold text-stone-800">{transaction.vendorName}</td>
                  <td className="px-5 py-4 capitalize text-stone-600">{transaction.plan}</td>
                  <td className="px-5 py-4 font-semibold text-stone-800">{formatAmount(transaction)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold capitalize text-stone-700">{transaction.status}</span></td>
                  <td className="px-5 py-4 text-stone-600">{formatDate(transaction.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-stone-900">No transactions yet</h2>
          <p className="mt-2 text-sm text-stone-600">Subscription payments will appear here.</p>
        </section>
      )}
    </div>
  );
}
