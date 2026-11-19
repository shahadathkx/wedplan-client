"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type PollState =
  | { status: "loading"; message: string }
  | { status: "confirmed"; message: string }
  | { status: "pending"; message: string }
  | { status: "error"; message: string };

function getPlan(payload: unknown): string | null {
  let value = payload;
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof value !== "object" || value === null) {
      return null;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.subscriptionPlan === "string") {
      return record.subscriptionPlan;
    }
    if (typeof record.plan === "string") {
      return record.plan;
    }
    if (typeof record.data === "object" && record.data !== null) {
      value = record.data;
      continue;
    }
    if (typeof record.user === "object" && record.user !== null) {
      value = record.user;
      continue;
    }
    return null;
  }
  return null;
}

export function PaymentSuccess() {
  const [state, setState] = useState<PollState>({
    status: "loading",
    message: "Confirming your Premium subscription...",
  });

  const poll = useCallback(async () => {
    setState({
      status: "loading",
      message: "Confirming your Premium subscription...",
    });

    const startedAt = Date.now();
    const timeoutMs = 30_000;
    const intervalMs = 2_000;

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const response = await apiFetch("/api/me", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`The account could not be verified (${response.status}).`);
        }
        const payload = (await response.json()) as unknown;
        if (getPlan(payload)?.toLowerCase() === "premium") {
          await authClient.getSession();
          setState({
            status: "confirmed",
            message: "Your Premium subscription is active.",
          });
          return;
        }
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The payment confirmation could not be verified.",
        });
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    }

    setState({
      status: "pending",
      message:
        "Payment was received, but Premium activation is still processing. Please wait briefly and check again.",
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void poll();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [poll]);

  const confirmed = state.status === "confirmed";
  const loading = state.status === "loading";

  return (
    <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-5 py-16 sm:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${
            confirmed
              ? "bg-emerald-50 text-emerald-700"
              : state.status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-rose-50 text-rose-800"
          }`}
        >
          {loading ? (
            <LoaderCircle className="size-8 animate-spin" aria-label="Loading" />
          ) : confirmed ? (
            <CheckCircle2 className="size-8" />
          ) : (
            <XCircle className="size-8" />
          )}
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Subscription
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          {confirmed ? "Payment confirmed" : "Checking your payment"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone-600">
          {state.message}
        </p>
        <p className="mt-3 text-xs leading-5 text-stone-400">
          Your plan is granted only by the WedPlan server after payment
          verification.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {state.status !== "loading" && (
            <button
              type="button"
              onClick={() => void poll()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className="size-4" />
              Check again
            </button>
          )}
          <Link
            href="/vendor/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
