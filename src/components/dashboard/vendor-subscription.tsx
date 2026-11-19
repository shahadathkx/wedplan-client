"use client";

import { useState } from "react";
import { Check, Crown, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { vendorApiFetch } from "@/lib/vendor-api";

type CheckoutResponse = {
  url?: unknown;
  checkoutUrl?: unknown;
  data?: {
    url?: unknown;
    checkoutUrl?: unknown;
  };
};

function getCheckoutUrl(value: CheckoutResponse) {
  const candidate =
    value.checkoutUrl ??
    value.url ??
    value.data?.checkoutUrl ??
    value.data?.url;
  if (typeof candidate !== "string") {
    throw new Error("The checkout service did not return a payment link.");
  }
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("The checkout service returned an invalid payment link.");
  }
  if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") {
    throw new Error("The checkout service returned an untrusted payment link.");
  }
  return url.href;
}

export function VendorSubscription() {
  const { data: session, isPending } = authClient.useSession();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const isPremium = session?.user.subscriptionPlan === "premium";
  const expiresAt = session?.user.subscriptionExpiresAt
    ? new Date(session.user.subscriptionExpiresAt)
    : null;

  async function startCheckout() {
    setIsStartingCheckout(true);
    try {
      const response = await vendorApiFetch("/api/payments/checkout", {
        method: "POST",
      });
      const result = (await response.json()) as CheckoutResponse;
      window.location.assign(getCheckoutUrl(result));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout.",
      );
      setIsStartingCheckout(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Membership
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Plans for your business
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Choose the listing plan that fits the way you want to grow.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Your current plan</p>
          <p className="mt-1 font-serif text-2xl capitalize text-stone-900">
            {isPending ? "Loading..." : isPremium ? "Premium" : "Free"}
          </p>
        </div>
        {isPremium && expiresAt && !Number.isNaN(expiresAt.getTime()) && (
          <p className="mt-2 text-sm text-stone-500 sm:mt-0">
            Renewal date:{" "}
            {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
              expiresAt,
            )}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Free</h2>
              <p className="text-sm text-stone-500">A lovely start</p>
            </div>
          </div>
          <ul className="mt-7 space-y-4 text-sm text-stone-700">
            {[
              "Create a vendor profile",
              "List up to 3 available services",
              "Receive and manage booking requests",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-rose-200 bg-[#fff9f7] p-6 shadow-sm sm:p-8">
          <span className="absolute right-0 top-0 rounded-bl-2xl bg-rose-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
            Grow without limits
          </span>
          <div className="flex items-center gap-3 pr-32">
            <span className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
              <Crown className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Premium</h2>
              <p className="text-sm text-stone-500">For your next chapter</p>
            </div>
          </div>
          <ul className="mt-7 space-y-4 text-sm text-stone-700">
            {[
              "Everything in Free",
              "Unlimited available services",
              "More room to showcase your work",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-rose-800" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={isPremium || isStartingCheckout || isPending}
            onClick={() => void startCheckout()}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-800 px-5 text-sm font-semibold text-white transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStartingCheckout && <LoaderCircle className="size-4 animate-spin" />}
            {isPremium
              ? "You are on Premium"
              : isStartingCheckout
                ? "Opening secure checkout..."
                : "Upgrade to Premium"}
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-stone-500">
            Secure payment is handled by Stripe. Your plan activates after
            payment confirmation.
          </p>
        </section>
      </div>
    </div>
  );
}
