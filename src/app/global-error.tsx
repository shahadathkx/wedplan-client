"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Root layout failed to render", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#faf7f4] px-5 py-20">
        <main
          role="alert"
          className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
            WedPlan
          </p>
          <h1 className="mt-3 font-serif text-3xl text-stone-900">
            We couldn&apos;t load this page
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Please try again. If the problem continues, come back in a moment.
          </p>
          {error.digest && (
            <p className="mt-3 text-xs text-stone-400">
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
