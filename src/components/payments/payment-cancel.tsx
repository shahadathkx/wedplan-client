import Link from "next/link";
import { CircleX } from "lucide-react";

export function PaymentCancel() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-5 py-16 sm:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-stone-100 text-stone-700">
          <CircleX className="size-8" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Subscription
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Payment cancelled
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone-600">
          No purchase was completed. You can return to your subscription page
          whenever you are ready.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/vendor/dashboard/subscription"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
          >
            Return to plans
          </Link>
          <Link
            href="/vendor/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
